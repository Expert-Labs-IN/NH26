"""
DocNerve — NuExtract 2.0 JSON Schemas
======================================
One schema per document type. Values use NuExtract 2.0 typed annotations:

    "verbatim-string"       → IDs, reference numbers, names, exact text
    "string"                → free-form / summarised text
    "number"                → monetary amounts, quantities
    "date-time"             → any date or datetime value
    ["verbatim-string"]     → strict list of verbatim strings
    ["string"]              → less-strict list of strings
    ["opt1", "opt2", ...]   → enum — model picks one of the listed values

Dictionaries:
    SCHEMAS          — the 8 locked public types + OTHER (used by the classifier
                       and all downstream logic).
    EXTENDED_SCHEMAS — additional non-locked types kept for optional use;
                       NOT exposed as public document types.

Linking conventions (preserved across types):
    - purchase_order_number / po_number  : PO-chain linking alias pair
    - amount_total                       : canonical amount alias
"""

from typing import Any, Dict, List

# ---------------------------------------------------------------------------
# PRIMARY / LOCKED SCHEMAS  (exactly 8 domain types + OTHER)
# ---------------------------------------------------------------------------

SCHEMAS: Dict[str, Dict[str, Any]] = {
    # ------------------------------------------------------------------
    # INVOICE
    # ------------------------------------------------------------------
    "INVOICE": {
        "vendor_name": "verbatim-string",
        "vendor_tax_id": "verbatim-string",
        "invoice_number": "verbatim-string",
        "purchase_order_number": "verbatim-string",
        "po_number": "verbatim-string",  # alias for PO-chain linking
        "invoice_date": "date-time",
        "due_date": "date-time",
        "amount_subtotal": "number",
        "tax_amount": "number",
        "amount_total": "number",
        "currency": ["INR", "USD", "EUR", "GBP"],
        "payment_terms": "string",
        "bank_account": "verbatim-string",
        "line_items": [
            {
                "description": "verbatim-string",
                "quantity": "number",
                "unit_price": "number",
                "line_total": "number",
            }
        ],
        "people_mentioned": ["verbatim-string"],
        "organizations_mentioned": ["verbatim-string"],
    },
    # ------------------------------------------------------------------
    # PURCHASE ORDER
    # ------------------------------------------------------------------
    "PURCHASE_ORDER": {
        "vendor_name": "verbatim-string",
        "po_number": "verbatim-string",
        "purchase_order_number": "verbatim-string",  # alias
        "issue_date": "date-time",
        "delivery_deadline": "date-time",
        "amount_total": "number",
        "currency": ["INR", "USD", "EUR", "GBP"],
        "approved_by": "verbatim-string",
        "line_items": [
            {
                "description": "verbatim-string",
                "quantity": "number",
                "unit_price": "number",
            }
        ],
        "people_mentioned": ["verbatim-string"],
        "organizations_mentioned": ["verbatim-string"],
    },
    # ------------------------------------------------------------------
    # CONTRACT
    # ------------------------------------------------------------------
    "CONTRACT": {
        "party_a": "verbatim-string",
        "party_b": "verbatim-string",
        "contract_number": "verbatim-string",
        "effective_date": "date-time",
        "expiry_date": "date-time",
        "delivery_deadline": "date-time",
        "contract_value": "number",
        "amount_total": "number",  # alias for comparison
        "payment_terms": "string",
        "penalty_clause": "string",
        "jurisdiction": "verbatim-string",
        "liability_cap": "number",
        "termination_notice": "string",
        "purchase_order_number": "verbatim-string",
        "po_number": "verbatim-string",  # alias for PO-chain linking
        "people_mentioned": ["verbatim-string"],
        "organizations_mentioned": ["verbatim-string"],
    },
    # ------------------------------------------------------------------
    # GOODS RECEIPT NOTE
    # ------------------------------------------------------------------
    "GOODS_RECEIPT_NOTE": {
        "grn_number": "verbatim-string",
        "po_number": "verbatim-string",
        "purchase_order_number": "verbatim-string",  # alias
        "vendor_name": "verbatim-string",
        "receipt_date": "date-time",
        "delivery_date": "date-time",
        "items_received": [
            {
                "description": "verbatim-string",
                "quantity_ordered": "number",
                "quantity_received": "number",
            }
        ],
        "received_by": "verbatim-string",
        "condition_notes": "string",
        "people_mentioned": ["verbatim-string"],
        "organizations_mentioned": ["verbatim-string"],
    },
    # ------------------------------------------------------------------
    # APPROVAL NOTE
    # ------------------------------------------------------------------
    "APPROVAL_NOTE": {
        "reference_number": "verbatim-string",
        "purchase_order_number": "verbatim-string",
        "po_number": "verbatim-string",  # alias for PO-chain linking
        "approved_by": "verbatim-string",
        "approval_date": "date-time",
        "amount_approved": "number",
        "amount_total": "number",  # alias
        "currency": ["INR", "USD", "EUR", "GBP"],
        "purpose": "string",
        "conditions": "string",
        "people_mentioned": ["verbatim-string"],
        "organizations_mentioned": ["verbatim-string"],
    },
    # ------------------------------------------------------------------
    # PAYMENT CONFIRMATION
    # ------------------------------------------------------------------
    "PAYMENT_CONFIRMATION": {
        "payment_reference": "verbatim-string",
        "transaction_id": "verbatim-string",
        "purchase_order_number": "verbatim-string",
        "po_number": "verbatim-string",  # alias for PO-chain linking
        "invoice_number": "verbatim-string",
        "payment_date": "date-time",
        "amount_paid": "number",
        "amount_total": "number",  # alias
        "currency": ["INR", "USD", "EUR", "GBP"],
        "paid_to": "verbatim-string",
        "beneficiary_name": "verbatim-string",
        "bank_account": "verbatim-string",
        "payment_method": "string",
        "people_mentioned": ["verbatim-string"],
        "organizations_mentioned": ["verbatim-string"],
    },
    # ------------------------------------------------------------------
    # BANK STATEMENT
    # ------------------------------------------------------------------
    "BANK_STATEMENT": {
        "account_holder": "verbatim-string",
        "account_number": "verbatim-string",
        "bank_name": "verbatim-string",
        "statement_period": "verbatim-string",
        "opening_balance": "number",
        "closing_balance": "number",
        "transactions": [
            {
                "date": "date-time",
                "description": "verbatim-string",
                "debit": "number",
                "credit": "number",
                "balance": "number",
            }
        ],
        "people_mentioned": ["verbatim-string"],
        "organizations_mentioned": ["verbatim-string"],
    },
    # ------------------------------------------------------------------
    # OTHER  (catch-all / fallback)
    # All optional fields are intentionally broad so the model can
    # surface whatever structured data exists in an unknown document.
    # ------------------------------------------------------------------
    "OTHER": {
        "title": "verbatim-string",
        "report_period": "verbatim-string",
        "project_name": "verbatim-string",
        "author": "verbatim-string",
        "dates_mentioned": ["verbatim-string"],
        "summary": "string",
        "amount_total": "number",
        "purchase_order_number": "verbatim-string",
        "people_mentioned": ["verbatim-string"],
        "organizations_mentioned": ["verbatim-string"],
    },
}


# ---------------------------------------------------------------------------
# EXTENDED / NON-LOCKED SCHEMAS
# These are NOT public document types recognised by the classifier.
# They are available for ad-hoc extraction or future promotion to SCHEMAS.
# ---------------------------------------------------------------------------

EXTENDED_SCHEMAS: Dict[str, Dict[str, Any]] = {
    # ------------------------------------------------------------------
    # QUARTERLY REPORT  — intentionally NOT a locked public type
    # ------------------------------------------------------------------
    "QUARTERLY_REPORT": {
        "report_title": "verbatim-string",
        "report_period": "verbatim-string",
        "quarter": "verbatim-string",
        "year": "verbatim-string",
        "prepared_by": "verbatim-string",
        "preparation_date": "date-time",
        "project_name": "verbatim-string",
        "project_lead": "verbatim-string",
        "total_expenditure": "number",
        "amount_total": "number",  # alias
        "key_personnel": ["verbatim-string"],
        "milestones": ["string"],
        "summary": "string",
        "people_mentioned": ["verbatim-string"],
        "organizations_mentioned": ["verbatim-string"],
    },
    # ------------------------------------------------------------------
    # EMAIL
    # ------------------------------------------------------------------
    "EMAIL": {
        "sender": "verbatim-string",
        "recipients": ["verbatim-string"],
        "date_sent": "date-time",
        "subject": "verbatim-string",
        "body_summary": "string",
        "attachments_mentioned": ["verbatim-string"],
        "action_items": ["string"],
        "purchase_order_number": "verbatim-string",
        "po_number": "verbatim-string",  # alias for PO-chain linking
        "people_mentioned": ["verbatim-string"],
        "organizations_mentioned": ["verbatim-string"],
    },
    # ------------------------------------------------------------------
    # INTERNAL MEMO
    # ------------------------------------------------------------------
    "INTERNAL_MEMO": {
        "from": "verbatim-string",
        "to": "verbatim-string",
        "date": "date-time",
        "subject": "verbatim-string",
        "key_points": ["string"],
        "action_required": "string",
        "purchase_order_number": "verbatim-string",
        "po_number": "verbatim-string",  # alias for PO-chain linking
        "people_mentioned": ["verbatim-string"],
        "organizations_mentioned": ["verbatim-string"],
    },
    # ------------------------------------------------------------------
    # LEGAL NOTICE
    # ------------------------------------------------------------------
    "LEGAL_NOTICE": {
        "issuing_party": "verbatim-string",
        "receiving_party": "verbatim-string",
        "notice_date": "date-time",
        "subject": "verbatim-string",
        "claim_amount": "number",
        "amount_total": "number",  # alias
        "deadline": "date-time",
        "jurisdiction": "verbatim-string",
        "people_mentioned": ["verbatim-string"],
        "organizations_mentioned": ["verbatim-string"],
    },
    # ------------------------------------------------------------------
    # PURCHASE REQUISITION
    # ------------------------------------------------------------------
    "PURCHASE_REQUISITION": {
        "requisition_number": "verbatim-string",
        "requested_by": "verbatim-string",
        "request_date": "date-time",
        "department": "verbatim-string",
        "items_requested": [
            {
                "description": "verbatim-string",
                "quantity": "number",
                "estimated_cost": "number",
            }
        ],
        "total_estimated_cost": "number",
        "amount_total": "number",  # alias
        "justification": "string",
        "purchase_order_number": "verbatim-string",
        "po_number": "verbatim-string",  # alias for PO-chain linking
        "people_mentioned": ["verbatim-string"],
        "organizations_mentioned": ["verbatim-string"],
    },
}


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------


def get_schema(doc_type: str) -> Dict[str, Any]:
    """Return the extraction schema for *doc_type*.

    Lookup order:
      1. SCHEMAS (locked public types)
      2. EXTENDED_SCHEMAS (non-locked extended types)
      3. SCHEMAS["OTHER"] as the universal fallback

    Args:
        doc_type: Document-type string, e.g. ``"INVOICE"`` or ``"EMAIL"``.

    Returns:
        The matching schema dict, or ``SCHEMAS["OTHER"]`` if not found in
        either dictionary.
    """
    return SCHEMAS.get(doc_type) or EXTENDED_SCHEMAS.get(doc_type) or SCHEMAS["OTHER"]


def get_all_doc_types() -> List[str]:
    """Return the list of all *locked* public document types (from SCHEMAS)."""
    return list(SCHEMAS.keys())
