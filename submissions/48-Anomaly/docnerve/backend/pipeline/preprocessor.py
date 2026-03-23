"""
DocNerve — Step 0: Preprocessor
Handles PDF digital detection vs scanned image prep (OpenCV + PyMuPDF).
Assesses scan quality for trust scoring.
"""

from pathlib import Path
from typing import Any, Dict

import cv2
import fitz  # PyMuPDF
import numpy as np
from config import DIGITAL_PDF_MIN_CHARS

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp"}


def deskew(image: np.ndarray) -> np.ndarray:
    """Deskew a scanned image using Hough lines."""
    try:
        gray = (
            cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        )
        gray = cv2.bitwise_not(gray)
        thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
        coords = np.column_stack(np.where(thresh > 0))
        if len(coords) == 0:
            return image
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(
            image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
        )
        return rotated
    except Exception as e:
        print(f"[Preprocessor] Deskew failed: {e}")
        return image


def denoise(image: np.ndarray) -> np.ndarray:
    """Apply fast non-local means denoising."""
    try:
        if len(image.shape) == 3:
            return cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)
        else:
            return cv2.fastNlMeansDenoising(image, None, 10, 7, 21)
    except Exception as e:
        print(f"[Preprocessor] Denoise failed: {e}")
        return image


def _assess_image_quality(image: np.ndarray) -> int:
    """
    Assess image quality using OpenCV.
    Returns score 0-100 based on sharpness and contrast.
    """
    try:
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        # Laplacian variance (sharpness indicator)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        # Contrast (standard deviation of pixel values)
        contrast = gray.std()

        # Score calculation
        # Good sharpness: >100, Good contrast: >40
        sharpness_score = min(100, laplacian_var / 10)
        contrast_score = min(100, contrast * 2)

        quality = int((sharpness_score + contrast_score) / 2)
        return max(10, min(100, quality))

    except Exception as e:
        print(f"[Preprocessor] Quality assessment failed: {e}")
        return 50


def _assess_pdf_scan_quality(pdf_path: str) -> int:
    """
    Render PDF first page and assess quality.
    Returns score 0-100.
    """
    try:
        doc = fitz.open(pdf_path)
        if len(doc) == 0:
            doc.close()
            return 30

        # Render first page to image
        page = doc[0]
        mat = fitz.Matrix(1.0, 1.0)  # 1x zoom
        pix = page.get_pixmap(matrix=mat)

        # Convert to numpy array
        img = np.frombuffer(pix.samples, dtype=np.uint8)
        img = img.reshape(pix.height, pix.width, pix.n)

        doc.close()

        return _assess_image_quality(img)

    except Exception as e:
        print(f"[Preprocessor] PDF scan quality assessment failed: {e}")
        return 50


def _processed_image_path(file_path: str) -> Path:
    path = Path(file_path)
    return path.with_name(f"{path.stem}_processed.png")


def _prepare_image_for_docling(file_path: str) -> tuple[str, int]:
    img = cv2.imread(str(file_path))
    if img is None:
        raise ValueError(f"Could not read image file: {file_path}")

    quality = _assess_image_quality(img)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    normalized = cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX)

    save_path = _processed_image_path(file_path)
    if not cv2.imwrite(str(save_path), normalized):
        raise ValueError(f"Failed to write preprocessed image: {save_path}")

    return str(save_path), quality


def preprocess(file_path: str) -> Dict[str, Any]:
    """
    Preprocess a file before Docling parsing.
    Detects digital vs scanned PDFs and assesses scan quality.

    Returns:
        {
            "path": str,              # Original or processed file path
            "mode": str,              # "digital" | "scan" | "mixed"
            "scan_quality_score": int # 0-100 quality score
        }
    """
    result = {
        "path": file_path,
        "mode": "scan",
        "scan_quality_score": 50,
    }

    path = Path(file_path)
    ext = path.suffix.lower()

    # Handle image files.
    # The project spec expects image uploads to be normalized into a PNG
    # before they are handed to Docling for OCR.
    if ext in IMAGE_EXTENSIONS:
        try:
            processed_path, quality = _prepare_image_for_docling(file_path)
            result["mode"] = "scan"
            result["scan_quality_score"] = quality
            result["path"] = processed_path
            return result

        except Exception as e:
            print(f"[Preprocessor] Image preprocessing failed: {e}")
            result["mode"] = "scan"
            result["scan_quality_score"] = 30
            return result

    # Handle PDF files
    if ext == ".pdf":
        try:
            doc = fitz.open(file_path)

            total_text = " ".join(page.get_text() for page in doc)
            total_chars = len(total_text.strip())
            non_ascii = sum(1 for c in total_text if ord(c) > 127)
            non_ascii_ratio = non_ascii / len(total_text) if total_text else 0

            doc.close()

            # Determine mode based on extracted text and non-ASCII ratio
            if total_chars >= DIGITAL_PDF_MIN_CHARS and non_ascii_ratio < 0.4:
                result["mode"] = "digital"
                result["scan_quality_score"] = 100  # Digital PDFs have perfect quality
            elif total_chars >= DIGITAL_PDF_MIN_CHARS and non_ascii_ratio >= 0.4:
                result["mode"] = "mixed"
                result["scan_quality_score"] = _assess_pdf_scan_quality(file_path)
            else:
                result["mode"] = "scan"
                result["scan_quality_score"] = _assess_pdf_scan_quality(file_path)

            return result

        except Exception as e:
            print(f"[Preprocessor] PDF processing failed: {e}")
            result["mode"] = "scan"
            result["scan_quality_score"] = 30
            return result

    # Unknown file type
    print(f"[Preprocessor] Unknown file type: {ext}")
    return result
