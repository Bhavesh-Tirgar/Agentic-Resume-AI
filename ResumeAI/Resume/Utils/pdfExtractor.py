import os
import logging
import pymupdf

logger = logging.getLogger(__name__)

OCR_THRESHOLD = 100


def extract_text_from_docx(docx_path: str) -> str:
    """
    Extracts structured text from a Word DOCX document,
    including body paragraphs and table contents.
    """
    try:
        import docx
        doc = docx.Document(docx_path)
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
        logger.info("Extracted %d characters from DOCX document: %s", len(extracted), os.path.basename(docx_path))
        return extracted
    except Exception as exc:
        logger.exception("Failed to parse DOCX file %s: %s", docx_path, exc)
        return ""


def extract_text_from_pdf(file_path: str) -> str:
    """
    Universal document text extraction for PDF and DOCX.
    1. If .docx: uses python-docx for native XML extraction.
    2. If .pdf: uses PyMuPDF with automatic OCR fallback for scanned images.
    """
    if file_path.lower().endswith(".docx"):
        return extract_text_from_docx(file_path)

    document = pymupdf.open(file_path)

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
            ocr_text = OCRService.extract_text(file_path)
            if ocr_text and ocr_text.strip():
                return ocr_text
        except Exception as e:
            logger.warning("OCR unavailable or encountered an error: %s", e)

    return text


# Backward-compatible alias
extract_text_from_document = extract_text_from_pdf
