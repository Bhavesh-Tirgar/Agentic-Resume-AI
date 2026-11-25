import io
import os
import logging
from typing import Optional, Union
import pymupdf

logger = logging.getLogger(__name__)

OCR_THRESHOLD = 100


def extract_text_from_docx(source: Union[str, bytes]) -> str:
    """
    Extracts structured text from a Word DOCX file path or raw bytes,
    including body paragraphs and table contents.
    """
    try:
        import docx
        doc_input = io.BytesIO(source) if isinstance(source, (bytes, bytearray)) else source
        doc = docx.Document(doc_input)
        text_parts = []

        # Extract paragraphs
        for p in doc.paragraphs:
            if p.text and p.text.strip():
                text_parts.append(p.text.strip())

        # Extract table cells
        for table in doc.tables:
            for row in table.rows:
                cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if cells:
                    # Deduplicate repeated cell text from merged columns
                    unique_cells = []
                    for c in cells:
                        if not unique_cells or c != unique_cells[-1]:
                            unique_cells.append(c)
                    text_parts.append(" | ".join(unique_cells))

        extracted = "\n".join(text_parts).strip()
        label = "bytes-stream" if isinstance(source, (bytes, bytearray)) else os.path.basename(source)
        logger.info("Extracted %d characters from DOCX document: %s", len(extracted), label)
        return extracted
    except Exception as exc:
        logger.exception("Failed to parse DOCX document: %s", exc)
        return ""


def extract_text_from_pdf(source: Union[str, bytes], filename: Optional[str] = None) -> str:
    """
    Universal storage-agnostic document text extraction for PDF and DOCX.
    Accepts either a local filesystem path or raw file bytes (for S3/cloud object storage).
    1. If .docx or ZIP magic header: uses python-docx for native XML extraction.
    2. If PDF: uses PyMuPDF with automatic OCR fallback for scanned images.
    """
    is_bytes = isinstance(source, (bytes, bytearray))
    inferred_name = (filename or ("" if is_bytes else str(source))).lower()
    is_docx = inferred_name.endswith(".docx") or (is_bytes and bytes(source[:2]) == b"PK")

    if is_docx:
        return extract_text_from_docx(bytes(source) if is_bytes else source)

    document = pymupdf.open(stream=bytes(source), filetype="pdf") if is_bytes else pymupdf.open(source)

    try:
        text = ""
        for page in document:
            text += page.get_text()
    finally:
        document.close()

    text = text.strip()

    # If almost no text was extracted, it's likely a scanned image PDF
    if len(text) < OCR_THRESHOLD:
        try:
            from .ocrService import OCRService
            logger.info("Native text extraction sparse (<%d chars). Initiating OCR fallback.", OCR_THRESHOLD)
            ocr_text = OCRService.extract_text(bytes(source) if is_bytes else source)
            if ocr_text and ocr_text.strip():
                return ocr_text
        except Exception as e:
            logger.warning("OCR unavailable or encountered an error: %s", e)

    return text


# Backward-compatible alias
extract_text_from_document = extract_text_from_pdf
