"""
DocNerve -- Step 5: Contradiction Engine (3-Layer Hybrid)
Layer 1: Rule-based (numerical + date fields)
Layer 2: NLI Semantic (DeBERTa v3 small -- CPU)
Layer 3: Cross-document logic checks

Detects contradictions between related documents.

Agent: O3
"""
from __future__ import annotations
import re
import itertools
import logging
import uuid
import warnings
from typing import Optional, Any
from datetime import datetime

from utils.parsers import parse_amount, parse_date
from config import (
    AMOUNT_MISMATCH_THRESHOLD,
    AMOUNT_HIGH_SEVERITY_THRESHOLD,
    NLI_CONTRADICTION_CONFIDENCE,
    MODEL_PATHS,
)

logger = logging.getLogger(__name__)

# ============================================================================
# Field Categories for Comparison
# ============================================================================

NUMERICAL_FIELDS = [
    "amount_total", "amount_subtotal", "contract_value", "liability_cap",
    "amount_paid", "tax_amount", "discount_amount", "shipping_cost"
]

DATE_FIELDS = [
    "delivery_deadline", "due_date", "expiry_date", "payment_due_date",
    "start_date", "end_date", "effective_date"
]

SEMANTIC_FIELDS = [
    "payment_terms", "jurisdiction", "penalty_clause", "termination_notice",
    "warranty_period", "liability_clause", "indemnification", "force_majeure"
]

# ============================================================================
# NLI Model Management (CPU Only)
# ============================================================================

_nli_model = None
_nli_available = True  # Flag to avoid repeated load attempts


def _load_nli_model():
    """Load NLI model lazily. Returns model or None if unavailable."""
    global _nli_model, _nli_available

    if not _nli_available:
        return None

    if _nli_model is not None:
        return _nli_model

    try:
        with warnings.catch_warnings():
            # Some environments emit RequestsDependencyWarning from transitive deps.
            warnings.filterwarnings(
                "ignore",
                message=r"urllib3.*chardet.*charset_normalizer.*",
                category=Warning,
            )
            from sentence_transformers import CrossEncoder

        nli_path = MODEL_PATHS.get("nli_deberta")
        if not nli_path:
            logger.warning("[Contradiction] NLI model path not configured")
            _nli_available = False
            return None

        logger.info(f"[Contradiction] Loading NLI model from {nli_path}...")
        _nli_model = CrossEncoder(nli_path, device="cpu")
        logger.info("[Contradiction] NLI model loaded successfully (CPU)")
        return _nli_model

    except ImportError:
        logger.warning("[Contradiction] sentence-transformers not installed, NLI disabled")
        _nli_available = False
        return None
    except Exception as e:
        logger.error(f"[Contradiction] Failed to load NLI model: {e}")
        _nli_available = False
        return None


# ============================================================================
# Layer 1: Rule-Based Checks
# ============================================================================

def _check_amount_mismatch(
    doc_a: dict, doc_b: dict, field: str, po_number: str = ""
) -> Optional[dict]:
    """Check for amount mismatches between two documents."""
    sf_a = doc_a.get("structured_fields", {})
    sf_b = doc_b.get("structured_fields", {})

    val_a = parse_amount(sf_a.get(field))
    val_b = parse_amount(sf_b.get(field))

    if val_a is None or val_b is None:
        return None
    if val_a <= 0 or val_b <= 0:
        return None

    diff = abs(val_a - val_b)
    rel_diff = diff / max(val_a, val_b)

    if rel_diff <= AMOUNT_MISMATCH_THRESHOLD:
        return None

    # Determine severity
    if diff > AMOUNT_HIGH_SEVERITY_THRESHOLD:
        severity = "HIGH"
    elif rel_diff > 0.10:  # >10% difference
        severity = "MEDIUM"
    else:
        severity = "LOW"

    pct = round(rel_diff * 100, 1)

    # Determine which is source (PO/Contract) vs derived (Invoice)
    type_a = doc_a.get("doc_type", "")
    type_b = doc_b.get("doc_type", "")

    source_types = {"PURCHASE_ORDER", "CONTRACT", "AGREEMENT"}
    derived_types = {"INVOICE", "PAYMENT_CONFIRMATION"}

    if type_a in source_types and type_b in derived_types:
        if val_b > val_a:
            explanation = (
                f"Invoice amount (₹{val_b:,.2f}) exceeds authorized {type_a} amount "
                f"(₹{val_a:,.2f}) by ₹{diff:,.2f} ({pct}%)"
            )
        else:
            explanation = (
                f"Invoice amount (₹{val_b:,.2f}) is ₹{diff:,.2f} ({pct}%) less than "
                f"{type_a} amount (₹{val_a:,.2f})"
            )
    elif type_b in source_types and type_a in derived_types:
        if val_a > val_b:
            explanation = (
                f"Invoice amount (₹{val_a:,.2f}) exceeds authorized {type_b} amount "
                f"(₹{val_b:,.2f}) by ₹{diff:,.2f} ({pct}%)"
            )
        else:
            explanation = (
                f"Invoice amount (₹{val_a:,.2f}) is ₹{diff:,.2f} ({pct}%) less than "
                f"{type_b} amount (₹{val_b:,.2f})"
            )
    else:
        higher_doc = doc_b["filename"] if val_b > val_a else doc_a["filename"]
        explanation = (
            f"Amount mismatch in {field}: {doc_a['filename']} has ₹{val_a:,.2f}, "
            f"{doc_b['filename']} has ₹{val_b:,.2f} (difference: ₹{diff:,.2f}, {pct}% higher in {higher_doc})"
        )

    return {
        "id": f"CONT-{uuid.uuid4().hex[:8]}",
        "type": "AMOUNT_MISMATCH",
        "field": field,
        "severity": severity,
        "doc_1_id": doc_a["id"],
        "doc_2_id": doc_b["id"],
        "doc_a": {
            "id": doc_a["id"],
            "filename": doc_a.get("filename", ""),
            "type": doc_a.get("doc_type", "UNKNOWN")
        },
        "doc_b": {
            "id": doc_b["id"],
            "filename": doc_b.get("filename", ""),
            "type": doc_b.get("doc_type", "UNKNOWN")
        },
        "value_1": val_a,
        "value_2": val_b,
        "doc_a_value": sf_a.get(field, ""),
        "doc_b_value": sf_b.get(field, ""),
        "difference": diff,
        "difference_pct": pct,
        "explanation": explanation,
        "layer": "rule",
        "po_number": po_number,
    }


def _check_date_conflict(
    doc_a: dict, doc_b: dict, field: str, po_number: str = ""
) -> Optional[dict]:
    """Check for date conflicts between two documents."""
    sf_a = doc_a.get("structured_fields", {})
    sf_b = doc_b.get("structured_fields", {})

    raw_a = sf_a.get(field)
    raw_b = sf_b.get(field)

    if not raw_a or not raw_b:
        return None

    date_a = parse_date(raw_a)
    date_b = parse_date(raw_b)

    if not date_a or not date_b:
        return None
    if date_a == date_b:
        return None

    days_diff = abs((date_b - date_a).days)

    # Determine severity based on days difference
    if days_diff > 30:
        severity = "HIGH"
    elif days_diff > 7:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    explanation = (
        f"Date conflict in {field}: {doc_a['filename']} has {raw_a}, "
        f"{doc_b['filename']} has {raw_b} ({days_diff} days apart)"
    )

    return {
        "id": f"CONT-{uuid.uuid4().hex[:8]}",
        "type": "DATE_CONFLICT",
        "field": field,
        "severity": severity,
        "doc_1_id": doc_a["id"],
        "doc_2_id": doc_b["id"],
        "doc_a": {
            "id": doc_a["id"],
            "filename": doc_a.get("filename", ""),
            "type": doc_a.get("doc_type", "UNKNOWN")
        },
        "doc_b": {
            "id": doc_b["id"],
            "filename": doc_b.get("filename", ""),
            "type": doc_b.get("doc_type", "UNKNOWN")
        },
        "value_1": str(date_a.date()) if date_a else raw_a,
        "value_2": str(date_b.date()) if date_b else raw_b,
        "doc_a_value": raw_a,
        "doc_b_value": raw_b,
        "difference": days_diff,
        "explanation": explanation,
        "layer": "rule",
        "po_number": po_number,
    }


def _check_cross_document_logic(doc_a: dict, doc_b: dict, po_number: str = "") -> list[dict]:
    """
    Layer 3: Cross-document logic checks.
    E.g., Invoice date after contract expiry, payment before delivery, etc.
    """
    contradictions = []
    sf_a = doc_a.get("structured_fields", {})
    sf_b = doc_b.get("structured_fields", {})
    type_a = doc_a.get("doc_type", "")
    type_b = doc_b.get("doc_type", "")

    # Check: Invoice date vs Contract expiry date
    contract_doc = None
    invoice_doc = None

    if type_a == "CONTRACT" and type_b == "INVOICE":
        contract_doc, invoice_doc = doc_a, doc_b
    elif type_b == "CONTRACT" and type_a == "INVOICE":
        contract_doc, invoice_doc = doc_b, doc_a

    if contract_doc and invoice_doc:
        contract_sf = contract_doc.get("structured_fields", {})
        invoice_sf = invoice_doc.get("structured_fields", {})

        expiry_raw = contract_sf.get("expiry_date") or contract_sf.get("end_date")
        invoice_date_raw = invoice_sf.get("invoice_date") or invoice_sf.get("issue_date")

        if expiry_raw and invoice_date_raw:
            expiry_date = parse_date(expiry_raw)
            invoice_date = parse_date(invoice_date_raw)

            if expiry_date and invoice_date and invoice_date > expiry_date:
                days_late = (invoice_date - expiry_date).days
                severity = "HIGH" if days_late > 30 else "MEDIUM"

                contradictions.append({
                    "id": f"CONT-{uuid.uuid4().hex[:8]}",
                    "type": "INVOICE_AFTER_CONTRACT_EXPIRY",
                    "field": "date",
                    "severity": severity,
                    "doc_1_id": contract_doc["id"],
                    "doc_2_id": invoice_doc["id"],
                    "doc_a": {
                        "id": contract_doc["id"],
                        "filename": contract_doc.get("filename", ""),
                        "type": "CONTRACT"
                    },
                    "doc_b": {
                        "id": invoice_doc["id"],
                        "filename": invoice_doc.get("filename", ""),
                        "type": "INVOICE"
                    },
                    "value_1": str(expiry_date.date()),
                    "value_2": str(invoice_date.date()),
                    "doc_a_value": expiry_raw,
                    "doc_b_value": invoice_date_raw,
                    "difference": days_late,
                    "explanation": (
                        f"Invoice dated {invoice_date.date()} is {days_late} days after "
                        f"contract expiry date ({expiry_date.date()})"
                    ),
                    "layer": "logic",
                    "po_number": po_number,
                })

    # Check: Delivery date vs Due date mismatch
    delivery_raw = sf_a.get("delivery_deadline") or sf_a.get("delivery_date")
    due_raw = sf_b.get("due_date") or sf_b.get("payment_due_date")

    if not delivery_raw:
        delivery_raw = sf_b.get("delivery_deadline") or sf_b.get("delivery_date")
        due_raw = sf_a.get("due_date") or sf_a.get("payment_due_date")

    if delivery_raw and due_raw:
        delivery_date = parse_date(delivery_raw)
        due_date = parse_date(due_raw)

        if delivery_date and due_date and due_date < delivery_date:
            days_diff = (delivery_date - due_date).days

            contradictions.append({
                "id": f"CONT-{uuid.uuid4().hex[:8]}",
                "type": "PAYMENT_DUE_BEFORE_DELIVERY",
                "field": "date",
                "severity": "MEDIUM",
                "doc_1_id": doc_a["id"],
                "doc_2_id": doc_b["id"],
                "doc_a": {
                    "id": doc_a["id"],
                    "filename": doc_a.get("filename", ""),
                    "type": doc_a.get("doc_type", "UNKNOWN")
                },
                "doc_b": {
                    "id": doc_b["id"],
                    "filename": doc_b.get("filename", ""),
                    "type": doc_b.get("doc_type", "UNKNOWN")
                },
                "value_1": str(delivery_date.date()),
                "value_2": str(due_date.date()),
                "difference": days_diff,
                "explanation": (
                    f"Payment due date ({due_date.date()}) is {days_diff} days before "
                    f"delivery deadline ({delivery_date.date()})"
                ),
                "layer": "logic",
                "po_number": po_number,
            })

    return contradictions


def _rule_contradictions(doc_a: dict, doc_b: dict, po_number: str = "") -> list[dict]:
    """Run all rule-based contradiction checks."""
    contradictions = []

    # Amount comparisons
    for field in NUMERICAL_FIELDS:
        result = _check_amount_mismatch(doc_a, doc_b, field, po_number)
        if result:
            contradictions.append(result)

    # Date comparisons
    for field in DATE_FIELDS:
        result = _check_date_conflict(doc_a, doc_b, field, po_number)
        if result:
            contradictions.append(result)

    # Cross-document logic
    logic_results = _check_cross_document_logic(doc_a, doc_b, po_number)
    contradictions.extend(logic_results)

    return contradictions


# ============================================================================
# Layer 2: NLI Semantic Checks
# ============================================================================

def _nli_contradictions(doc_a: dict, doc_b: dict, po_number: str = "") -> list[dict]:
    """Run NLI model to detect semantic contradictions."""
    nli_model = _load_nli_model()
    if nli_model is None:
        return []

    contradictions = []
    sf_a = doc_a.get("structured_fields", {})
    sf_b = doc_b.get("structured_fields", {})

    pairs = []
    fields_to_check = []

    for field in SEMANTIC_FIELDS:
        val_a = sf_a.get(field, "")
        val_b = sf_b.get(field, "")

        if val_a and val_b and str(val_a).strip() and str(val_b).strip():
            val_a_str = str(val_a).strip()
            val_b_str = str(val_b).strip()

            # Skip if values are identical
            if val_a_str.lower() == val_b_str.lower():
                continue

            stmt_a = f"{doc_a.get('doc_type', 'Document')} states {field}: {val_a_str}"
            stmt_b = f"{doc_b.get('doc_type', 'Document')} states {field}: {val_b_str}"
            pairs.append([stmt_a, stmt_b])
            fields_to_check.append((field, val_a_str, val_b_str))

    if not pairs:
        return []

    try:
        scores_batch = nli_model.predict(pairs)

        for (field, val_a, val_b), scores in zip(fields_to_check, scores_batch):
            labels = ["contradiction", "entailment", "neutral"]
            label_idx = int(scores.argmax())
            label = labels[label_idx]
            confidence = float(scores.max())

            if label == "contradiction" and confidence >= NLI_CONTRADICTION_CONFIDENCE:
                severity = "HIGH" if confidence >= 0.85 else "MEDIUM"

                contradictions.append({
                    "id": f"CONT-{uuid.uuid4().hex[:8]}",
                    "type": "SEMANTIC_CONFLICT",
                    "field": field,
                    "severity": severity,
                    "doc_1_id": doc_a["id"],
                    "doc_2_id": doc_b["id"],
                    "doc_a": {
                        "id": doc_a["id"],
                        "filename": doc_a.get("filename", ""),
                        "type": doc_a.get("doc_type", "UNKNOWN")
                    },
                    "doc_b": {
                        "id": doc_b["id"],
                        "filename": doc_b.get("filename", ""),
                        "type": doc_b.get("doc_type", "UNKNOWN")
                    },
                    "value_1": val_a,
                    "value_2": val_b,
                    "doc_a_value": val_a,
                    "doc_b_value": val_b,
                    "nli_confidence": round(confidence, 3),
                    "explanation": (
                        f"Semantic contradiction detected in {field}: "
                        f"'{val_a[:50]}...' vs '{val_b[:50]}...' "
                        f"(confidence: {confidence:.0%})"
                    ),
                    "layer": "nli",
                    "po_number": po_number,
                })

    except Exception as e:
        logger.error(f"[Contradiction] NLI inference failed: {e}")

    return contradictions


# ============================================================================
# Main Entry Point
# ============================================================================

def detect_contradictions(documents: list[dict], doc_graph: dict) -> list[dict]:
    """
    Detect all contradictions across related document pairs.
    Only compares documents that share a PO number or vendor.

    Args:
        documents: List of doc dicts with structured_fields
        doc_graph: Graph from build_doc_graph

    Returns:
        List of contradiction dicts with:
        - id, type, severity, doc_1_id, doc_2_id, field, value_1, value_2, explanation
    """
    all_contradictions = []
    seen_pairs: set[tuple[str, str]] = set()

    # Build related pairs from PO groups
    related_pairs: list[tuple[str, str, str]] = []

    for po_number, doc_ids in doc_graph.get("po_groups", {}).items():
        for id_a, id_b in itertools.combinations(doc_ids, 2):
            pair_key = tuple(sorted([id_a, id_b]))
            if pair_key not in seen_pairs:
                seen_pairs.add(pair_key)
                related_pairs.append((id_a, id_b, po_number))

    # Also compare docs by vendor (if not already compared via PO)
    for vendor, doc_ids in doc_graph.get("vendor_groups", {}).items():
        for id_a, id_b in itertools.combinations(doc_ids, 2):
            pair_key = tuple(sorted([id_a, id_b]))
            if pair_key not in seen_pairs:
                seen_pairs.add(pair_key)
                related_pairs.append((id_a, id_b, ""))

    # Also compare docs by invoice number
    for inv_num, doc_ids in doc_graph.get("invoice_groups", {}).items():
        for id_a, id_b in itertools.combinations(doc_ids, 2):
            pair_key = tuple(sorted([id_a, id_b]))
            if pair_key not in seen_pairs:
                seen_pairs.add(pair_key)
                related_pairs.append((id_a, id_b, ""))

    docs_lookup = {d["id"]: d for d in documents}

    for id_a, id_b, po_number in related_pairs:
        doc_a = docs_lookup.get(id_a)
        doc_b = docs_lookup.get(id_b)

        if not doc_a or not doc_b:
            continue

        try:
            # Layer 1 + 3: Rule-based + Logic checks
            rule_hits = _rule_contradictions(doc_a, doc_b, po_number)
            all_contradictions.extend(rule_hits)

            # Layer 2: NLI semantic checks
            nli_hits = _nli_contradictions(doc_a, doc_b, po_number)
            all_contradictions.extend(nli_hits)

        except Exception as e:
            logger.error(
                f"[Contradiction] Error comparing {id_a} vs {id_b}: {e}"
            )
            continue

    # Assign sequential IDs (override UUIDs for cleaner numbering)
    for i, c in enumerate(all_contradictions):
        c["id"] = f"CONT-{i+1:03d}"

    logger.info(f"[Contradiction] Found {len(all_contradictions)} contradictions")

    return all_contradictions


# ============================================================================
# Helper Functions
# ============================================================================

def get_contradictions_by_severity(
    contradictions: list[dict], severity: str
) -> list[dict]:
    """Filter contradictions by severity level."""
    return [c for c in contradictions if c.get("severity") == severity]


def get_contradictions_for_doc(
    contradictions: list[dict], doc_id: str
) -> list[dict]:
    """Get all contradictions involving a specific document."""
    return [
        c for c in contradictions
        if c.get("doc_1_id") == doc_id or c.get("doc_2_id") == doc_id
    ]


def summarize_contradictions(contradictions: list[dict]) -> dict:
    """Generate summary statistics for contradictions."""
    by_type = {}
    by_severity = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
    by_layer = {"rule": 0, "nli": 0, "logic": 0}

    for c in contradictions:
        c_type = c.get("type", "UNKNOWN")
        by_type[c_type] = by_type.get(c_type, 0) + 1

        sev = c.get("severity", "MEDIUM")
        if sev in by_severity:
            by_severity[sev] += 1

        layer = c.get("layer", "rule")
        if layer in by_layer:
            by_layer[layer] += 1

    return {
        "total": len(contradictions),
        "by_type": by_type,
        "by_severity": by_severity,
        "by_layer": by_layer,
    }
