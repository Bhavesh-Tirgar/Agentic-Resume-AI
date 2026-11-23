import logging
import pymupdf

logger = logging.getLogger(__name__)

OCR_THRESHOLD = 100


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from a PDF document.
    1. Fast native text extraction via PyMuPDF.
    2. Lazy fallback to OCR if document contains primarily scanned images.
    """
    document = pymupdf.open(pdf_path)

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
            ocr_text = OCRService.extract_text(pdf_path)
            if ocr_text and ocr_text.strip():
                return ocr_text
        except Exception as e:
            logger.warning("OCR unavailable or encountered an error: %s", e)

    return text
