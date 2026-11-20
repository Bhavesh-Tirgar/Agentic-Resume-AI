import io
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

        # Set default Tesseract binary path if installed
        try:
            pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        except Exception:
            pass

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
