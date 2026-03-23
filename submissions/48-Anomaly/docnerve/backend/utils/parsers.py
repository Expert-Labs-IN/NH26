"""
DocNerve — Parsing Utilities
Common functions for parsing amounts, dates, and other values.
"""
import re
from datetime import datetime
from typing import Optional, Union, Tuple


def parse_amount(value: Union[str, int, float, None]) -> Optional[float]:
    """
    Parse amount from various formats.
    
    Examples:
        "₹4,15,000.00" → 415000.0
        "Rs. 50,000" → 50000.0
        "4,85,000" → 485000.0
        485000 → 485000.0
    """
    if value is None:
        return None
    
    if isinstance(value, (int, float)):
        return float(value)
    
    if not isinstance(value, str):
        return None
    
    # Remove currency symbols and common prefixes
    cleaned = value.strip()
    cleaned = re.sub(r"[₹$€£]", "", cleaned)
    cleaned = re.sub(r"(?i)^(rs\.?|inr|usd)\s*", "", cleaned)
    
    # Remove thousand separators (but keep decimal point)
    cleaned = cleaned.replace(",", "")
    
    # Remove spaces
    cleaned = cleaned.replace(" ", "")
    
    # Try to parse
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_date(value: Union[str, datetime, None]) -> Optional[datetime]:
    """
    Parse date from various formats.
    
    Supports:
        - 2024-03-15
        - 15-03-2024
        - 15/03/2024
        - March 15, 2024
        - 15 Mar 2024
    """
    if value is None:
        return None
    
    if isinstance(value, datetime):
        return value
    
    if not isinstance(value, str):
        return None
    
    value = value.strip()
    
    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%d %b %Y",
        "%d %B %Y",
        "%B %d, %Y",
        "%b %d, %Y",
        "%d-%b-%Y",
        "%d-%B-%Y",
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    
    return None


def format_amount(amount: float, currency: str = "₹") -> str:
    """Format amount for display with Indian numbering."""
    if amount >= 10000000:  # Crores
        return f"{currency}{amount/10000000:.2f} Cr"
    elif amount >= 100000:  # Lakhs
        return f"{currency}{amount/100000:.2f} L"
    else:
        return f"{currency}{amount:,.2f}"


def format_date(dt: datetime, fmt: str = "%d %b %Y") -> str:
    """Format datetime for display."""
    if dt is None:
        return ""
    return dt.strftime(fmt)


def extract_po_number(text: str) -> Optional[str]:
    """Extract PO number from text."""
    patterns = [
        r"(?:PO|P\.O\.|Purchase\s*Order)[\s#:]*([A-Z0-9\-]+\d+)",
        r"PO[\s]*#?[\s]*(\d{3,})",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip().upper()
    
    return None


def extract_invoice_number(text: str) -> Optional[str]:
    """Extract invoice number from text."""
    patterns = [
        r"(?:Invoice|Inv)[\s\.]*(?:No|Number|#)?[\s:]*([A-Z0-9\-]+)",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip().upper()
    
    return None


def similarity_score(s1: str, s2: str) -> float:
    """
    Calculate string similarity (0.0 - 1.0).
    Uses rapidfuzz if available, else simple ratio.
    """
    try:
        from rapidfuzz import fuzz
        return fuzz.ratio(s1.lower(), s2.lower()) / 100.0
    except ImportError:
        # Simple character-based similarity
        s1, s2 = s1.lower(), s2.lower()
        if not s1 or not s2:
            return 0.0

        matches = sum(1 for a, b in zip(s1, s2) if a == b)
        return matches / max(len(s1), len(s2))


def normalize_vendor(vendor: str, known_vendors: list, threshold: float = 90.0) -> str:
    """
    Normalize vendor name against known vendors using fuzzy matching.
    If a close match exists (>=threshold), return the canonical name.
    Otherwise return the vendor name as-is.

    Args:
        vendor: The vendor name to normalize
        known_vendors: List of known/canonical vendor names
        threshold: Minimum fuzzy match score (0-100) to consider a match

    Returns:
        Canonical vendor name if match found, else original vendor name
    """
    if not vendor:
        return vendor

    vendor = vendor.strip()

    if not known_vendors:
        return vendor

    try:
        from rapidfuzz import process, fuzz
        result = process.extractOne(
            vendor,
            known_vendors,
            scorer=fuzz.token_sort_ratio
        )
        if result and result[1] >= threshold:
            return result[0]
    except ImportError:
        # Fallback to simple exact match
        vendor_lower = vendor.lower()
        for known in known_vendors:
            if known.lower() == vendor_lower:
                return known

    return vendor
