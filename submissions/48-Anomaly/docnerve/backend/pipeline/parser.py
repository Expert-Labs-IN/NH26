# pyright: reportMissingTypeStubs=false

"""
DocNerve — Step 1: Document Parser (Docling)
Converts PDF/image to structured text + tables.
Falls back to PyMuPDF for digital PDFs if Docling is unavailable.
"""

import logging
from pathlib import Path
from typing import TypedDict

import fitz  # type: ignore # PyMuPDF — always available as fallback


class PageInfo(TypedDict):
    page_number: int
    text: str
    tables: list[object]


class ParseResult(TypedDict):
    full_text: str
    pages: list[PageInfo]
    table_count: int


logger = logging.getLogger(__name__)
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp"}

# Docling is imported lazily to avoid startup-time warnings from optional deps.
_docling_available = False
_docling_import_tried = False
_docling_import_error: str | None = None
_DocumentConverter = None

# Single converter instance — reused across all documents (lazy loaded)
_converter = None

# OCR fallback readers (lazy loaded and cached)
_easyocr_reader = None
_easyocr_import_error: str | None = None
_pytesseract_import_error: str | None = None


def _ensure_docling_import() -> None:
    """Attempt Docling import once per process."""
    global \
        _docling_available, \
        _docling_import_tried, \
        _docling_import_error, \
        _DocumentConverter
    if _docling_import_tried:
        return

    _docling_import_tried = True
    try:
        from docling.document_converter import DocumentConverter

        _DocumentConverter = DocumentConverter
        _docling_available = True
    except Exception as exc:
        _docling_available = False
        _docling_import_error = str(exc)
        logger.warning(
            "Docling import unavailable; falling back to PyMuPDF (%s)",
            _docling_import_error,
        )


def _get_converter():
    """Lazy load Docling converter."""
    global _converter
    _ensure_docling_import()
    if _converter is None and _docling_available and _DocumentConverter is not None:
        try:
            _converter = _DocumentConverter()
        except Exception as exc:
            logger.warning("Docling initialization failed: %s", exc)
    return _converter


def _ocr_fallback_for_image(file_path: str) -> ParseResult:
    """
    OCR fallback chain for image inputs when Docling OCR is unavailable/fails.

    Order:
      1) EasyOCR (if installed)
      2) Pytesseract (if installed)

    Returns a ParseResult with extracted text when successful, otherwise a
    descriptive placeholder string that preserves non-fatal behavior.
    """
    result: ParseResult = {
        "full_text": "",
        "pages": [],
        "table_count": 0,
    }

    # 1) EasyOCR fallback
    global _easyocr_reader, _easyocr_import_error
    try:
        if _easyocr_reader is None:
            import easyocr  # type: ignore

            _easyocr_reader = easyocr.Reader(["en"])
        ocr_lines = _easyocr_reader.readtext(str(file_path), detail=0)
        text = "\n".join(line for line in ocr_lines if isinstance(line, str)).strip()
        if text:
            result["full_text"] = text
            result["pages"] = [{"page_number": 1, "text": text, "tables": []}]
            return result
    except Exception as exc:
        _easyocr_import_error = str(exc)
        logger.warning("EasyOCR fallback failed for %s: %s", file_path, exc)

    # 2) Pytesseract fallback
    global _pytesseract_import_error
    try:
        import pytesseract  # type: ignore
        from PIL import Image  # type: ignore

        text = pytesseract.image_to_string(Image.open(file_path)).strip()
        if text:
            result["full_text"] = text
            result["pages"] = [{"page_number": 1, "text": text, "tables": []}]
            return result
    except Exception as exc:
        _pytesseract_import_error = str(exc)
        logger.warning("Pytesseract fallback failed for %s: %s", file_path, exc)

    # No OCR backend succeeded
    result["full_text"] = (
        "[OCR unavailable for image input: Docling OCR failed/unavailable, "
        "EasyOCR/Pytesseract fallback unavailable or failed]"
    )
    return result


def _pymupdf_fallback(file_path: str) -> ParseResult:
    """Extract text using PyMuPDF when Docling is unavailable for PDFs."""
    result: ParseResult = {
        "full_text": "",
        "pages": [],
        "table_count": 0,
    }

    try:
        path = Path(file_path)

        # Image OCR: use fallback chain when Docling path is unavailable here.
        if path.suffix.lower() in IMAGE_EXTENSIONS:
            return _ocr_fallback_for_image(file_path)

        # Handle PDF
        if path.suffix.lower() == ".pdf":
            doc = fitz.open(str(file_path))  # type: ignore
            full_text_parts: list[str] = []
            table_count = 0

            for page_num in range(len(doc)):  # type: ignore
                page = doc[page_num]  # type: ignore
                text: str = f"{getattr(page, 'get_text')()}"  # type: ignore
                full_text_parts.append(text)

                # Simple table detection heuristic
                if _has_table_pattern(text):
                    table_count += 1

                result["pages"].append(
                    {
                        "page_number": page_num + 1,
                        "text": text,
                        "tables": [],
                    }
                )

            doc.close()
            result["full_text"] = "\n\n".join(full_text_parts)
            result["table_count"] = table_count

    except Exception as exc:
        logger.warning("PyMuPDF parse failed for %s: %s", file_path, exc)
        result["full_text"] = f"[Parse error: {exc}]"

    return result


def _has_table_pattern(text: str) -> bool:
    """
    Simple heuristic to detect if text might contain a table.
    Looks for lines with multiple aligned number sequences.
    """
    if not text:
        return False

    lines = text.split("\n")
    aligned_count = 0

    for line in lines:
        parts = line.split()
        if len(parts) >= 3:
            number_count = sum(1 for p in parts if _is_number(p))
            if number_count >= 2:
                aligned_count += 1

    return aligned_count >= 3


def _is_number(s: str) -> bool:
    """Check if string is a number (including currency)."""
    if not s:
        return False
    cleaned = (
        s.replace(",", "")
        .replace("₹", "")
        .replace("$", "")
        .replace("-", "")
        .replace(".", "")
    )
    return cleaned.isdigit() if cleaned else False


def parse_document(file_path: str) -> ParseResult:
    """
    Parse a document using Docling (with PyMuPDF fallback).

    Args:
        file_path: Path to PDF or image file

    Returns:
        {
            "full_text": str,       # All extracted text
            "pages": list,          # [{page_number, text, tables}, ...]
            "table_count": int      # Number of tables detected
        }
    """
    result: ParseResult = {
        "full_text": "",
        "pages": [],
        "table_count": 0,
    }
    path = Path(file_path)
    is_image_input = path.suffix.lower() in IMAGE_EXTENSIONS

    _ensure_docling_import()

    # Try Docling first
    if _docling_available:
        converter = _get_converter()
        if converter is not None:
            try:
                docling_result = converter.convert(str(file_path))
                doc = docling_result.document

                if True:  # doc is never None in newer docling
                    # Get full text
                    try:
                        result["full_text"] = doc.export_to_markdown()
                    except Exception:
                        try:
                            result["full_text"] = doc.export_to_text()
                        except Exception:
                            pass

                    # Extract pages
                    # Fix: iterate over .values() for dict, or use enumerate if list
                    try:
                        if hasattr(doc, "pages") and doc.pages:
                            # doc.pages could be a dict or list depending on version/typing
                            page_items = (
                                getattr(doc.pages, "values")()
                                if hasattr(doc.pages, "values")
                                else doc.pages
                            )
                            for idx, _page_item in enumerate(page_items):
                                result["pages"].append(
                                    {
                                        "page_number": idx + 1,
                                        "text": "",  # page-level text not easily available in Docling 2.x
                                        "tables": [],
                                    }
                                )
                    except Exception as exc:
                        logger.debug("Docling page extraction failed: %s", exc)

                    # Count tables — doc.tables in Docling 2.x is a list of TableItem
                    try:
                        tables_list = list(doc.tables) if hasattr(doc, "tables") else []
                        result["table_count"] = len(tables_list)
                    except Exception:
                        pass

                    # Synthetic page fallback: if pages is empty but we have text, create one
                    if not result["pages"] and result["full_text"]:
                        result["pages"] = [
                            {
                                "page_number": 1,
                                "text": result["full_text"],
                                "tables": [],
                            }
                        ]

                    # If we got text, return Docling result
                    if result["full_text"]:
                        return result

            except Exception as exc:
                logger.warning(
                    "Docling parse failed for %s: %s; falling back to PyMuPDF",
                    file_path,
                    exc,
                )
                if is_image_input:
                    logger.warning(
                        "Docling OCR failed for image %s; using OCR fallback chain",
                        file_path,
                    )
                    return _ocr_fallback_for_image(file_path)

    if is_image_input:
        # Docling unavailable or produced no text for image: run OCR fallback chain.
        return _ocr_fallback_for_image(file_path)

    # Fallback to PyMuPDF for PDFs only.
    return _pymupdf_fallback(file_path)


def evict_parser():
    """Release Docling converter from memory (VRAM management)."""
    global _converter
    if _converter is not None:
        logger.info("Evicting Docling converter")
        _converter = None
        import gc

        _ = gc.collect()

        # Try to clear CUDA cache
        try:
            import torch

            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except ImportError:
            pass
