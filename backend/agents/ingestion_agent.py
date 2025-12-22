"""
Ingestion Agent
===============
Handles data intake: PDF parsing, OCR text extraction, and data preparation.
"""

import io
from typing import Optional
from pypdf import PdfReader


class IngestionAgent:
    """
    Gateway agent for document processing.
    
    Capabilities:
    - PDF text extraction
    - OCR for scanned documents (future)
    - Government gazette handling
    - Multi-format support
    """
    
    def __init__(self, demo_mode: bool = False):
        self.demo_mode = demo_mode
        
    async def process(self, raw_input: bytes) -> str:
        """
        Extract text from raw document bytes.
        
        Args:
            raw_input: Raw PDF bytes
            
        Returns:
            Extracted text content
        """
        if self.demo_mode:
            return self._get_demo_text()
            
        return self._extract_from_pdf(raw_input)
    
    def _extract_from_pdf(self, file_bytes: bytes) -> str:
        """Extract text from PDF file."""
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            
            for page_num, page in enumerate(reader.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(f"--- Page {page_num} ---\n{page_text}")
                    
            full_text = "\n\n".join(text_parts)
            
            # Basic cleanup
            full_text = self._clean_text(full_text)
            
            return full_text
            
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text."""
        # Remove excessive whitespace
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            if line:  # Skip empty lines
                cleaned_lines.append(line)
                
        return '\n'.join(cleaned_lines)
    
    def _get_demo_text(self) -> str:
        """Return demo policy text for demonstration mode."""
        return """
MINISTRY OF MICRO, SMALL AND MEDIUM ENTERPRISES
GOVERNMENT OF INDIA
NOTIFICATION

New Delhi, dated the 1st July, 2024

CREDIT GUARANTEE FUND TRUST FOR MICRO AND SMALL ENTERPRISES (CGTMSE)

In exercise of the powers conferred by section 9 of the MSMED Act, 2006, the Central 
Government hereby notifies the revised guidelines for the Credit Guarantee Scheme:

1. ELIGIBILITY CRITERIA:
   a) All new and existing Micro and Small Enterprises engaged in manufacturing or service activities
   b) Maximum credit facility: Rs. 5 crore per borrowing unit
   c) Enterprises must be registered on Udyam Portal
   
2. COVERAGE:
   The guarantee cover shall be up to 85% of the sanctioned credit facility for:
   - Micro enterprises
   - Women entrepreneurs
   - Units in North-Eastern Region
   
3. GUARANTEE FEE:
   Annual Guarantee Fee: 0.37% to 1.80% depending on the category
   
4. COMPLIANCE REQUIREMENTS:
   a) Timely submission of quarterly reports
   b) Maintenance of proper books of accounts
   c) Annual renewal of Udyam registration
   
5. PENALTIES:
   Non-compliance may result in:
   - Withdrawal of guarantee cover
   - Blacklisting from future schemes
   - Fine up to Rs. 10,000

This notification shall come into force from the date of its publication.

[F. No. 2/1/2024-CGTMSE]
JOINT SECRETARY TO THE GOVERNMENT OF INDIA
"""
    
    async def validate_document(self, file_bytes: bytes) -> dict:
        """
        Validate if document is processable.
        
        Returns:
            Dict with validation status and details
        """
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            page_count = len(reader.pages)
            
            # Check if text extractable
            has_text = False
            for page in reader.pages[:3]:  # Check first 3 pages
                if page.extract_text().strip():
                    has_text = True
                    break
                    
            return {
                "valid": True,
                "page_count": page_count,
                "has_extractable_text": has_text,
                "needs_ocr": not has_text,
                "message": "Document is ready for processing"
            }
            
        except Exception as e:
            return {
                "valid": False,
                "page_count": 0,
                "has_extractable_text": False,
                "needs_ocr": False,
                "message": f"Invalid PDF: {str(e)}"
            }
