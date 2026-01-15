"""
Watermark PDF Service Module

This module provides functions to add text and image watermarks to PDF files.
Supports various customization options including rotation, opacity, position, etc.
"""

from pathlib import Path
from typing import List, Optional, Tuple
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.colors import Color
from reportlab.lib import colors as reportlab_colors
from PIL import Image
import io
import math
import uuid
import os

# Define TEMP_DIR - should match the one in server.py
TEMP_DIR = Path(os.getenv("TEMP_DIR", Path.cwd() / "tmp" / "file_conversions"))
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Watermark position constants
POSITION_CENTER = "center"
POSITION_TOP_LEFT = "top_left"
POSITION_TOP_RIGHT = "top_right"
POSITION_BOTTOM_LEFT = "bottom_left"
POSITION_BOTTOM_RIGHT = "bottom_right"
POSITION_TILED = "tiled"


def _hex_to_rgb(hex_color: str) -> Tuple[float, float, float]:
    """Convert hex color string to RGB tuple (0-1 range)."""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 6:
        r = int(hex_color[0:2], 16) / 255.0
        g = int(hex_color[2:4], 16) / 255.0
        b = int(hex_color[4:6], 16) / 255.0
        return (r, g, b)
    elif len(hex_color) == 3:
        r = int(hex_color[0], 16) / 15.0
        g = int(hex_color[1], 16) / 15.0
        b = int(hex_color[2], 16) / 15.0
        return (r, g, b)
    else:
        # Default to gray
        return (0.5, 0.5, 0.5)


def _get_page_size(page) -> Tuple[float, float]:
    """Get page dimensions in points."""
    try:
        # Try to get the page size from mediabox
        mediabox = page.mediabox
        width = float(mediabox.width)
        height = float(mediabox.height)
        return (width, height)
    except Exception:
        # Default to Letter size (8.5 x 11 inches = 612 x 792 points)
        return (612.0, 792.0)


def _calculate_position(
    page_width: float,
    page_height: float,
    watermark_width: float,
    watermark_height: float,
    position: str,
    margin_x: float = 50,
    margin_y: float = 50
) -> Tuple[float, float]:
    """Calculate watermark position on page."""
    if position == POSITION_TOP_LEFT:
        return (margin_x, page_height - watermark_height - margin_y)
    elif position == POSITION_TOP_RIGHT:
        return (page_width - watermark_width - margin_x, page_height - watermark_height - margin_y)
    elif position == POSITION_BOTTOM_LEFT:
        return (margin_x, margin_y)
    elif position == POSITION_BOTTOM_RIGHT:
        return (page_width - watermark_width - margin_x, margin_y)
    elif position == POSITION_TILED:
        return (margin_x, margin_y)
    else:  # POSITION_CENTER or default
        return ((page_width - watermark_width) / 2, (page_height - watermark_height) / 2)


def _create_text_watermark_page(
    text: str,
    font_name: str,
    font_size: int,
    color_rgb: Tuple[float, float, float],
    outline_rgb: Tuple[float, float, float],
    opacity: float,
    rotation: float,
    page_width: float,
    page_height: float,
    position: str,
    margin_x: float,
    margin_y: float,
    outline: bool,
    is_tiled: bool = False
):
    """
    Create a single watermark page with the text.
    
    Returns:
        PdfReader object containing the watermark page
    """
    watermark_packet = io.BytesIO()
    watermark_canvas = canvas.Canvas(watermark_packet, pagesize=(page_width, page_height))
    
    # Set transparency
    watermark_canvas.setFillColor(Color(color_rgb[0], color_rgb[1], color_rgb[2], alpha=opacity))
    
    # Set font
    try:
        watermark_canvas.setFont(font_name, font_size)
    except Exception:
        # Fallback to Helvetica-Bold if font not available
        try:
            watermark_canvas.setFont("Helvetica-Bold", font_size)
        except Exception:
            watermark_canvas.setFont("Helvetica", font_size)
    
    # Calculate text size for positioning
    text_width = watermark_canvas.stringWidth(text, font_name, font_size)
    text_height = font_size  # Approximate text height
    
    if is_tiled:
        # Create tiled watermark pattern
        watermark_canvas.saveState()
        
        # Calculate number of tiles based on page diagonal
        diag = math.sqrt(page_width**2 + page_height**2)
        num_tiles = int(diag / (font_size * 4)) + 2
        
        for i in range(-num_tiles, num_tiles):
            for j in range(-num_tiles, num_tiles):
                x = page_width/2 + i * font_size * 6
                y = page_height/2 + j * font_size * 4
                
                watermark_canvas.saveState()
                watermark_canvas.translate(x, y)
                watermark_canvas.rotate(rotation)
                
                if outline:
                    watermark_canvas.setStrokeColor(Color(outline_rgb[0], outline_rgb[1], outline_rgb[2], alpha=1))
                    watermark_canvas.setLineWidth(0.5)
                    watermark_canvas.drawCentredString(0, 0, text)
                else:
                    watermark_canvas.drawCentredString(0, 0, text)
                
                watermark_canvas.restoreState()
        
        watermark_canvas.restoreState()
    else:
        # Single watermark position - calculate position FIRST, then apply rotation
        x, y = _calculate_position(
            page_width, page_height, text_width, text_height,
            position, margin_x, margin_y
        )
        
        # Calculate center point for rotation
        center_x = x + text_width / 2
        center_y = y + text_height / 2
        
        # Apply transformations: translate to center, rotate, translate back
        watermark_canvas.saveState()
        watermark_canvas.translate(center_x, center_y)
        watermark_canvas.rotate(rotation)
        watermark_canvas.translate(-center_x, -center_y)
        
        if outline:
            watermark_canvas.setStrokeColor(Color(outline_rgb[0], outline_rgb[1], outline_rgb[2], alpha=1))
            watermark_canvas.setLineWidth(0.5)
            watermark_canvas.drawCentredString(x + text_width/2, y, text)
        else:
            watermark_canvas.drawCentredString(x, y, text)
        
        watermark_canvas.restoreState()
    
    watermark_canvas.save()
    watermark_packet.seek(0)
    return PdfReader(watermark_packet)


def add_text_watermark(
    pdf_path: Path,
    text: str,
    font_name: str = "Helvetica-Bold",
    font_size: int = 48,
    color: str = "#808080",
    opacity: float = 0.3,
    rotation: float = 45,
    position: str = POSITION_CENTER,
    first_page_only: bool = False,
    page_ranges: Optional[str] = None,
    margin_x: float = 50,
    margin_y: float = 50,
    outline: bool = False,
    outline_color: str = "#FFFFFF"
) -> Path:
    """
    Add text watermark to PDF.
    
    Args:
        pdf_path: Path to input PDF
        text: Watermark text
        font_name: Font name (Helvetica, Helvetica-Bold, Times-Roman, etc.)
        font_size: Font size in points
        color: Hex color string (e.g., "#FF0000" or "#F00")
        opacity: Opacity (0-1, where 1 is fully opaque)
        rotation: Rotation angle in degrees
        position: Position on page (center, top_left, top_right, bottom_left, bottom_right, tiled)
        first_page_only: If True, only add watermark to first page
        page_ranges: Optional page ranges (e.g., "1-3,5,7-9")
        margin_x: Horizontal margin for non-center positions
        margin_y: Vertical margin for non-center positions
        outline: Whether to add outline to text
        outline_color: Outline color
        
    Returns:
        Path to watermarked PDF
    """
    # Validate inputs
    if not pdf_path or not pdf_path.exists():
        raise ValueError(f"PDF file not found: {pdf_path}")
    
    if not text or not text.strip():
        raise ValueError("Watermark text cannot be empty")
    
    # Read the input PDF
    reader = PdfReader(str(pdf_path))
    
    # Check if PDF is encrypted
    if reader.is_encrypted:
        raise ValueError(
            "The PDF file is encrypted/protected. Please unlock it first using the "
            "/api/pdf/unlock endpoint before adding a watermark."
        )
    
    writer = PdfWriter()
    
    # Calculate RGB color
    r, g, b = _hex_to_rgb(color)
    outline_r, outline_g, outline_b = _hex_to_rgb(outline_color) if outline else (0, 0, 0)
    
    # Convert page ranges if provided
    pages_to_watermark = None
    if page_ranges:
        pages_to_watermark = set()
        ranges = page_ranges.split(',')
        for range_str in ranges:
            range_str = range_str.strip()
            if '-' in range_str:
                parts = range_str.split('-')
                if len(parts) == 2:
                    try:
                        start = int(parts[0])
                        end = int(parts[1])
                        for page_num in range(start - 1, min(end, len(reader.pages))):
                            pages_to_watermark.add(page_num)
                    except ValueError:
                        continue
            else:
                try:
                    page_num = int(range_str) - 1
                    if 0 <= page_num < len(reader.pages):
                        pages_to_watermark.add(page_num)
                except ValueError:
                    continue
    
    # Create watermark overlay for each source page
    for page_num, page in enumerate(reader.pages):
        page_width, page_height = _get_page_size(page)
        
        # Create watermark overlay
        watermark_pdf = _create_text_watermark_page(
            text=text,
            font_name=font_name,
            font_size=font_size,
            color_rgb=(r, g, b),
            outline_rgb=(outline_r, outline_g, outline_b),
            opacity=opacity,
            rotation=rotation,
            page_width=page_width,
            page_height=page_height,
            position=position,
            margin_x=margin_x,
            margin_y=margin_y,
            outline=outline,
            is_tiled=(position == POSITION_TILED)
        )
        
        watermark_page = watermark_pdf.pages[0]
        
        # Add watermark to page
        if first_page_only:
            if page_num == 0:
                page.merge_page(watermark_page)
        elif pages_to_watermark is not None:
            if page_num in pages_to_watermark:
                page.merge_page(watermark_page)
        else:
            page.merge_page(watermark_page)
        
        writer.add_page(page)
    
    # Save output
    output_path = TEMP_DIR / f"{uuid.uuid4()}_watermarked.pdf"
    with open(output_path, "wb") as output_file:
        writer.write(output_file)
    
    return output_path


def _create_image_watermark_page(
    image_path: Path,
    opacity: float,
    rotation: float,
    page_width: float,
    page_height: float,
    watermark_width: float,
    watermark_height: float,
    position: str,
    margin_x: float,
    margin_y: float
):
    """
    Create a single watermark page with the image.
    
    Returns:
        PdfReader object containing the watermark page
    """
    watermark_packet = io.BytesIO()
    watermark_canvas = canvas.Canvas(watermark_packet, pagesize=(page_width, page_height))
    
    # Calculate position
    x, y = _calculate_position(
        page_width, page_height, watermark_width, watermark_height,
        position, margin_x, margin_y
    )
    
    # Save state before transformations
    watermark_canvas.saveState()
    
    # Apply rotation around center of watermark
    center_x = x + watermark_width / 2
    center_y = y + watermark_height / 2
    watermark_canvas.translate(center_x, center_y)
    watermark_canvas.rotate(rotation)
    watermark_canvas.translate(-watermark_width / 2, -watermark_height / 2)
    
    # Draw image with transparency
    try:
        # Draw image using reportlab's drawImage
        # The mask='auto' parameter enables transparency for images with alpha channel
        watermark_canvas.drawImage(
            str(image_path),
            0, 0,
            width=watermark_width,
            height=watermark_height,
            mask='auto',
            preserveAspectRatio=True
        )
    except Exception as e:
        print(f"Error drawing image watermark: {e}")
        # Fallback: draw a rectangle with the watermark color
        watermark_canvas.setFillColor(reportlab_colors.Color(0.5, 0.5, 0.5, alpha=opacity))
        watermark_canvas.rect(0, 0, watermark_width, watermark_height, fill=1, stroke=0)
    
    watermark_canvas.restoreState()
    watermark_canvas.save()
    watermark_packet.seek(0)
    return PdfReader(watermark_packet)


def add_image_watermark(
    pdf_path: Path,
    image_path: Path,
    opacity: float = 0.3,
    position: str = POSITION_CENTER,
    scale: float = 0.5,
    rotation: float = 0,
    first_page_only: bool = False,
    page_ranges: Optional[str] = None,
    margin_x: float = 50,
    margin_y: float = 50
) -> Path:
    """
    Add image/logo watermark to PDF.
    
    Args:
        pdf_path: Path to input PDF
        image_path: Path to watermark image
        opacity: Opacity (0-1)
        position: Position on page (center, top_left, top_right, bottom_left, bottom_right, tiled)
        scale: Scale factor for image (0.1 = 10% of original size)
        rotation: Rotation angle in degrees
        first_page_only: If True, only add watermark to first page
        page_ranges: Optional page ranges (e.g., "1-3,5,7-9")
        margin_x: Horizontal margin for non-center positions
        margin_y: Vertical margin for non-center positions
        
    Returns:
        Path to watermarked PDF
    """
    # Validate inputs
    if not pdf_path or not pdf_path.exists():
        raise ValueError(f"PDF file not found: {pdf_path}")
    
    if not image_path or not image_path.exists():
        raise ValueError(f"Image file not found: {image_path}")
    
    # Read the input PDF
    reader = PdfReader(str(pdf_path))
    
    # Check if PDF is encrypted
    if reader.is_encrypted:
        raise ValueError(
            "The PDF file is encrypted/protected. Please unlock it first using the "
            "/api/pdf/unlock endpoint before adding a watermark."
        )
    
    writer = PdfWriter()
    
    # Load and prepare watermark image
    img = Image.open(image_path)
    
    # Convert to RGBA if necessary for transparency support
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get original dimensions
    orig_width, orig_height = img.size
    
    if orig_width == 0 or orig_height == 0:
        raise ValueError("Image has invalid dimensions")
    
    # Save image to a temporary file for reportlab to use
    temp_img_path = None
    try:
        temp_img_path = TEMP_DIR / f"temp_watermark_{uuid.uuid4()}.png"
        img.save(str(temp_img_path), "PNG")
        
        # Convert page ranges if provided
        pages_to_watermark = None
        if page_ranges:
            pages_to_watermark = set()
            ranges = page_ranges.split(',')
            for range_str in ranges:
                range_str = range_str.strip()
                if '-' in range_str:
                    parts = range_str.split('-')
                    if len(parts) == 2:
                        try:
                            start = int(parts[0])
                            end = int(parts[1])
                            for page_num in range(start - 1, min(end, len(reader.pages))):
                                pages_to_watermark.add(page_num)
                        except ValueError:
                            continue
                else:
                    try:
                        page_num = int(range_str) - 1
                        if 0 <= page_num < len(reader.pages):
                            pages_to_watermark.add(page_num)
                    except ValueError:
                        continue
        
        # Create watermark for each source page
        for page_num, page in enumerate(reader.pages):
            page_width, page_height = _get_page_size(page)
            
            # Calculate watermark dimensions based on page size and scale
            max_watermark_width = page_width * scale
            max_watermark_height = page_height * scale
            
            # Maintain aspect ratio
            aspect_ratio = orig_width / orig_height
            
            if orig_width >= orig_height:
                # Landscape-ish
                watermark_width = min(max_watermark_width, max_watermark_width)
                watermark_height = watermark_width / aspect_ratio
            else:
                # Portrait-ish
                watermark_height = min(max_watermark_height, max_watermark_height)
                watermark_width = watermark_height * aspect_ratio
            
            # Ensure minimum size
            watermark_width = max(watermark_width, 50)
            watermark_height = max(watermark_height, 20)
            
            # Create watermark overlay
            watermark_pdf = _create_image_watermark_page(
                image_path=temp_img_path,
                opacity=opacity,
                rotation=rotation,
                page_width=page_width,
                page_height=page_height,
                watermark_width=watermark_width,
                watermark_height=watermark_height,
                position=position,
                margin_x=margin_x,
                margin_y=margin_y
            )
            
            watermark_page = watermark_pdf.pages[0]
            
            # Add watermark to page
            if first_page_only:
                if page_num == 0:
                    page.merge_page(watermark_page)
            elif pages_to_watermark is not None:
                if page_num in pages_to_watermark:
                    page.merge_page(watermark_page)
            else:
                page.merge_page(watermark_page)
            
            writer.add_page(page)
        
        # Save output
        output_path = TEMP_DIR / f"{uuid.uuid4()}_watermarked.pdf"
        with open(output_path, "wb") as output_file:
            writer.write(output_file)
        
        return output_path
        
    finally:
        # Clean up temporary image file
        if temp_img_path and temp_img_path.exists():
            try:
                temp_img_path.unlink()
            except Exception:
                pass


def add_multiple_watermarks(
    pdf_path: Path,
    watermarks: List[dict],
    output_path: Optional[Path] = None
) -> Path:
    """
    Apply multiple watermarks to a PDF.
    
    Args:
        pdf_path: Path to input PDF
        watermarks: List of watermark configurations. Each dict should have:
            - type: "text" or "image"
            - For text: text, font_name, font_size, color, opacity, rotation, position
            - For image: image_path, opacity, scale, rotation, position
        output_path: Optional custom output path
        
    Returns:
        Path to watermarked PDF
    """
    # Start with the original PDF
    current_pdf_path = pdf_path
    
    # Apply each watermark sequentially
    for i, watermark in enumerate(watermarks):
        watermark_type = watermark.get('type', 'text')
        
        if watermark_type == 'text':
            current_pdf_path = add_text_watermark(
                current_pdf_path,
                text=watermark['text'],
                font_name=watermark.get('font_name', 'Helvetica-Bold'),
                font_size=watermark.get('font_size', 48),
                color=watermark.get('color', '#808080'),
                opacity=watermark.get('opacity', 0.3),
                rotation=watermark.get('rotation', 45),
                position=watermark.get('position', POSITION_CENTER),
                first_page_only=watermark.get('first_page_only', False),
                page_ranges=watermark.get('page_ranges'),
                margin_x=watermark.get('margin_x', 50),
                margin_y=watermark.get('margin_y', 50),
                outline=watermark.get('outline', False),
                outline_color=watermark.get('outline_color', '#FFFFFF')
            )
        elif watermark_type == 'image':
            current_pdf_path = add_image_watermark(
                current_pdf_path,
                image_path=watermark['image_path'],
                opacity=watermark.get('opacity', 0.3),
                position=watermark.get('position', POSITION_CENTER),
                scale=watermark.get('scale', 0.5),
                rotation=watermark.get('rotation', 0),
                first_page_only=watermark.get('first_page_only', False),
                page_ranges=watermark.get('page_ranges'),
                margin_x=watermark.get('margin_x', 50),
                margin_y=watermark.get('margin_y', 50)
            )
    
    return current_pdf_path

