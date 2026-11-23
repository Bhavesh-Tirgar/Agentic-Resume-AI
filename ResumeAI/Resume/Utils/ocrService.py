import io
import os
import shutil
import logging
import pymupdf

logger = logging.getLogger(__name__)


class OCRService:
    """
    OCR fallback for scanned/image-based PDFs.
    Dynamically probes available Tesseract traineddata languages to avoid crashes.
    """

    @staticmethod
    def extract_text(pdf_path: str) -> str:
        try:
            import pytesseract
            from PIL import Image
        except ImportError as e:
            logger.warning("OCR dependencies not available: %s", e)
            return ""

        # Dynamically locate Tesseract executable across environments
        custom_cmd = os.getenv("TESSERACT_CMD")
        if custom_cmd and os.path.exists(custom_cmd):
            pytesseract.pytesseract.tesseract_cmd = custom_cmd
        elif not shutil.which("tesseract"):
            win_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
            if os.name == "nt" and os.path.exists(win_path):
                pytesseract.pytesseract.tesseract_cmd = win_path

        # Determine installed languages to prevent tessdata missing errors
        try:
            available = pytesseract.get_languages(config="")
            desired = ["eng", "hin", "guj"]
            selected = [l for l in desired if l in available]
            lang_param = "+".join(selected) if selected else "eng"
        except Exception:
            lang_param = "eng"

        document = pymupdf.open(pdf_path)
        extracted_text = []

        try:
            for page in document:
                pix = page.get_pixmap(dpi=300)
                image = Image.open(io.BytesIO(pix.tobytes("png")))
                text = pytesseract.image_to_string(image, lang=lang_param)
                extracted_text.append(text)
        except Exception as exc:
            logger.warning("Tesseract OCR extraction failed: %s", exc)
        finally:
            document.close()

        return "\n".join(extracted_text).strip()
