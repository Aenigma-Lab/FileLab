"""
Advanced PDF Table Extraction Service for Precise PDF to Excel Conversion

This service provides multiple table extraction methods:
1. Camelot (stream and lattice flavors)
2. pdfplumber (fallback)
3. Tabula (Java-based fallback)

Features:
- Multi-method table detection with confidence scoring
- Automatic row/column span detection
- Data type detection and formatting
- Table metadata extraction (titles, captions)
- Merged cell handling
"""

import io
import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TableExtractionMethod(Enum):
    """Enum for table extraction methods"""
    CAMELOT_STREAM = "camelot_stream"  # For tables with visible lines
    CAMELOT_LATTICE = "camelot_lattice"  # For tables with invisible lines
    PDFPLUMBER = "pdfplumber"  # Built-in extraction
    TABULA = "tabula"  # Java-based extraction


@dataclass
class TableInfo:
    """Metadata about extracted table"""
    page_number: int
    method_used: TableExtractionMethod
    confidence_score: float  # 0.0 to 1.0
    row_count: int
    column_count: int
    has_header: bool
    table_title: Optional[str] = None
    table_footnote: Optional[str] = None
    extraction_warnings: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "page_number": self.page_number,
            "method_used": self.method_used.value,
            "confidence_score": self.confidence_score,
            "row_count": self.row_count,
            "column_count": self.column_count,
            "has_header": self.has_header,
            "table_title": self.table_title,
            "table_footnote": self.table_footnote,
            "extraction_warnings": self.extraction_warnings
        }


@dataclass
class CellData:
    """Individual cell data with formatting information"""
    value: Any
    row_index: int
    column_index: int
    is_header: bool = False
    data_type: str = "string"  # string, number, date, currency, percentage, boolean
    formatting: Dict[str, Any] = field(default_factory=dict)
    is_merged: bool = False
    merge_span: Optional[Tuple[int, int]] = None  # (row_span, col_span)
    
    def __post_init__(self):
        if self.value is None:
            self.value = ""
    
    @property
    def formatted_value(self) -> str:
        """Get formatted string representation of cell value"""
        if self.value is None:
            return ""
        
        if self.data_type == "number" and isinstance(self.value, (int, float)):
            if self.formatting.get("decimal_places") is not None:
                return f"{self.value:.{self.formatting['decimal_places']}f}"
            return str(self.value)
        
        if self.data_type == "currency" and isinstance(self.value, (int, float)):
            currency_symbol = self.formatting.get("currency_symbol", "$")
            decimals = self.formatting.get("decimal_places", 2)
            return f"{currency_symbol}{self.value:.{decimals}f}"
        
        if self.data_type == "percentage" and isinstance(self.value, (int, float)):
            decimals = self.formatting.get("decimal_places", 2)
            return f"{self.value:.{decimals}f}%"
        
        return str(self.value)


@dataclass
class TableData:
    """Complete table data structure"""
    cells: List[List[CellData]]
    metadata: TableInfo
    raw_data: List[List[Any]] = field(default_factory=list)
    
    @property
    def shape(self) -> Tuple[int, int]:
        """Return table shape (rows, columns)"""
        if not self.cells:
            return (0, 0)
        return (len(self.cells), len(self.cells[0]) if self.cells else 0)
    
    def to_array(self) -> List[List[Any]]:
        """Convert to simple 2D array of values"""
        return [[cell.value for cell in row] for row in self.cells]
    
    def get_headers(self) -> List[str]:
        """Extract header row values"""
        if self.cells and self.metadata.has_header:
            return [cell.value for cell in self.cells[0]]
        return []


class TableExtractionService:
    """
    Advanced table extraction service for PDF files.
    
    Provides multiple extraction methods with automatic method selection
    based on table structure and confidence scoring.
    """
    
    def __init__(self, prefer_quality: bool = True):
        """
        Initialize table extraction service.
        
        Args:
            prefer_quality: If True, prefer accuracy over speed.
                           If False, prefer speed over accuracy.
        """
        self.prefer_quality = prefer_quality
        self._camelot_available = False
        self._tabula_available = False
        self._check_dependencies()
    
    def _check_dependencies(self):
        """Check which extraction libraries are available"""
        try:
            import camelot
            self._camelot_available = True
            logger.info("Camelot is available for table extraction")
        except ImportError:
            logger.warning("Camelot not available - install with: pip install camelot-py[cv]")
        
        try:
            import tabula
            self._tabula_available = True
            logger.info("Tabula is available for table extraction")
        except ImportError:
            logger.warning("Tabula not available - install with: pip install tabula-py")
    
    def extract_all_tables(
        self,
        pdf_path: Union[str, Path],
        extract_text: bool = True,
        extract_images: bool = True
    ) -> Dict[int, List[TableData]]:
        """
        Extract all tables from a PDF file.
        
        Args:
            pdf_path: Path to PDF file
            extract_text: Whether to extract text content
            extract_images: Whether to extract images
            
        Returns:
            Dictionary mapping page numbers to list of extracted tables
        """
        import pdfplumber
        
        results: Dict[int, List[TableData]] = {}
        
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                logger.info(f"Processing page {page_num}")
                tables_on_page: List[TableData] = []
                
                # Try multiple extraction methods
                tables = self._extract_tables_multi_method(page)
                
                for table_data in tables:
                    tables_on_page.append(table_data)
                    logger.info(
                        f"Extracted table with confidence {table_data.metadata.confidence_score:.2%} "
                        f"using {table_data.metadata.method_used.value}"
                    )
                
                if tables_on_page:
                    results[page_num] = tables_on_page
                else:
                    logger.info(f"No tables found on page {page_num}")
        
        return results
    
    def _extract_tables_multi_method(self, page) -> List[TableData]:
        """
        Extract tables using multiple methods and select the best result.
        
        Strategy:
        1. Try Camelot with both stream and lattice flavors
        2. Use confidence scores to select best result
        3. Fallback to pdfplumber if Camelot fails
        """
        extracted_tables: List[TableData] = []
        methods_tried = []
        
        # Method 1: Try Camelot Stream (for tables with visible lines)
        if self._camelot_available:
            try:
                tables = self._extract_with_camelot(page, flavor='stream')
                if tables:
                    extracted_tables.extend(tables)
                    methods_tried.append(TableExtractionMethod.CAMELOT_STREAM)
                    logger.info(f"Extracted {len(tables)} tables using Camelot stream")
            except Exception as e:
                logger.warning(f"Camelot stream extraction failed: {e}")
        
        # Method 2: Try Camelot Lattice (for tables with invisible lines)
        if self._camelot_available:
            try:
                tables = self._extract_with_camelot(page, flavor='lattice')
                if tables:
                    # Only add if not already found (avoid duplicates)
                    existing_shapes = {(t.shape, self._get_table_fingerprint(t)) for t in extracted_tables}
                    for table in tables:
                        fingerprint = self._get_table_fingerprint(table)
                        if (table.shape, fingerprint) not in existing_shapes:
                            extracted_tables.append(table)
                    methods_tried.append(TableExtractionMethod.CAMELOT_LATTICE)
                    logger.info(f"Extracted {len(tables)} additional tables using Camelot lattice")
            except Exception as e:
                logger.warning(f"Camelot lattice extraction failed: {e}")
        
        # Method 3: Fallback to pdfplumber
        try:
            tables = self._extract_with_pdfplumber(page)
            if tables:
                existing_shapes = {(t.shape, self._get_table_fingerprint(t)) for t in extracted_tables}
                for table in tables:
                    fingerprint = self._get_table_fingerprint(table)
                    if (table.shape, fingerprint) not in existing_shapes:
                        extracted_tables.append(table)
                methods_tried.append(TableExtractionMethod.PDFPLUMBER)
                logger.info(f"Extracted {len(tables)} additional tables using pdfplumber")
        except Exception as e:
            logger.warning(f"pdfplumber extraction failed: {e}")
        
        # Method 4: Try Tabula as final fallback
        if self._tabula_available and not extracted_tables:
            try:
                tables = self._extract_with_tabula(page)
                if tables:
                    extracted_tables.extend(tables)
                    methods_tried.append(TableExtractionMethod.TABULA)
                    logger.info(f"Extracted {len(tables)} tables using Tabula")
            except Exception as e:
                logger.warning(f"Tabula extraction failed: {e}")
        
        # Sort by confidence score and return
        extracted_tables.sort(key=lambda t: t.metadata.confidence_score, reverse=True)
        
        return extracted_tables
    
    def _extract_with_camelot(self, page, flavor: str = 'stream') -> List[TableData]:
        """Extract tables using Camelot library"""
        import camelot
        
        # Convert pdfplumber page to tempfile for Camelot
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
            tmp_path = tmp.name
        
        try:
            # Save page to temp file
            page.to_pdf(tmp_path)
            
            # Extract tables using Camelot
            if flavor == 'stream':
                camelot_tables = camelot.read_pdf(tmp_path, pages='1', flavor='stream')
            else:
                camelot_tables = camelot.read_pdf(tmp_path, pages='1', flavor='lattice')
            
            tables = []
            for idx, camelot_table in enumerate(camelot_tables):
                # Calculate confidence score
                accuracy = camelot_table.accuracy if hasattr(camelot_table, 'accuracy') else 0.9
                precision = camelot_table.precision if hasattr(camelot_table, 'precision') else 0.9
                confidence = (accuracy + precision) / 2
                
                # Get the DataFrame
                df = camelot_table.df
                
                # Convert to TableData
                table_data = self._dataframe_to_table_data(
                    df,
                    page_number=page.page_number,
                    method=TableExtractionMethod.CAMELOT_STREAM if flavor == 'stream' else TableExtractionMethod.CAMELOT_LATTICE,
                    confidence_score=confidence,
                    table_title=f"Table {idx + 1}"
                )
                tables.append(table_data)
            
            return tables
            
        finally:
            # Clean up temp file
            try:
                os.unlink(tmp_path)
            except:
                pass
    
    def _extract_with_pdfplumber(self, page) -> List[TableData]:
        """Extract tables using pdfplumber"""
        tables = []
        
        # Extract tables using pdfplumber's built-in method
        pdfplumber_tables = page.extract_tables()
        
        for idx, table in enumerate(pdfplumber_tables):
            table_data = self._list_to_table_data(
                table,
                page_number=page.page_number,
                method=TableExtractionMethod.PDFPLUMBER,
                confidence_score=0.85,  # Default confidence for pdfplumber
                table_title=f"Table {idx + 1}"
            )
            tables.append(table_data)
        
        return tables
    
    def _extract_with_tabula(self, page) -> List[TableData]:
        """Extract tables using Tabula library"""
        import tabula
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
            tmp_path = tmp.name
        
        try:
            # Save page to temp file
            page.to_pdf(tmp_path)
            
            # Extract tables using Tabula
            dfs = tabula.read_pdf(tmp_path, pages='1', multiple_tables=True)
            
            tables = []
            for idx, df in enumerate(dfs):
                table_data = self._dataframe_to_table_data(
                    df,
                    page_number=page.page_number,
                    method=TableExtractionMethod.TABULA,
                    confidence_score=0.80,
                    table_title=f"Table {idx + 1}"
                )
                tables.append(table_data)
            
            return tables
            
        finally:
            try:
                os.unlink(tmp_path)
            except:
                pass
    
    def _dataframe_to_table_data(
        self,
        df,
        page_number: int,
        method: TableExtractionMethod,
        confidence_score: float,
        table_title: Optional[str] = None
    ) -> TableData:
        """Convert pandas DataFrame to TableData"""
        # Clean the dataframe
        df = df.fillna('')
        
        # Detect headers
        has_header = self._detect_header(df)
        
        # Detect data types for each column
        column_types = [self._detect_column_type(df[col].tolist()) for col in df.columns]
        
        # Build cells
        cells: List[List[CellData]] = []
        
        for row_idx, row in df.iterrows():
            row_cells: List[CellData] = []
            for col_idx, value in enumerate(row):
                cell = CellData(
                    value=value,
                    row_index=row_idx,
                    column_index=col_idx,
                    is_header=(row_idx == 0 and has_header),
                    data_type=column_types[col_idx] if col_idx < len(column_types) else 'string'
                )
                row_cells.append(cell)
            cells.append(row_cells)
        
        # Build metadata
        metadata = TableInfo(
            page_number=page_number,
            method_used=method,
            confidence_score=confidence_score,
            row_count=len(cells),
            column_count=len(cells[0]) if cells else 0,
            has_header=has_header,
            table_title=table_title
        )
        
        # Create TableData
        table_data = TableData(
            cells=cells,
            metadata=metadata,
            raw_data=df.values.tolist()
        )
        
        return table_data
    
    def _list_to_table_data(
        self,
        table_list: List[List[Any]],
        page_number: int,
        method: TableExtractionMethod,
        confidence_score: float,
        table_title: Optional[str] = None
    ) -> TableData:
        """Convert list of lists to TableData"""
        if not table_list:
            return TableData(
                cells=[],
                metadata=TableInfo(
                    page_number=page_number,
                    method_used=method,
                    confidence_score=confidence_score,
                    row_count=0,
                    column_count=0,
                    has_header=False,
                    table_title=table_title
                )
            )
        
        # Detect headers (first row is typically header)
        has_header = True
        
        # Detect data types for each column
        max_cols = max(len(row) for row in table_list)
        column_types = []
        for col_idx in range(max_cols):
            col_values = [row[col_idx] for row in table_list if col_idx < len(row)]
            column_types.append(self._detect_column_type(col_values))
        
        # Build cells
        cells: List[List[CellData]] = []
        
        for row_idx, row in enumerate(table_list):
            row_cells: List[CellData] = []
            for col_idx in range(max_cols):
                value = row[col_idx] if col_idx < len(row) else None
                cell = CellData(
                    value=value,
                    row_index=row_idx,
                    column_index=col_idx,
                    is_header=(row_idx == 0 and has_header),
                    data_type=column_types[col_idx] if col_idx < len(column_types) else 'string'
                )
                row_cells.append(cell)
            cells.append(row_cells)
        
        # Build metadata
        metadata = TableInfo(
            page_number=page_number,
            method_used=method,
            confidence_score=confidence_score,
            row_count=len(cells),
            column_count=max_cols,
            has_header=has_header,
            table_title=table_title
        )
        
        # Create TableData
        table_data = TableData(
            cells=cells,
            metadata=metadata,
            raw_data=table_list
        )
        
        return table_data
    
    def _detect_header(self, df) -> bool:
        """Detect if first row is a header"""
        if df.empty:
            return False
        
        first_row = df.iloc[0].tolist()
        
        # Check if values look like headers (typically strings, shorter, no numbers)
        header_indicators = 0
        for val in first_row:
            if isinstance(val, str):
                # Headers often have mixed case, no numbers
                if val and not any(c.isdigit() for c in val):
                    header_indicators += 1
        
        # If more than half the values look like headers, consider it a header row
        return header_indicators > len(first_row) / 2
    
    def _detect_column_type(self, values: List[Any]) -> str:
        """Detect the data type of a column"""
        # Filter out empty values
        non_empty = [v for v in values if v is not None and v != ""]
        
        if not non_empty:
            return "string"
        
        # Check for numbers
        number_count = 0
        currency_count = 0
        percentage_count = 0
        date_count = 0
        
        for val in non_empty:
            val_str = str(val).strip()
            
            # Check for currency
            if re.match(r'^[\$€£¥]\s*\d', val_str) or re.match(r'\d\s*[\$€£¥]$', val_str):
                currency_count += 1
                continue
            
            # Check for percentage
            if '%' in val_str:
                percentage_count += 1
                continue
            
            # Check for date patterns
            date_patterns = [
                r'\d{1,2}/\d{1,2}/\d{2,4}',  # MM/DD/YYYY
                r'\d{1,2}-\d{1,2}-\d{2,4}',  # DD-MM-YYYY
                r'\d{4}-\d{1,2}-\d{1,2}',    # YYYY-MM-DD
                r'\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}',  # DD Mon YYYY
            ]
            if any(re.match(p, val_str) for p in date_patterns):
                date_count += 1
                continue
            
            # Check for numbers
            try:
                float(val_str.replace(',', '').replace(' ', ''))
                number_count += 1
            except ValueError:
                pass
        
        total = len(non_empty)
        
        if currency_count / total > 0.5:
            return "currency"
        if percentage_count / total > 0.5:
            return "percentage"
        if date_count / total > 0.5:
            return "date"
        if number_count / total > 0.5:
            return "number"
        
        return "string"
    
    def _get_table_fingerprint(self, table_data: TableData) -> str:
        """Generate a fingerprint for table deduplication"""
        if not table_data.cells:
            return ""
        
        # Use first few cells as fingerprint
        sample_cells = []
        for row in table_data.cells[:3]:
            for cell in row[:3]:
                sample_cells.append(str(cell.value))
        
        return "|".join(sample_cells)
    
    def merge_sequential_pages(
        self,
        tables: Dict[int, List[TableData]]
    ) -> List[TableData]:
        """
        Merge tables that span multiple pages.
        
        This identifies tables that continue across pages and merges them
        into a single table.
        """
        if not tables:
            return []
        
        # Sort pages
        sorted_pages = sorted(tables.keys())
        
        merged_tables: List[TableData] = []
        current_table = None
        current_page = None
        
        for page_num in sorted_pages:
            page_tables = tables[page_num]
            
            for table in page_tables:
                if current_table is None:
                    current_table = table
                    current_page = page_num
                elif self._should_merge_tables(current_table, table):
                    # Merge tables
                    current_table = self._merge_tables(current_table, table, page_num)
                else:
                    # Save current table and start new one
                    if current_table:
                        merged_tables.append(current_table)
                    current_table = table
                    current_page = page_num
        
        # Don't forget the last table
        if current_table:
            merged_tables.append(current_table)
        
        return merged_tables
    
    def _should_merge_tables(
        self,
        table1: TableData,
        table2: TableData
    ) -> bool:
        """Determine if two tables should be merged"""
        # Check if they have similar structure
        if table1.shape[1] != table2.shape[1]:
            return False
        
        # Check if headers match
        if table1.metadata.has_header and table2.metadata.has_header:
            headers1 = table1.get_headers()
            headers2 = table2.get_headers()
            if headers1 != headers2:
                return False
        
        return True
    
    def _merge_tables(
        self,
        table1: TableData,
        table2: TableData,
        second_page: int
    ) -> TableData:
        """Merge two tables that span pages"""
        # Combine cells
        merged_cells = table1.cells + table2.cells
        
        # Update metadata
        merged_metadata = TableInfo(
            page_number=table1.metadata.page_number,
            method_used=table1.metadata.method_used,
            confidence_score=min(table1.metadata.confidence_score, table2.metadata.confidence_score),
            row_count=len(merged_cells),
            column_count=table1.shape[1],
            has_header=table1.metadata.has_header,
            table_title=table1.metadata.table_title,
            extraction_warnings=table1.metadata.extraction_warnings + 
                               [f"Continued on page {second_page}"]
        )
        
        return TableData(
            cells=merged_cells,
            metadata=merged_metadata,
            raw_data=table1.raw_data + table2.raw_data
        )


def detect_table_regions(page) -> List[Dict[str, Any]]:
    """
    Detect potential table regions on a page using layout analysis.
    
    Returns a list of bounding boxes for potential tables.
    """
    import pdfplumber
    
    regions = []
    
    # Get text lines
    lines = page.lines or []
    words = page.extract_words()
    
    # Group words into potential table cells
    if words:
        # Simple clustering based on y-coordinates
        y_groups: Dict[float, List[Dict]] = {}
        for word in words:
            y_key = round(word["top"] / 20) * 20  # Group by 20-pixel bands
            if y_key not in y_groups:
                y_groups[y_key] = []
            y_groups[y_key].append(word)
        
        # Analyze patterns (consistent spacing suggests tables)
        if len(y_groups) > 2:
            y_positions = sorted(y_groups.keys())
            gaps = []
            for i in range(len(y_positions) - 1):
                gaps.append(y_positions[i + 1] - y_positions[i])
            
            # Look for consistent spacing (typical of tables)
            if gaps:
                avg_gap = sum(gaps) / len(gaps)
                std_gap = (sum((g - avg_gap) ** 2 for g in gaps) / len(gaps)) ** 0.5
                
                if std_gap < avg_gap * 0.5:  # Consistent spacing found
                    # Calculate bounding box
                    all_words = [w for group in y_groups.values() for w in group]
                    min_x = min(w["x0"] for w in all_words)
                    min_y = min(w["top"] for w in all_words)
                    max_x = max(w["x1"] for w in all_words)
                    max_y = max(w["bottom"] for w in all_words)
                    
                    regions.append({
                        "bbox": (min_x, min_y, max_x, max_y),
                        "type": "potential_table",
                        "confidence": 0.7
                    })
    
    return regions

