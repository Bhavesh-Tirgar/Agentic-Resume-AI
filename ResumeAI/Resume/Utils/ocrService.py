import io
import os
import shutil
import fitz

class OCRService:
    """
    OCR fallback for scanned/image-based PDFs.
    Supports English, Hindi, Gujarati.
    """
    OCR_LANGUAGES = "eng+hin+guj"

    @staticmethod
    def extract_text(pdf_path: str) -> str:
        try:
            import pytesseract
            from PIL import Image
        except ImportError as e:
            print(f"OCR dependencies not available: {e}")
            return ""

        # Dynamically locate Tesseract executable across environments
        custom_cmd = os.getenv("TESSERACT_CMD")
        if custom_cmd and os.path.exists(custom_cmd):
            pytesseract.pytesseract.tesseract_cmd = custom_cmd
        elif not shutil.which("tesseract"):
            # Check standard Windows path if on Windows and not in PATH
            win_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
            if os.name == "nt" and os.path.exists(win_path):
                pytesseract.pytesseract.tesseract_cmd = win_path

        document = fitz.open(pdf_path)
        extracted_text = []

        try:
            for page in document:
                # Render PDF page at high resolution
                pix = page.get_pixmap(dpi=300)

                # Convert rendered page to PIL Image
                image = Image.open(
                    io.BytesIO(
                        pix.tobytes("png")
                    )
                )

                # OCR using multiple languages
                text = pytesseract.image_to_string(
                    image,
                    lang=OCRService.OCR_LANGUAGES
                )

                extracted_text.append(text)

        finally:
            document.close()

        return "\n".join(extracted_text).strip()
