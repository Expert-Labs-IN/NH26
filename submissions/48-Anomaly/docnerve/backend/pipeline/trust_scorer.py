"""
DocNerve — Trust Scorer (Step 8)
Assigns trust scores with explainable signals.
"""
from typing import List, Dict, Any
from collections import defaultdict

from config import TRUST_CLEAN_THRESHOLD, TRUST_SUSPICIOUS_THRESHOLD

try:
    from rapidfuzz import fuzz
except ImportError:
    fuzz = None


def calculate_trust_scores(
    documents: List[Dict[str, Any]],
    doc_graph: Dict[str, Any],
    contradictions: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Calculate trust scores for each document.
    
    Args:
        documents: List of doc dicts
        doc_graph: Graph from build_doc_graph
        contradictions: List of contradictions
    
    Returns:
        Same list with trust_score, risk_level, trust_signals added
    """
    # Build contradiction lookup
    docs_in_contradictions = _build_contradiction_lookup(contradictions)
    
    # Calculate vendor averages for deviation check
    vendor_amounts = _calculate_vendor_averages(documents, doc_graph)
    
    for doc in documents:
        signals = []
        score = 100  # Start with perfect score
        
        doc_id = doc.get("id", "")
        doc_type = doc.get("doc_type", "OTHER")
        fields = doc.get("structured_fields", {})
        
        # ── Signal 1: Scan Quality ──────────────────────────────────────
        scan_quality = doc.get("scan_quality_score", 100)
        if scan_quality < 50:
            penalty = int((50 - scan_quality) / 2)
            score -= penalty
            signals.append({
                "signal": "LOW_SCAN_QUALITY",
                "impact": -penalty,
                "detail": f"Scan quality score: {scan_quality}/100",
            })
        
        # ── Signal 2: Internal Arithmetic ───────────────────────────────
        arithmetic_check = _check_arithmetic(fields)
        if arithmetic_check:
            score -= arithmetic_check["penalty"]
            signals.append({
                "signal": "ARITHMETIC_ERROR",
                "impact": -arithmetic_check["penalty"],
                "detail": arithmetic_check["detail"],
            })
        
        # ── Signal 3: Amount Deviation ──────────────────────────────────
        deviation_check = _check_amount_deviation(doc, vendor_amounts, doc_graph)
        if deviation_check:
            score -= deviation_check["penalty"]
            signals.append({
                "signal": "AMOUNT_DEVIATION",
                "impact": -deviation_check["penalty"],
                "detail": deviation_check["detail"],
            })
        
        # ── Signal 4: Missing Required Fields ───────────────────────────
        missing_check = _check_missing_fields(doc_type, fields)
        if missing_check:
            score -= missing_check["penalty"]
            signals.append({
                "signal": "MISSING_FIELDS",
                "impact": -missing_check["penalty"],
                "detail": missing_check["detail"],
            })
        
        # ── Signal 5: Involved in Contradictions ────────────────────────
        if doc_id in docs_in_contradictions:
            contra_info = docs_in_contradictions[doc_id]
            penalty = contra_info["count"] * 15
            score -= penalty
            signals.append({
                "signal": "IN_CONTRADICTION",
                "impact": -penalty,
                "detail": f"Involved in {contra_info['count']} contradiction(s): {', '.join(contra_info['types'])}",
            })
        
        # ── Signal 6: Parse Failure ─────────────────────────────────────
        if doc.get("full_text", "") == "":
            score -= 30
            signals.append({
                "signal": "PARSE_FAILED",
                "impact": -30,
                "detail": "Document text could not be extracted",
            })
        
        # ── Finalize Score ──────────────────────────────────────────────
        score = max(0, min(100, score))
        
        # Determine risk level
        if score >= TRUST_CLEAN_THRESHOLD:
            risk_level = "CLEAN"
        elif score >= TRUST_SUSPICIOUS_THRESHOLD:
            risk_level = "SUSPICIOUS"
        else:
            risk_level = "HIGH_RISK"
        
        doc["trust_score"] = score
        doc["risk_level"] = risk_level
        doc["trust_signals"] = signals
    
    return documents


def _build_contradiction_lookup(contradictions: list) -> Dict[str, Dict]:
    """Build lookup of docs involved in contradictions."""
    lookup = defaultdict(lambda: {"count": 0, "types": []})
    
    for contra in contradictions:
        for doc_key in ["doc_1_id", "doc_2_id"]:
            doc_id = contra.get(doc_key, "")
            if doc_id:
                lookup[doc_id]["count"] += 1
                lookup[doc_id]["types"].append(contra.get("type", "UNKNOWN"))
    
    return dict(lookup)


def _calculate_vendor_averages(documents: list, doc_graph: dict) -> Dict[str, float]:
    """Calculate average amount per vendor."""
    vendor_amounts = defaultdict(list)
    
    for doc in documents:
        fields = doc.get("structured_fields", {})
        amount = _get_amount(fields)
        
        if amount and amount > 0:
            # Find vendor for this doc
            vendor = fields.get("vendor_name", "")
            if vendor:
                vendor_amounts[vendor].append(amount)
    
    # Calculate averages
    return {v: sum(amounts)/len(amounts) for v, amounts in vendor_amounts.items() if amounts}


def _check_arithmetic(fields: dict) -> Dict[str, Any]:
    """Check if line items sum to total."""
    line_items = fields.get("line_items", [])
    total = _get_amount(fields)
    
    if not line_items or not total:
        return None
    
    # Sum line items
    items_sum = 0
    for item in line_items:
        if isinstance(item, dict):
            item_amt = item.get("amount", 0)
            if isinstance(item_amt, (int, float)):
                items_sum += item_amt
            elif isinstance(item_amt, str):
                try:
                    items_sum += float(item_amt.replace(",", "").replace("₹", ""))
                except ValueError:
                    pass
    
    if items_sum == 0:
        return None
    
    # Check difference
    diff = abs(total - items_sum)
    pct_diff = diff / total if total > 0 else 0
    
    if pct_diff > 0.05:  # >5% difference
        return {
            "penalty": 20 if pct_diff > 0.20 else 10,
            "detail": f"Line items sum (₹{items_sum:,.2f}) differs from total (₹{total:,.2f}) by {pct_diff:.0%}",
        }
    
    return None


def _check_amount_deviation(doc: dict, vendor_averages: dict, doc_graph: dict) -> Dict[str, Any]:
    """Check if amount deviates significantly from vendor average."""
    fields = doc.get("structured_fields", {})
    amount = _get_amount(fields)
    vendor = fields.get("vendor_name", "")
    
    if not amount or not vendor or vendor not in vendor_averages:
        return None
    
    avg = vendor_averages[vendor]
    
    if avg == 0:
        return None
    
    deviation = abs(amount - avg) / avg
    
    if deviation > 2.0:  # >200% above average
        return {
            "penalty": 25,
            "detail": f"Amount ₹{amount:,.2f} is {deviation:.0%} above vendor average (₹{avg:,.2f})",
        }
    elif deviation > 1.0:  # >100% above average
        return {
            "penalty": 15,
            "detail": f"Amount ₹{amount:,.2f} is {deviation:.0%} above vendor average (₹{avg:,.2f})",
        }
    
    return None


def _check_missing_fields(doc_type: str, fields: dict) -> Dict[str, Any]:
    """Check for missing required fields based on doc type."""
    required_fields = {
        "INVOICE": ["invoice_number", "amount_total", "vendor_name"],
        "PURCHASE_ORDER": ["po_number", "amount_total"],
        "CONTRACT": ["contract_date", "parties"],
        "PAYMENT_CONFIRMATION": ["amount_paid", "payment_date"],
    }
    
    required = required_fields.get(doc_type, [])
    missing = [f for f in required if not fields.get(f)]
    
    if missing:
        return {
            "penalty": len(missing) * 5,
            "detail": f"Missing required fields: {', '.join(missing)}",
        }
    
    return None


def _get_amount(fields: dict) -> float:
    """Extract amount from fields."""
    for key in ["amount_total", "amount_paid", "contract_value"]:
        if key in fields:
            val = fields[key]
            if isinstance(val, (int, float)):
                return float(val)
            if isinstance(val, str):
                import re
                cleaned = re.sub(r"[^\d.]", "", val)
                try:
                    return float(cleaned)
                except ValueError:
                    pass
    return 0.0
