"""
OCR service for extracting text from prescription images.

Uses Tesseract by default; falls back to EasyOCR if configured or if Tesseract fails.
"""

import os
from typing import Optional  # noqa: F401 used in _extract_tesseract

# Prefer Tesseract (lighter); EasyOCR as fallback
_use_easy_ocr = os.getenv("USE_EASY_OCR", "").lower() in ("1", "true", "yes")


def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from an image file (e.g. prescription photo).

    Returns extracted text or empty string on failure.
    """
    if _use_easy_ocr:
        return _extract_easyocr(image_path)
    return _extract_tesseract(image_path) or _extract_easyocr(image_path)


def _extract_tesseract(image_path: str) -> Optional[str]:
    """Extract text using Tesseract OCR."""
    try:
        import pytesseract
        from PIL import Image
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        return (text or "").strip()
    except Exception:
        return None


def _extract_easyocr(image_path: str) -> str:
    """Extract text using EasyOCR (fallback)."""
    try:
        import easyocr
        reader = easyocr.Reader(["en"], gpu=False)
        result = reader.readtext(image_path)
        lines = [item[1] for item in result]
        return "\n".join(lines).strip() if lines else ""
    except Exception:
        return ""
