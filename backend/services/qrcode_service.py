"""
QR Code Generator Service

Provides comprehensive QR code generation capabilities including:
- URL to QR Code
- PDF link to QR Code
- Multi-URL (batch) QR Code
- Contact (vCard) QR Code
- Plain Text QR Code
- App Store link QR Code
- SMS QR Code
- Email QR Code
- Phone QR Code
- Multi-color QR options
- SVG, PNG, and PDF output formats
"""

import io
import json
import segno
from PIL import Image, ImageDraw
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from typing import Optional, List, Dict, Tuple, Union
from pathlib import Path
from dataclasses import dataclass
from enum import Enum
import base64


class QRType(Enum):
    """Types of QR codes supported"""
    URL = "url"
    PDF_LINK = "pdf_link"
    MULTI_URL = "multi_url"
    CONTACT = "contact"
    TEXT = "text"
    APP = "app"
    SMS = "sms"
    EMAIL = "email"
    PHONE = "phone"


class OutputFormat(Enum):
    """Output format for QR code"""
    PNG = "png"
    SVG = "svg"
    PDF = "pdf"


class ErrorCorrection(Enum):
    """Error correction levels for QR codes"""
    L = "L"  # ~7% damage tolerance
    M = "M"  # ~15% damage tolerance
    Q = "Q"  # ~25% damage tolerance
    H = "H"  # ~30% damage tolerance


@dataclass
class QRColor:
    """QR code color configuration"""
    foreground: str = "#000000"  # Hex color for QR modules
    background: str = "#FFFFFF"  # Hex color for background
    gradient_start: Optional[str] = None  # Gradient start color
    gradient_end: Optional[str] = None  # Gradient end color
    gradient_direction: str = "horizontal"  # horizontal, vertical, diagonal


@dataclass
class QRContent:
    """QR code content configuration"""
    qr_type: QRType
    data: Dict  # Type-specific data


# Preset color themes
COLOR_THEMES = {
    "classic": QRColor(foreground="#000000", background="#FFFFFF"),
    "blue": QRColor(foreground="#1E40AF", background="#EFF6FF"),
    "green": QRColor(foreground="#059669", background="#ECFDF5"),
    "red": QRColor(foreground="#DC2626", background="#FEF2F2"),
    "purple": QRColor(foreground="#7C3AED", background="#F5F3FF"),
    "orange": QRColor(foreground="#EA580C", background="#FFF7ED"),
    "pink": QRColor(foreground="#DB2777", background="#FDF2F8"),
    "teal": QRColor(foreground="#0D9488", background="#F0FDFA"),
    "black_white": QRColor(foreground="#000000", background="#FFFFFF"),
    "dark": QRColor(foreground="#1F2937", background="#FFFFFF"),
}


class QRCodeGenerator:
    """
    Comprehensive QR Code Generator with support for multiple types,
    colors, and output formats.
    """
    
    def __init__(self):
        """Initialize the QR code generator"""
        self.temp_dir = Path(__file__).parent.parent / "tmp"
        self.temp_dir.mkdir(parents=True, exist_ok=True)
    
    def _hex_to_rgb(self, hex_color: str) -> Tuple[int, int, int]:
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def _create_gradient(
        self, 
        width: int, 
        height: int, 
        color1: Tuple[int, int, int], 
        color2: Tuple[int, int, int],
        direction: str = "horizontal"
    ) -> Image.Image:
        """Create a gradient image"""
        base = Image.new('RGB', (width, height), color1)
        top = Image.new('RGB', (width, height), color2)
        mask = Image.new('L', (width, height))
        mask_data = []
        
        for y in range(height):
            for x in range(width):
                if direction == "horizontal":
                    ratio = x / width
                elif direction == "vertical":
                    ratio = y / height
                elif direction == "diagonal":
                    ratio = (x + y) / (width + height)
                else:
                    ratio = x / width
                mask_data.append(int(255 * ratio))
        
        mask.putdata(mask_data)
        base.paste(top, (0, 0), mask)
        return base
    
    def _generate_qr_base(
        self, 
        content: str, 
        error_correction: ErrorCorrection = ErrorCorrection.H,
        scale: int = 10
    ) -> segno.QRCode:
        """
        Generate base QR code with specified content and error correction.
        
        Args:
            content: The data to encode in the QR code
            error_correction: Error correction level
            scale: Scale factor for the QR code
        
        Returns:
            segno.QRCode object
        """
        qr = segno.make(content, error=error_correction.value)
        return qr
    
    def _render_qr_to_pil(
        self, 
        qr: segno.QRCode,
        size: int = 300,
        color: QRColor = None
    ) -> Image.Image:
        """
        Render QR code to PIL Image with custom colors.
        
        Args:
            qr: segno QR code object
            size: Output image size in pixels
            color: Color configuration
        
        Returns:
            PIL Image of the QR code
        """
        if color is None:
            color = QRColor()
        
        # Get QR code matrix and dimensions
        # In segno v1.x, use .matrix property (tuple of bytearrays)
        # Access elements as matrix[y][x] instead of matrix[y, x]
        qr_matrix = qr.matrix
        qr_width = len(qr_matrix)
        qr_height = len(qr_matrix[0]) if qr_width > 0 else qr_width
        
        # Calculate module size to fill the target size
        module_size = max(1, size // qr_width)
        actual_size = module_size * qr_width
        
        # Create base image
        qr_image = Image.new('RGB', (actual_size, actual_size), 
                            self._hex_to_rgb(color.background))
        draw = ImageDraw.Draw(qr_image)
        
        # Draw QR modules
        fg_rgb = self._hex_to_rgb(color.foreground)
        
        for y in range(qr_height):
            for x in range(qr_width):
                if qr_matrix[y][x]:  # Dark module - access bytearray element
                    draw.rectangle([
                        x * module_size,
                        y * module_size,
                        (x + 1) * module_size - 1,
                        (y + 1) * module_size - 1
                    ], fill=fg_rgb)
        
        # If gradient is specified, create gradient version
        if color.gradient_start and color.gradient_end:
            # Create new image with gradient
            qr_rgb = Image.new('RGB', (actual_size, actual_size), 
                              self._hex_to_rgb(color.background))
            gradient_draw = ImageDraw.Draw(qr_rgb)
            
            fg_rgb = self._hex_to_rgb(color.gradient_start)
            
            # Draw modules on gradient background
            for y in range(qr_height):
                for x in range(qr_width):
                    if qr_matrix[y][x]:  # Dark module - access bytearray element
                        gradient_draw.rectangle([
                            x * module_size,
                            y * module_size,
                            (x + 1) * module_size - 1,
                            (y + 1) * module_size - 1
                        ], fill=fg_rgb)
            
            qr_image = qr_rgb
        
        # Resize to exact target size if needed
        if actual_size != size:
            # Use compatibility for different Pillow versions
            # Image.Resampling.NEAREST was added in Pillow 9.0.0
            try:
                resize_method = Image.Resampling.NEAREST
            except AttributeError:
                resize_method = Image.NEAREST
            qr_image = qr_image.resize((size, size), resize_method)
        
        return qr_image
    
    def generate_url_qr(
        self, 
        url: str,
        size: int = 300,
        color: QRColor = None,
        error_correction: ErrorCorrection = ErrorCorrection.H
    ) -> Tuple[Image.Image, str]:
        """
        Generate QR code for URL.
        
        Args:
            url: The URL to encode
            size: Output image size in pixels
            color: Color configuration
            error_correction: Error correction level
        
        Returns:
            Tuple of (PIL Image, content string)
        """
        # Validate and normalize URL
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        content = url
        qr = self._generate_qr_base(content, error_correction)
        image = self._render_qr_to_pil(qr, size, color)
        
        return image, content
    
    def generate_pdf_link_qr(
        self, 
        pdf_url: str,
        size: int = 300,
        color: QRColor = None,
        error_correction: ErrorCorrection = ErrorCorrection.H
    ) -> Tuple[Image.Image, str]:
        """
        Generate QR code for PDF file link.
        
        Args:
            pdf_url: The URL to the PDF file
            size: Output image size in pixels
            color: Color configuration
            error_correction: Error correction level
        
        Returns:
            Tuple of (PIL Image, content string)
        """
        # Validate and normalize URL
        if not pdf_url.startswith(('http://', 'https://')):
            pdf_url = 'https://' + pdf_url
        
        content = pdf_url
        qr = self._generate_qr_base(content, error_correction)
        image = self._render_qr_to_pil(qr, size, color)
        
        return image, content
    
    def generate_multi_url_qr(
        self, 
        urls: List[Dict[str, str]],
        size: int = 300,
        color: QRColor = None,
        error_correction: ErrorCorrection = ErrorCorrection.H
    ) -> Tuple[Image.Image, str]:
        """
        Generate QR code for multiple URLs (stored as JSON).
        
        Args:
            urls: List of dicts with 'url' and 'label' keys
            size: Output image size in pixels
            color: Color configuration
            error_correction: Error correction level
        
        Returns:
            Tuple of (PIL Image, content string)
        """
        content = json.dumps(urls, ensure_ascii=False)
        qr = self._generate_qr_base(content, error_correction)
        image = self._render_qr_to_pil(qr, size, color)
        
        return image, content
    
    def generate_contact_qr(
        self,
        first_name: str = "",
        last_name: str = "",
        phone: str = "",
        email: str = "",
        organization: str = "",
        title: str = "",
        website: str = "",
        address: str = "",
        size: int = 300,
        color: QRColor = None,
        error_correction: ErrorCorrection = ErrorCorrection.H
    ) -> Tuple[Image.Image, str]:
        """
        Generate vCard QR code for contact information.
        
        Args:
            first_name: Contact's first name
            last_name: Contact's last name
            phone: Phone number
            email: Email address
            organization: Company/organization name
            title: Job title
            website: Website URL
            address: Physical address
            size: Output image size in pixels
            color: Color configuration
            error_correction: Error correction level
        
        Returns:
            Tuple of (PIL Image, content string)
        """
        vcard = f"""BEGIN:VCARD
VERSION:3.0
N:{last_name};{first_name};;;
FN:{first_name} {last_name}
ORG:{organization}
TITLE:{title}
TEL;TYPE=CELL:{phone}
TEL;TYPE=WORK:{phone}
EMAIL;TYPE=WORK:{email}
URL:{website}
ADR;TYPE=WORK:;;{address};;;; 
END:VCARD"""
        
        content = vcard
        qr = self._generate_qr_base(content, error_correction)
        image = self._render_qr_to_pil(qr, size, color)
        
        return image, content
    
    def generate_text_qr(
        self,
        text: str,
        size: int = 300,
        color: QRColor = None,
        error_correction: ErrorCorrection = ErrorCorrection.H
    ) -> Tuple[Image.Image, str]:
        """
        Generate QR code for plain text.
        
        Args:
            text: Plain text content
            size: Output image size in pixels
            color: Color configuration
            error_correction: Error correction level
        
        Returns:
            Tuple of (PIL Image, content string)
        """
        content = text
        qr = self._generate_qr_base(content, error_correction)
        image = self._render_qr_to_pil(qr, size, color)
        
        return image, content
    
    def generate_app_qr(
        self,
        app_id: str,
        store: str = "google",  # "google" or "apple"
        size: int = 300,
        color: QRColor = None,
        error_correction: ErrorCorrection = ErrorCorrection.H
    ) -> Tuple[Image.Image, str]:
        """
        Generate QR code for app store links.
        
        Args:
            app_id: App ID (package name for Google, bundle ID for Apple)
            store: App store ("google" or "apple")
            size: Output image size in pixels
            color: Color configuration
            error_correction: Error correction level
        
        Returns:
            Tuple of (PIL Image, content string)
        """
        if store.lower() == "google":
            content = f"https://play.google.com/store/apps/details?id={app_id}"
        else:
            content = f"https://apps.apple.com/app/id{app_id}"
        
        qr = self._generate_qr_base(content, error_correction)
        image = self._render_qr_to_pil(qr, size, color)
        
        return image, content
    
    def generate_sms_qr(
        self,
        phone: str,
        message: str = "",
        size: int = 300,
        color: QRColor = None,
        error_correction: ErrorCorrection = ErrorCorrection.H
    ) -> Tuple[Image.Image, str]:
        """
        Generate QR code for SMS.
        
        Args:
            phone: Phone number
            message: Pre-filled message
            size: Output image size in pixels
            color: Color configuration
            error_correction: Error correction level
        
        Returns:
            Tuple of (PIL Image, content string)
        """
        if message:
            content = f"SMS:{phone}?body={message}"
        else:
            content = f"SMS:{phone}"
        
        qr = self._generate_qr_base(content, error_correction)
        image = self._render_qr_to_pil(qr, size, color)
        
        return image, content
    
    def generate_email_qr(
        self,
        email: str,
        subject: str = "",
        body: str = "",
        size: int = 300,
        color: QRColor = None,
        error_correction: ErrorCorrection = ErrorCorrection.H
    ) -> Tuple[Image.Image, str]:
        """
        Generate QR code for email.
        
        Args:
            email: Email address
            subject: Email subject
            body: Email body
            size: Output image size in pixels
            color: Color configuration
            error_correction: Error correction level
        
        Returns:
            Tuple of (PIL Image, content string)
        """
        if subject or body:
            params = []
            if subject:
                params.append(f"subject={subject}")
            if body:
                params.append(f"body={body}")
            content = f"mailto:{email}?{'&'.join(params)}"
        else:
            content = f"mailto:{email}"
        
        qr = self._generate_qr_base(content, error_correction)
        image = self._render_qr_to_pil(qr, size, color)
        
        return image, content
    
    def generate_phone_qr(
        self,
        phone: str,
        size: int = 300,
        color: QRColor = None,
        error_correction: ErrorCorrection = ErrorCorrection.H
    ) -> Tuple[Image.Image, str]:
        """
        Generate QR code for phone number.
        
        Args:
            phone: Phone number
            size: Output image size in pixels
            color: Color configuration
            error_correction: Error correction level
        
        Returns:
            Tuple of (PIL Image, content string)
        """
        content = f"tel:{phone}"
        qr = self._generate_qr_base(content, error_correction)
        image = self._render_qr_to_pil(qr, size, color)
        
        return image, content
    
    def generate_qr(
        self,
        qr_type: QRType,
        data: Dict,
        size: int = 300,
        color: QRColor = None,
        error_correction: ErrorCorrection = ErrorCorrection.H
    ) -> Tuple[Image.Image, str]:
        """
        Unified QR code generation based on type.
        
        Args:
            qr_type: Type of QR code to generate
            data: Data dictionary with type-specific content
            size: Output image size in pixels
            color: Color configuration
            error_correction: Error correction level
        
        Returns:
            Tuple of (PIL Image, content string)
        """
        generators = {
            QRType.URL: lambda: self.generate_url_qr(
                data.get('url', ''), size, color, error_correction
            ),
            QRType.PDF_LINK: lambda: self.generate_pdf_link_qr(
                data.get('pdf_url', ''), size, color, error_correction
            ),
            QRType.MULTI_URL: lambda: self.generate_multi_url_qr(
                data.get('urls', []), size, color, error_correction
            ),
            QRType.CONTACT: lambda: self.generate_contact_qr(
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                phone=data.get('phone', ''),
                email=data.get('email', ''),
                organization=data.get('organization', ''),
                title=data.get('title', ''),
                website=data.get('website', ''),
                address=data.get('address', ''),
                size=size,
                color=color,
                error_correction=error_correction
            ),
            QRType.TEXT: lambda: self.generate_text_qr(
                data.get('text', ''), size, color, error_correction
            ),
            QRType.APP: lambda: self.generate_app_qr(
                data.get('app_id', ''), data.get('store', 'google'), 
                size, color, error_correction
            ),
            QRType.SMS: lambda: self.generate_sms_qr(
                data.get('phone', ''), data.get('message', ''), 
                size, color, error_correction
            ),
            QRType.EMAIL: lambda: self.generate_email_qr(
                data.get('email', ''), data.get('subject', ''), data.get('body', ''),
                size, color, error_correction
            ),
            QRType.PHONE: lambda: self.generate_phone_qr(
                data.get('phone', ''), size, color, error_correction
            ),
        }
        
        if qr_type not in generators:
            raise ValueError(f"Unsupported QR type: {qr_type}")
        
        return generators[qr_type]()
    
    def save_png(
        self, 
        image: Image.Image, 
        filename: str = None
    ) -> Tuple[Path, int]:
        """
        Save QR code as PNG.
        
        Args:
            image: PIL Image of QR code
            filename: Optional filename (auto-generated if not provided)
        
        Returns:
            Tuple of (Path to file, file size in bytes)
        """
        if filename is None:
            filename = f"qrcode_{self._generate_id()}.png"
        
        filepath = self.temp_dir / filename
        image.save(filepath, 'PNG', optimize=True)
        
        return filepath, filepath.stat().st_size
    
    def save_svg(
        self, 
        content: str, 
        filename: str = None,
        color: QRColor = None
    ) -> Tuple[Path, int]:
        """
        Save QR code as SVG.
        
        Args:
            content: QR code content
            filename: Optional filename (auto-generated if not provided)
            color: Color configuration
        
        Returns:
            Tuple of (Path to file, file size in bytes)
        """
        if filename is None:
            filename = f"qrcode_{self._generate_id()}.svg"
        
        # Generate SVG using segno
        qr = segno.make(content, error='H')
        
        if color and color.foreground != "#000000":
            # Custom color for SVG
            svg_out = io.StringIO()
            qr.save(
                svg_out, 
                kind='svg',
                scale=3,
                dark=color.foreground,
                light=color.background,
                title="QR Code"
            )
            svg_content = svg_out.getvalue()
        else:
            svg_out = io.StringIO()
            qr.save(
                svg_out, 
                kind='svg',
                scale=3,
                title="QR Code"
            )
            svg_content = svg_out.getvalue()
        
        filepath = self.temp_dir / filename
        filepath.write_text(svg_content)
        
        return filepath, filepath.stat().st_size
    
    def save_pdf(
        self, 
        image: Image.Image, 
        filename: str = None,
        page_size: Tuple = letter
    ) -> Tuple[Path, int]:
        """
        Save QR code as PDF.
        
        Args:
            image: PIL Image of QR code
            filename: Optional filename (auto-generated if not provided)
            page_size: PDF page size (default: letter)
        
        Returns:
            Tuple of (Path to file, file size in bytes)
        """
        if filename is None:
            filename = f"qrcode_{self._generate_id()}.pdf"
        
        filepath = self.temp_dir / filename
        
        # Create PDF
        c = canvas.Canvas(str(filepath), pagesize=page_size)
        width, height = page_size
        
        # Center QR code on page
        img_width, img_height = image.size
        x = (width - img_width) / 2
        y = (height - img_height) / 2
        
        # Convert PIL image to ReportLab ImageReader
        img_buffer = io.BytesIO()
        image.save(img_buffer, 'PNG')
        img_buffer.seek(0)
        
        c.drawImage(ImageReader(img_buffer), x, y, width=img_width, height=img_height)
        c.save()
        
        return filepath, filepath.stat().st_size
    
    def _generate_id(self) -> str:
        """Generate unique ID for files"""
        import uuid
        return str(uuid.uuid4())[:8]
    
    def get_options(self) -> Dict:
        """
        Get available options for QR code generation.
        
        Returns:
            Dictionary with available options
        """
        return {
            "qr_types": [t.value for t in QRType],
            "output_formats": [f.value for f in OutputFormat],
            "error_correction_levels": [e.value for e in ErrorCorrection],
            "color_themes": list(COLOR_THEMES.keys()),
            "default_sizes": [200, 300, 400, 500, 600, 800, 1000],
            "default_size": 300,
            "max_size": 2000
        }


# Global instance
qrcode_generator = QRCodeGenerator()

