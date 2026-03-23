"""
DocNerve -- Step 6: Missing Document Chain Detector
Identifies gaps in expected enterprise document workflows.
Detects missing documents in procurement chains.

Agent: O3
"""
from __future__ import annotations
import re
import logging
import uuid
from typing import Any, Optional
from collections import defaultdict

from utils.parsers import parse_amount

logger = logging.getLogger(__name__)

# ============================================================================
# Chain Definitions
# ============================================================================

# Expected procurement chain (ordered sequence)
PROCUREMENT_CHAIN = [
    "PURCHASE_REQUISITION",
    "APPROVAL_NOTE",
    "PURCHASE_ORDER",
    "INVOICE",
    "GOODS_RECEIPT_NOTE",
    "PAYMENT_CONFIRMATION",
]

# Critical pairs: (if_present, must_have, alert_type, severity)
# "If we have X, we must have Y, otherwise raise alert Z"
CRITICAL_PAIRS = [
    # Payment without proof of delivery = CRITICAL
    ("PAYMENT_CONFIRMATION", "GOODS_RECEIPT_NOTE", "PAYMENT_WITHOUT_GRN", "CRITICAL"),
    # Invoice without PO = unauthorized procurement
    ("INVOICE", "PURCHASE_ORDER", "INVOICE_WITHOUT_PO", "HIGH"),
    # PO without approval = bypassed authorization
    ("PURCHASE_ORDER", "APPROVAL_NOTE", "PO_WITHOUT_APPROVAL", "HIGH"),
    # GRN without PO = received goods without order
    ("GOODS_RECEIPT_NOTE", "PURCHASE_ORDER", "GRN_WITHOUT_PO", "MEDIUM"),
    # Payment without invoice = unverified payment
    ("PAYMENT_CONFIRMATION", "INVOICE", "PAYMENT_WITHOUT_INVOICE", "CRITICAL"),
]

# Minimum supporting documents for a payment to be valid
PAYMENT_REQUIRED_SUPPORTS = {"INVOICE", "PURCHASE_ORDER", "GOODS_RECEIPT_NOTE"}


# ============================================================================
# Amount Extraction
# ============================================================================

def _get_amount_from_doc(doc: dict) -> float:
    """Extract amount from document structured_fields."""
    fields = doc.get("structured_fields", {})

    # Try various amount field names
    for key in ["amount_total", "amount_paid", "contract_value", "invoice_amount",
                "total_amount", "amount_subtotal"]:
        val = fields.get(key)
        if val is not None:
            parsed = parse_amount(val)
            if parsed is not None and parsed > 0:
                return parsed

    return 0.0


def _format_amount(amount: float) -> str:
    """Format amount for display."""
    if amount <= 0:
        return "Unknown"
    return f"₹{amount:,.2f}"


# ============================================================================
# Severity Calculation
# ============================================================================

def _calculate_severity(alert_type: str, amount: float) -> str:
    """
    Calculate severity based on alert type and amount at risk.
    """
    # Base severity from alert type
    base_severities = {
        "PAYMENT_WITHOUT_GRN": "CRITICAL",
        "PAYMENT_WITHOUT_INVOICE": "CRITICAL",
        "PAYMENT_WITHOUT_DOCUMENTATION": "CRITICAL",
        "INVOICE_WITHOUT_PO": "HIGH",
        "PO_WITHOUT_APPROVAL": "HIGH",
        "GRN_WITHOUT_PO": "MEDIUM",
    }

    base = base_severities.get(alert_type, "MEDIUM")

    # Upgrade severity based on amount
    if amount > 500000:  # >5L
        if base == "MEDIUM":
            return "HIGH"
        elif base == "HIGH":
            return "CRITICAL"
    elif amount > 100000:  # >1L
        if base == "MEDIUM":
            return "HIGH"

    return base


# ============================================================================
# Explanation Generation
# ============================================================================

def _generate_explanation(
    alert_type: str,
    missing_type: str,
    amount: float,
    po_number: str = "",
    vendor: str = "",
    trigger_filename: str = ""
) -> str:
    """Generate human-readable explanation for the alert."""

    amount_str = _format_amount(amount)

    explanations = {
        "PAYMENT_WITHOUT_GRN": (
            f"Payment of {amount_str} for PO {po_number} was released without a "
            f"Goods Receipt Note confirming delivery. No proof of delivery exists."
        ),
        "INVOICE_WITHOUT_PO": (
            f"Invoice ({trigger_filename}) for {amount_str} has no associated Purchase Order. "
            f"This may indicate unauthorized procurement."
        ),
        "PO_WITHOUT_APPROVAL": (
            f"Purchase Order {po_number} ({amount_str}) was issued without an Approval Note. "
            f"Authorization bypass detected."
        ),
        "GRN_WITHOUT_PO": (
            f"Goods were received (GRN present) for PO {po_number} without a corresponding "
            f"Purchase Order document on file."
        ),
        "PAYMENT_WITHOUT_INVOICE": (
            f"Payment of {amount_str} for PO {po_number} was made without a matching Invoice. "
            f"Payment verification not possible."
        ),
        "PAYMENT_WITHOUT_DOCUMENTATION": (
            f"Payment of {amount_str} to {vendor} has no supporting documentation "
            f"(no Invoice, PO, or GRN found). High fraud risk."
        ),
    }

    return explanations.get(
        alert_type,
        f"Missing {missing_type} in procurement chain for PO {po_number}. "
        f"Amount at risk: {amount_str}"
    )


def _generate_recommended_action(alert_type: str) -> str:
    """Generate recommended action for the alert."""
    actions = {
        "PAYMENT_WITHOUT_GRN": (
            "Obtain GRN retroactively from receiving department, or flag transaction "
            "for audit investigation."
        ),
        "INVOICE_WITHOUT_PO": (
            "Locate the original PO document, or classify as unauthorized procurement "
            "requiring management review."
        ),
        "PO_WITHOUT_APPROVAL": (
            "Verify if verbal/email approval was granted, and obtain written approval "
            "retroactively for compliance."
        ),
        "GRN_WITHOUT_PO": (
            "Verify if PO exists in another system, or flag as goods received without "
            "proper authorization."
        ),
        "PAYMENT_WITHOUT_INVOICE": (
            "Obtain invoice from vendor before processing, or flag for finance review."
        ),
        "PAYMENT_WITHOUT_DOCUMENTATION": (
            "Immediately halt any further payments to this vendor until full "
            "documentation is obtained and verified."
        ),
    }

    return actions.get(alert_type, "Review and obtain missing documentation.")


# ============================================================================
# Main Detection Logic
# ============================================================================

def detect_missing_chains(doc_graph: dict, documents: list[dict]) -> list[dict]:
    """
    Detect missing documents in procurement chains.

    Args:
        doc_graph: Graph from build_doc_graph (po_groups, vendor_groups, etc.)
        documents: List of doc dicts with structured_fields

    Returns:
        List of missing chain alert dicts with:
        - id, type, severity, missing_doc_type, present_docs, amount_at_risk, explanation
    """
    alerts = []
    docs_lookup = {d["id"]: d for d in documents}
    seen_alerts: set[str] = set()  # Prevent duplicate alerts

    # ========================================================================
    # Check PO-based chains
    # ========================================================================
    for po_number, doc_ids in doc_graph.get("po_groups", {}).items():
        if len(doc_ids) < 1:
            continue

        # Get documents and their types in this PO group
        group_docs = [docs_lookup[did] for did in doc_ids if did in docs_lookup]
        doc_types_present = {d["doc_type"] for d in group_docs}

        # Check all critical pairs
        for has_type, needs_type, alert_type, base_severity in CRITICAL_PAIRS:
            if has_type in doc_types_present and needs_type not in doc_types_present:
                # Generate unique key to prevent duplicates
                alert_key = f"{alert_type}:{po_number}"
                if alert_key in seen_alerts:
                    continue
                seen_alerts.add(alert_key)

                # Find the trigger document (the one that has_type)
                trigger_doc = next(
                    (d for d in group_docs if d["doc_type"] == has_type),
                    None
                )

                amount = 0.0
                trigger_filename = ""
                trigger_doc_id = ""

                if trigger_doc:
                    amount = _get_amount_from_doc(trigger_doc)
                    trigger_filename = trigger_doc.get("filename", "")
                    trigger_doc_id = trigger_doc["id"]

                # Calculate final severity
                severity = _calculate_severity(alert_type, amount)

                alerts.append({
                    "id": f"MISS-{uuid.uuid4().hex[:8]}",
                    "type": alert_type,
                    "severity": severity,
                    "po_number": po_number,
                    "missing_doc_type": needs_type,
                    "present_nodes": sorted(doc_types_present),
                    "missing_nodes": [needs_type],
                    "present_docs": doc_ids,
                    "trigger_doc_id": trigger_doc_id,
                    "trigger_doc_filename": trigger_filename,
                    "amount_at_risk": amount,
                    "amount_display": _format_amount(amount),
                    "explanation": _generate_explanation(
                        alert_type, needs_type, amount, po_number,
                        trigger_filename=trigger_filename
                    ),
                    "recommended_action": _generate_recommended_action(alert_type),
                })

    # ========================================================================
    # Check vendor-based patterns (payments without any supporting docs)
    # ========================================================================
    for vendor, doc_ids in doc_graph.get("vendor_groups", {}).items():
        if len(doc_ids) < 1:
            continue

        group_docs = [docs_lookup[did] for did in doc_ids if did in docs_lookup]
        doc_types_present = {d["doc_type"] for d in group_docs}

        # Payment without ANY supporting documentation
        if "PAYMENT_CONFIRMATION" in doc_types_present:
            supporting_present = doc_types_present & PAYMENT_REQUIRED_SUPPORTS

            if not supporting_present:
                # No supporting docs at all - critical!
                alert_key = f"PAYMENT_WITHOUT_DOCUMENTATION:{vendor}"
                if alert_key in seen_alerts:
                    continue
                seen_alerts.add(alert_key)

                payment_doc = next(
                    (d for d in group_docs if d["doc_type"] == "PAYMENT_CONFIRMATION"),
                    None
                )

                amount = 0.0
                trigger_filename = ""
                trigger_doc_id = ""

                if payment_doc:
                    amount = _get_amount_from_doc(payment_doc)
                    trigger_filename = payment_doc.get("filename", "")
                    trigger_doc_id = payment_doc["id"]

                alerts.append({
                    "id": f"MISS-{uuid.uuid4().hex[:8]}",
                    "type": "PAYMENT_WITHOUT_DOCUMENTATION",
                    "severity": "CRITICAL",
                    "vendor": vendor,
                    "missing_doc_type": "SUPPORTING_DOCUMENTATION",
                    "present_nodes": sorted(doc_types_present),
                    "missing_nodes": list(PAYMENT_REQUIRED_SUPPORTS),
                    "present_docs": doc_ids,
                    "trigger_doc_id": trigger_doc_id,
                    "trigger_doc_filename": trigger_filename,
                    "amount_at_risk": amount,
                    "amount_display": _format_amount(amount),
                    "explanation": _generate_explanation(
                        "PAYMENT_WITHOUT_DOCUMENTATION", "SUPPORTING_DOCUMENTATION",
                        amount, vendor=vendor
                    ),
                    "recommended_action": _generate_recommended_action(
                        "PAYMENT_WITHOUT_DOCUMENTATION"
                    ),
                })

    # ========================================================================
    # Check for orphan invoices (invoice groups without matching PO groups)
    # ========================================================================
    all_po_doc_ids = set()
    for doc_ids in doc_graph.get("po_groups", {}).values():
        all_po_doc_ids.update(doc_ids)

    for inv_num, doc_ids in doc_graph.get("invoice_groups", {}).items():
        for doc_id in doc_ids:
            doc = docs_lookup.get(doc_id)
            if not doc or doc["doc_type"] != "INVOICE":
                continue

            # If this invoice is not in any PO group, it's orphan
            if doc_id not in all_po_doc_ids:
                alert_key = f"ORPHAN_INVOICE:{doc_id}"
                if alert_key in seen_alerts:
                    continue
                seen_alerts.add(alert_key)

                amount = _get_amount_from_doc(doc)

                alerts.append({
                    "id": f"MISS-{uuid.uuid4().hex[:8]}",
                    "type": "ORPHAN_INVOICE",
                    "severity": "MEDIUM" if amount < 50000 else "HIGH",
                    "invoice_number": inv_num,
                    "missing_doc_type": "PURCHASE_ORDER",
                    "present_nodes": ["INVOICE"],
                    "missing_nodes": ["PURCHASE_ORDER"],
                    "present_docs": [doc_id],
                    "trigger_doc_id": doc_id,
                    "trigger_doc_filename": doc.get("filename", ""),
                    "amount_at_risk": amount,
                    "amount_display": _format_amount(amount),
                    "explanation": (
                        f"Invoice {inv_num} ({doc.get('filename', '')}) for "
                        f"{_format_amount(amount)} has no linked Purchase Order. "
                        f"Cannot verify authorization for this expense."
                    ),
                    "recommended_action": (
                        "Identify the PO this invoice belongs to, or flag as "
                        "unauthorized procurement."
                    ),
                })

    # Assign sequential IDs
    for i, alert in enumerate(alerts):
        alert["id"] = f"MISS-{i+1:03d}"

    # Sort by severity (CRITICAL > HIGH > MEDIUM > LOW)
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    alerts.sort(key=lambda x: severity_order.get(x.get("severity", "MEDIUM"), 2))

    logger.info(f"[ChainDetector] Found {len(alerts)} missing chain alerts")

    return alerts


# ============================================================================
# Helper Functions
# ============================================================================

def get_chain_completeness(doc_graph: dict, documents: list[dict]) -> dict:
    """
    Calculate chain completeness statistics.
    Useful for summary reporting.

    Args:
        doc_graph: Graph from build_doc_graph
        documents: List of doc dicts

    Returns:
        {
            "complete_chains": int,
            "incomplete_chains": int,
            "completeness_pct": float,
            "chain_details": [...]
        }
    """
    docs_lookup = {d["id"]: d for d in documents}

    stats = {
        "complete_chains": 0,
        "incomplete_chains": 0,
        "completeness_pct": 0.0,
        "chain_details": [],
    }

    # Define minimum required docs for a "complete" chain
    required_types = {"PURCHASE_ORDER", "INVOICE", "GOODS_RECEIPT_NOTE"}

    for po_number, doc_ids in doc_graph.get("po_groups", {}).items():
        group_docs = [docs_lookup[did] for did in doc_ids if did in docs_lookup]
        doc_types_present = {d["doc_type"] for d in group_docs}

        present_required = doc_types_present & required_types
        missing_required = required_types - doc_types_present
        is_complete = len(missing_required) == 0

        # Calculate total amount for this chain
        total_amount = sum(_get_amount_from_doc(d) for d in group_docs)

        if is_complete:
            stats["complete_chains"] += 1
        else:
            stats["incomplete_chains"] += 1

        stats["chain_details"].append({
            "po_number": po_number,
            "present_types": sorted(doc_types_present),
            "missing_types": sorted(missing_required),
            "complete": is_complete,
            "completeness_score": len(present_required) / len(required_types),
            "doc_count": len(group_docs),
            "total_amount": total_amount,
            "total_amount_display": _format_amount(total_amount),
        })

    total_chains = stats["complete_chains"] + stats["incomplete_chains"]
    if total_chains > 0:
        stats["completeness_pct"] = round(
            stats["complete_chains"] / total_chains * 100, 1
        )

    return stats


def get_alerts_by_severity(alerts: list[dict], severity: str) -> list[dict]:
    """Filter alerts by severity level."""
    return [a for a in alerts if a.get("severity") == severity]


def get_alerts_by_type(alerts: list[dict], alert_type: str) -> list[dict]:
    """Filter alerts by type."""
    return [a for a in alerts if a.get("type") == alert_type]


def get_total_amount_at_risk(alerts: list[dict]) -> float:
    """Calculate total amount at risk across all alerts."""
    return sum(a.get("amount_at_risk", 0) for a in alerts)


def summarize_missing_chains(alerts: list[dict]) -> dict:
    """Generate summary statistics for missing chain alerts."""
    by_type = defaultdict(int)
    by_severity = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    total_risk = 0.0

    for alert in alerts:
        by_type[alert.get("type", "UNKNOWN")] += 1
        sev = alert.get("severity", "MEDIUM")
        if sev in by_severity:
            by_severity[sev] += 1
        total_risk += alert.get("amount_at_risk", 0)

    return {
        "total_alerts": len(alerts),
        "by_type": dict(by_type),
        "by_severity": by_severity,
        "total_amount_at_risk": total_risk,
        "total_amount_at_risk_display": _format_amount(total_risk),
    }
