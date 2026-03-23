"""
DocNerve -- Step 4: Document Graph Builder
Links documents by PO number, vendor, invoice, and entities.
Builds the central intelligence structure for cross-document analysis.

Agent: O3
"""
from __future__ import annotations
import re
import logging
from datetime import datetime
from typing import Any, Set
from collections import defaultdict

from utils.parsers import parse_date, normalize_vendor

logger = logging.getLogger(__name__)

# ============================================================================
# PO Number Extraction Patterns
# ============================================================================
_PO_PATTERNS = [
    re.compile(r"(?:PO|P\.O\.|Purchase\s*Order)\s*[#:\-]?\s*([A-Z0-9\-/]+\d+)", re.IGNORECASE),
    re.compile(r"PO\s*#?\s*(\d{3,})", re.IGNORECASE),
    re.compile(r"Order\s+(?:No\.?|Number|#)\s*[:\-]?\s*([A-Z0-9\-/]+)", re.IGNORECASE),
]


def _extract_po_from_text(text: str) -> list[str]:
    """Extract PO numbers from raw text using regex patterns."""
    po_numbers = set()
    if not text:
        return []

    for pattern in _PO_PATTERNS:
        matches = pattern.findall(text)
        for match in matches:
            po = match.strip().upper()
            if len(po) >= 3:  # Minimum 3 chars for valid PO
                po_numbers.add(po)

    return list(po_numbers)


def _safe_str(value: Any) -> str:
    """Safely convert value to stripped string."""
    if value is None:
        return ""
    return str(value).strip()


def _extract_all_po_numbers(doc: dict) -> list[str]:
    """
    Extract all PO numbers from a document.
    Sources: structured_fields + full_text regex extraction.
    """
    po_numbers = set()
    sf = doc.get("structured_fields", {})

    # From structured fields - check multiple possible field names
    po_field_names = [
        "purchase_order_number", "po_number", "po_reference",
        "purchase_order", "order_number", "po_ref"
    ]

    for field_name in po_field_names:
        val = sf.get(field_name)
        if val:
            po = _safe_str(val).upper()
            if po and len(po) >= 2:
                po_numbers.add(po)

    # From full_text using regex
    text = doc.get("full_text", "")
    if text:
        text_pos = _extract_po_from_text(text)
        po_numbers.update(text_pos)

    return list(po_numbers)


def _extract_invoice_numbers(doc: dict) -> list[str]:
    """Extract invoice numbers from document."""
    invoice_numbers = set()
    sf = doc.get("structured_fields", {})

    # From structured fields
    inv_field_names = ["invoice_number", "invoice_no", "inv_number", "bill_number"]

    for field_name in inv_field_names:
        val = sf.get(field_name)
        if val:
            inv = _safe_str(val).upper()
            if inv and len(inv) >= 2:
                invoice_numbers.add(inv)

    return list(invoice_numbers)


# ============================================================================
# Entity Extraction
# ============================================================================

# Role mappings for structured fields
_ROLE_FIELD_MAP = {
    "approved_by": "Approver",
    "authorized_by": "Authorizer",
    "prepared_by": "Preparer",
    "submitted_by": "Submitter",
    "received_by": "Receiver",
    "signed_by": "Signatory",
    "project_lead": "Project Lead",
    "project_manager": "Project Manager",
    "buyer_name": "Buyer",
    "seller_name": "Seller",
    "vendor_contact": "Vendor Contact",
    "customer_contact": "Customer Contact",
}

# Regex patterns for extracting named entities from text
_ENTITY_TEXT_PATTERNS = [
    (re.compile(r"(?:Approved\s*by|Authorized\s*by)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})", re.IGNORECASE), "Approver"),
    (re.compile(r"(?:Prepared\s*by|Submitted\s*by)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})", re.IGNORECASE), "Preparer"),
    (re.compile(r"(?:Received\s*by)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})", re.IGNORECASE), "Receiver"),
    (re.compile(r"(?:Project\s*Lead|Team\s*Lead|Manager)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})", re.IGNORECASE), "Lead"),
    (re.compile(r"(?:Contact\s*Person|Point\s+of\s+Contact)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})", re.IGNORECASE), "Contact"),
]

# Words to exclude (not actual names)
_COMMON_WORDS = frozenset({
    "the", "and", "for", "with", "from", "this", "that", "total", "amount",
    "date", "page", "invoice", "order", "purchase", "payment", "goods",
    "receipt", "note", "contract", "agreement", "terms", "conditions"
})


def _is_valid_name(name: str) -> bool:
    """Check if extracted text is likely a valid person name."""
    if not name or len(name) < 3:
        return False
    if name.lower() in _COMMON_WORDS:
        return False
    # Must contain at least one letter
    if not any(c.isalpha() for c in name):
        return False
    # Should have reasonable length
    if len(name) > 50:
        return False
    return True


def _extract_entities(doc: dict) -> list[tuple[str, str]]:
    """
    Extract named entities (people) with their roles.
    Returns: [(name, role), ...]
    """
    entities: list[tuple[str, str]] = []
    sf = doc.get("structured_fields", {})
    seen_names = set()

    # From structured fields - role-specific fields
    for field_name, role in _ROLE_FIELD_MAP.items():
        val = sf.get(field_name)
        if val:
            name = _safe_str(val)
            name_lower = name.lower()
            if _is_valid_name(name) and name_lower not in seen_names:
                seen_names.add(name_lower)
                entities.append((name, role))

    # From people_mentioned array (if present)
    people_mentioned = sf.get("people_mentioned", [])
    if isinstance(people_mentioned, list):
        for person in people_mentioned:
            if isinstance(person, str):
                name = _safe_str(person)
                name_lower = name.lower()
                if _is_valid_name(name) and name_lower not in seen_names:
                    seen_names.add(name_lower)
                    entities.append((name, "Personnel"))
            elif isinstance(person, dict):
                name = _safe_str(person.get("name", ""))
                role = person.get("role", "Personnel")
                name_lower = name.lower()
                if _is_valid_name(name) and name_lower not in seen_names:
                    seen_names.add(name_lower)
                    entities.append((name, role))

    # From key_personnel array (if present)
    key_personnel = sf.get("key_personnel", [])
    if isinstance(key_personnel, list):
        for person in key_personnel:
            if isinstance(person, str):
                name = _safe_str(person)
                name_lower = name.lower()
                if _is_valid_name(name) and name_lower not in seen_names:
                    seen_names.add(name_lower)
                    entities.append((name, "Key Personnel"))
            elif isinstance(person, dict):
                name = _safe_str(person.get("name", ""))
                role = person.get("role", "Key Personnel")
                name_lower = name.lower()
                if _is_valid_name(name) and name_lower not in seen_names:
                    seen_names.add(name_lower)
                    entities.append((name, role))

    # From organizations_mentioned
    orgs_mentioned = sf.get("organizations_mentioned", [])
    if isinstance(orgs_mentioned, list):
        for org in orgs_mentioned:
            if isinstance(org, str):
                org_name = _safe_str(org)
                org_lower = org_name.lower()
                if org_name and org_lower not in seen_names:
                    seen_names.add(org_lower)
                    entities.append((org_name, "Organization"))

    # From full_text using regex patterns
    text = doc.get("full_text", "")
    if text:
        for pattern, role in _ENTITY_TEXT_PATTERNS:
            matches = pattern.findall(text)
            for name in matches:
                name = _safe_str(name)
                name_lower = name.lower()
                if _is_valid_name(name) and name_lower not in seen_names:
                    seen_names.add(name_lower)
                    entities.append((name, role))

    return entities


# ============================================================================
# Date/Timeline Extraction
# ============================================================================

# Map of field names to event types
_DATE_FIELD_MAP = {
    "invoice_date": "Invoice Issued",
    "issue_date": "Document Issued",
    "po_date": "PO Created",
    "order_date": "Order Placed",
    "effective_date": "Contract Effective",
    "start_date": "Contract Start",
    "contract_date": "Contract Signed",
    "due_date": "Payment Due",
    "payment_due_date": "Payment Due",
    "delivery_date": "Expected Delivery",
    "delivery_deadline": "Delivery Deadline",
    "expiry_date": "Contract Expires",
    "end_date": "Contract End",
    "grn_date": "Goods Received",
    "receipt_date": "Receipt Date",
    "payment_date": "Payment Made",
}


def _extract_date_events(doc: dict) -> list[dict]:
    """
    Extract dates and create timeline events.
    Returns list of event dicts with date_obj for sorting.
    """
    events = []
    sf = doc.get("structured_fields", {})
    doc_id = doc.get("id", "unknown")
    doc_type = doc.get("doc_type", "UNKNOWN")
    filename = doc.get("filename", "")

    for field_name, event_type in _DATE_FIELD_MAP.items():
        val = sf.get(field_name)
        if val:
            date_str = _safe_str(val)
            if date_str:
                date_obj = parse_date(date_str)
                events.append({
                    "date": date_str,
                    "date_obj": date_obj,  # For sorting (may be None)
                    "event_type": event_type,
                    "field": field_name,
                    "doc_id": doc_id,
                    "doc_type": doc_type,
                    "filename": filename,
                })

    return events


# ============================================================================
# Main Entry Point
# ============================================================================

def build_doc_graph(documents: list[dict]) -> dict:
    """
    Build the doc graph -- the central intelligence structure.

    Args:
        documents: List of doc dicts with structured_fields, full_text, etc.

    Returns:
        {
            "po_groups":      {po_number: [doc_ids]},
            "vendor_groups":  {vendor_name: [doc_ids]},
            "invoice_groups": {invoice_number: [doc_ids]},
            "entity_matrix":  {entity_name: {doc_id: role}},
            "date_sequence":  [{date, date_obj, event_type, doc_id, ...}],
        }
    """
    graph: dict = {
        "po_groups": defaultdict(list),
        "vendor_groups": defaultdict(list),
        "invoice_groups": defaultdict(list),
        "entity_matrix": defaultdict(dict),
        "date_sequence": [],
    }

    # Track known vendors for fuzzy matching
    known_vendors: list[str] = []

    for doc in documents:
        try:
            doc_id = doc.get("id", "unknown")
            sf = doc.get("structured_fields", {})

            # ---- Group by PO Number ----
            po_numbers = _extract_all_po_numbers(doc)
            for po in po_numbers:
                if po not in graph["po_groups"] or doc_id not in graph["po_groups"][po]:
                    graph["po_groups"][po].append(doc_id)

            # ---- Group by Vendor (fuzzy normalized) ----
            vendor = sf.get("vendor_name") or sf.get("supplier_name") or ""
            vendor = _safe_str(vendor)
            if vendor:
                normalized = normalize_vendor(vendor, known_vendors)
                if normalized not in known_vendors:
                    known_vendors.append(normalized)
                if doc_id not in graph["vendor_groups"][normalized]:
                    graph["vendor_groups"][normalized].append(doc_id)

            # ---- Group by Invoice Number ----
            invoice_numbers = _extract_invoice_numbers(doc)
            for inv_num in invoice_numbers:
                if doc_id not in graph["invoice_groups"][inv_num]:
                    graph["invoice_groups"][inv_num].append(doc_id)

            # ---- Entity Matrix ----
            entities = _extract_entities(doc)
            for entity_name, role in entities:
                graph["entity_matrix"][entity_name][doc_id] = role

            # ---- Date Sequence ----
            date_events = _extract_date_events(doc)
            graph["date_sequence"].extend(date_events)

        except Exception as e:
            logger.warning(f"[GraphBuilder] Error processing doc {doc.get('id', 'unknown')}: {e}")
            continue

    # Sort date sequence chronologically (None dates go to the end)
    graph["date_sequence"].sort(
        key=lambda x: x.get("date_obj") or datetime.max
    )

    # Convert defaultdicts to regular dicts for JSON serialization
    graph["po_groups"] = dict(graph["po_groups"])
    graph["vendor_groups"] = dict(graph["vendor_groups"])
    graph["invoice_groups"] = dict(graph["invoice_groups"])
    graph["entity_matrix"] = dict(graph["entity_matrix"])

    logger.info(
        f"[GraphBuilder] Built graph: "
        f"{len(graph['po_groups'])} PO groups, "
        f"{len(graph['vendor_groups'])} vendor groups, "
        f"{len(graph['entity_matrix'])} entities, "
        f"{len(graph['date_sequence'])} date events"
    )

    return graph


# ============================================================================
# Helper Functions
# ============================================================================

def get_related_docs(doc_graph: dict, doc_id: str) -> Set[str]:
    """
    Get all document IDs related to a given document.
    A document is related if it shares a PO number, vendor, or invoice number.

    Args:
        doc_graph: Graph from build_doc_graph
        doc_id: The document ID to find relations for

    Returns:
        Set of related document IDs (excluding the input doc_id)
    """
    related = set()

    # Related by PO
    for po, doc_ids in doc_graph.get("po_groups", {}).items():
        if doc_id in doc_ids:
            related.update(doc_ids)

    # Related by vendor
    for vendor, doc_ids in doc_graph.get("vendor_groups", {}).items():
        if doc_id in doc_ids:
            related.update(doc_ids)

    # Related by invoice
    for inv, doc_ids in doc_graph.get("invoice_groups", {}).items():
        if doc_id in doc_ids:
            related.update(doc_ids)

    # Remove self
    related.discard(doc_id)

    return related


def get_docs_by_entity(doc_graph: dict, entity_name: str) -> dict[str, str]:
    """
    Get all documents that mention a specific entity.

    Args:
        doc_graph: Graph from build_doc_graph
        entity_name: The entity name to search for

    Returns:
        Dict mapping doc_id -> role
    """
    return doc_graph.get("entity_matrix", {}).get(entity_name, {})


def get_timeline_for_po(doc_graph: dict, po_number: str) -> list[dict]:
    """
    Get chronological timeline events for a specific PO.

    Args:
        doc_graph: Graph from build_doc_graph
        po_number: The PO number to filter by

    Returns:
        List of date events for documents in this PO group
    """
    # Get doc IDs in this PO group
    po_doc_ids = set(doc_graph.get("po_groups", {}).get(po_number, []))

    if not po_doc_ids:
        return []

    # Filter timeline events
    timeline = [
        event for event in doc_graph.get("date_sequence", [])
        if event.get("doc_id") in po_doc_ids
    ]

    return timeline
