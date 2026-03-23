"""
DocNerve — Step 3: Structured Field Extractor (NuExtract 2.0 2B)
Extracts typed fields from each document according to its doc_type schema.

NuExtract 2.0 2B is Qwen2-VL based and uses ChatML format via
create_chat_completion (NOT the legacy <|input|>...<|output|> prompt format).

Falls back to regex extraction when LLM is unavailable or raises.
"""

import json
import logging
import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from models.router import router
from schemas.document_schemas import SCHEMAS

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Amount field names that receive a _norm float counterpart
# ---------------------------------------------------------------------------
_AMOUNT_FIELDS: List[str] = [
    "amount_total",
    "amount_subtotal",
    "tax_amount",
    "contract_value",
    "liability_cap",
    "amount_paid",
    "amount_approved",
    "total_estimated_cost",
    "opening_balance",
    "closing_balance",
]

# ---------------------------------------------------------------------------
# Date field names that receive a _norm "YYYY-MM-DD" string counterpart
# ---------------------------------------------------------------------------
_DATE_FIELDS: List[str] = [
    "invoice_date",
    "issue_date",
    "due_date",
    "effective_date",
    "expiry_date",
    "delivery_deadline",
    "receipt_date",
    "payment_date",
    "approval_date",
    "date",
]

# ---------------------------------------------------------------------------
# ID / reference field names that receive a _norm stripped-uppercase counterpart
# ---------------------------------------------------------------------------
_ID_FIELDS: List[str] = [
    "po_number",
    "purchase_order_number",
    "invoice_number",
    "contract_number",
    "grn_number",
    "transaction_id",
    "payment_reference",
]

# ---------------------------------------------------------------------------
# Legal-entity suffixes to strip from vendor names during normalisation
# ---------------------------------------------------------------------------
_LEGAL_SUFFIXES_RE = re.compile(
    r"\b(pvt|private|ltd|limited|inc|corp|llp|llc)\.?\b",
    re.IGNORECASE,
)

# ---------------------------------------------------------------------------
# Date formats tried in order by parse_date()
# ---------------------------------------------------------------------------
_DATE_FORMATS: List[str] = [
    "%d/%m/%Y",
    "%d-%m-%Y",
    "%Y-%m-%d",
    "%d %B %Y",
    "%B %d, %Y",
    "%d %b %Y",
    "%d/%m/%y",
    "%d.%m.%Y",
]


# ===========================================================================
# PUBLIC ENTRY POINT
# ===========================================================================


def extract_fields(documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extract structured fields from all documents using NuExtract 2.0 2B.
    Falls back to regex extraction when the LLM is unavailable or raises.

    Loads the model once for the entire batch, then evicts it to free VRAM.

    Args:
        documents: List of doc dicts; each must contain 'full_text' and
                   'doc_type'.

    Returns:
        Same list with 'structured_fields' added to every document (always
        present, never absent).
    """
    llm = router.load("nuextract")
    llm_available = llm is not None

    for doc in documents:
        text = doc.get("full_text", "")

        # QUARTERLY_REPORT is not a locked public type in SCHEMAS; treat as OTHER
        doc_type = doc.get("doc_type", "OTHER")
        if doc_type == "QUARTERLY_REPORT":
            doc_type = "OTHER"

        if not text:
            doc["structured_fields"] = {}
            continue

        schema = SCHEMAS.get(doc_type, SCHEMAS["OTHER"])

        raw_fields: Dict[str, Any] = {}
        if llm_available:
            try:
                raw_fields = _extract_with_llm(llm, schema, text)
            except Exception as e:
                logger.warning(
                    "[Extractor] LLM failed for %s: %s",
                    doc.get("filename"),
                    e,
                )

        if not raw_fields:
            raw_fields = _extract_with_regex(text, doc_type)

        doc["structured_fields"] = normalize_fields(raw_fields)

    if llm_available:
        router.evict()

    return documents


# ===========================================================================
# LLM EXTRACTION  (NuExtract 2.0 2B — ChatML via create_chat_completion)
# ===========================================================================


def _extract_with_llm(
    llm: Any,
    schema: Dict[str, Any],
    text: str,
) -> Dict[str, Any]:
    """
    Call NuExtract 2.0 2B using the ChatML format required by the Qwen2-VL
    based model.  Uses llm.create_chat_completion(), NOT the raw llm() call.

    Args:
        llm:    Loaded llama-cpp-python LLM handle.
        schema: Extraction schema dict for this document type.
        text:   Full document text.

    Returns:
        Extracted fields dict, or {} on any failure.
    """
    simple_schema = _simplify_schema(schema)
    schema_str = json.dumps(simple_schema, indent=2, ensure_ascii=False)
    text_snippet = text[:3000]

    response = llm.create_chat_completion(
        messages=[
            {
                "role": "user",
                "content": (f"# Template:\n{schema_str}\n\n# Context:\n{text_snippet}"),
            }
        ],
        max_tokens=1024,
        temperature=0.0,
        stop=["<|im_end|>", "<|end|>"],
    )
    raw = response["choices"][0]["message"]["content"].strip()
    return _parse_json_robust(raw, schema)


def _simplify_schema(schema: Dict[str, Any]) -> Dict[str, Any]:
    """
    Flatten the schema so list-of-dict fields carry only one example row.
    NuExtract performs better with simpler, shorter prompts.
    """
    simple: Dict[str, Any] = {}
    for key, value in schema.items():
        if isinstance(value, list):
            simple[key] = [value[0]] if (value and isinstance(value[0], dict)) else []
        elif isinstance(value, dict):
            simple[key] = _simplify_schema(value)
        else:
            simple[key] = value
    return simple


def _parse_json_robust(output: str, schema: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse JSON from LLM output with multiple fallback strategies.
    Never raises; returns {} when nothing parseable is found.
    """
    # Strategy 1: direct parse
    try:
        result = json.loads(output)
        if isinstance(result, dict):
            return result
    except json.JSONDecodeError:
        pass

    # Strategy 2: extract from markdown fences or bare braces
    fence_patterns = [
        r"```json\s*([\s\S]*?)\s*```",
        r"```\s*([\s\S]*?)\s*```",
        r"\{[\s\S]*\}",
    ]
    for pattern in fence_patterns:
        for match in re.findall(pattern, output, re.DOTALL):
            candidate = match if isinstance(match, str) else match[0]
            try:
                result = json.loads(candidate.strip())
                if isinstance(result, dict):
                    return result
            except (json.JSONDecodeError, IndexError):
                continue

    # Strategy 3: empty schema skeleton so downstream code always gets a dict
    return {k: "" for k in schema if not isinstance(schema[k], (list, dict))}


# ===========================================================================
# NORMALISATION
# ===========================================================================


def normalize_fields(sf: Dict[str, Any]) -> Dict[str, Any]:
    """
    Produce normalised *_norm counterparts for every known typed field in *sf*.

    Modifies *sf* in-place and returns it so callers can use either style.

    Normalisations applied
    ----------------------
    Amount fields  → float via parse_amount_float(); stored as <field>_norm
    Date fields    → "YYYY-MM-DD" string via parse_date(); stored as <field>_norm
    ID fields      → strip non-alphanumeric chars, uppercase; stored as <field>_norm
    vendor_name    → lowercase, strip legal suffixes, strip punctuation;
                     stored as vendor_name_norm

    Cross-aliases (filled in if the primary key is absent)
    -------------------------------------------------------
    amount_total_norm  ← contract_value_norm   (if amount_total_norm missing)
    po_number_norm     ← purchase_order_number_norm  (if po_number_norm missing)
    """
    # --- Amount fields ---
    for field in _AMOUNT_FIELDS:
        raw = sf.get(field)
        if raw is not None and raw != "":
            parsed = parse_amount_float(str(raw))
            if parsed is not None:
                sf[f"{field}_norm"] = parsed

    # --- Date fields ---
    for field in _DATE_FIELDS:
        raw = sf.get(field)
        if raw is not None and raw != "":
            dt = parse_date(str(raw))
            if dt is not None:
                sf[f"{field}_norm"] = dt.strftime("%Y-%m-%d")

    # --- ID / reference fields ---
    for field in _ID_FIELDS:
        raw = sf.get(field)
        if raw is not None and raw != "":
            norm = re.sub(r"[^A-Za-z0-9]", "", str(raw)).upper()
            if norm:
                sf[f"{field}_norm"] = norm

    # --- Vendor name ---
    vendor_raw = sf.get("vendor_name")
    if vendor_raw and str(vendor_raw).strip():
        v = str(vendor_raw).lower()
        v = _LEGAL_SUFFIXES_RE.sub("", v)  # drop legal-entity suffixes
        v = re.sub(r"[^\w\s]", "", v)  # strip punctuation
        v = re.sub(r"\s+", " ", v).strip()
        if v:
            sf["vendor_name_norm"] = v

    # --- Cross-aliases ---
    if "amount_total_norm" not in sf and "contract_value_norm" in sf:
        sf["amount_total_norm"] = sf["contract_value_norm"]
    if "po_number_norm" not in sf and "purchase_order_number_norm" in sf:
        sf["po_number_norm"] = sf["purchase_order_number_norm"]

    return sf


# ---------------------------------------------------------------------------
# Amount parser
# ---------------------------------------------------------------------------


def parse_amount_float(s: str) -> Optional[float]:
    """
    Parse a wide variety of amount strings to a Python float.

    Handles
    -------
    ₹4,85,000 / Rs.485000 / INR 4,85,000
    4.85L / 4.85 lakhs / 4.85 lacs
    4.85 crore / 4.85 crores
    $1,200 / 1,200.50
    (1,200.00)  →  negative  (parenthesised negatives)

    Returns None when no valid number can be extracted.
    """
    if not s:
        return None
    s = s.strip()
    negative = False

    # Parenthesised negative — e.g. (1,200)
    paren_m = re.match(
        r"^\(\s*([\d,\.₹$\s]*(?:lakhs?|lacs?|crores?|l\b)?[^)]*)\s*\)$",
        s,
        re.IGNORECASE,
    )
    if paren_m:
        s = paren_m.group(1).strip()
        negative = True

    # Strip currency symbols and labels
    s = re.sub(r"[₹$]", "", s)
    s = re.sub(r"\brs\.?\b|\binr\b", "", s, flags=re.IGNORECASE).strip()

    # Lakh / lac / L multiplier — e.g. 4.85L / 4.85 lakhs
    lakh_m = re.match(r"([\d,]+(?:\.\d+)?)\s*(?:l\b|lakhs?|lacs?)", s, re.IGNORECASE)
    if lakh_m:
        try:
            val = float(lakh_m.group(1).replace(",", "")) * 100_000
            return -val if negative else val
        except ValueError:
            return None

    # Crore multiplier — e.g. 4.85 crore
    crore_m = re.match(r"([\d,]+(?:\.\d+)?)\s*crores?", s, re.IGNORECASE)
    if crore_m:
        try:
            val = float(crore_m.group(1).replace(",", "")) * 10_000_000
            return -val if negative else val
        except ValueError:
            return None

    # Plain number (possibly with Indian/Western comma separators)
    plain = re.sub(r",", "", s).strip()
    plain = re.sub(r"[^\d.\-]", "", plain)
    if not plain:
        return None
    try:
        val = float(plain)
        return -val if negative else val
    except ValueError:
        return None


# ---------------------------------------------------------------------------
# Date parser
# ---------------------------------------------------------------------------


def parse_date(s: str) -> Optional[datetime]:
    """
    Try to parse *s* into a datetime using the formats listed in _DATE_FORMATS.

    Returns a datetime on success, None on failure.
    """
    if not s:
        return None
    s = s.strip()
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


# ===========================================================================
# REGEX FALLBACK
# ===========================================================================


def _try_field(
    fields: Dict[str, Any],
    key: str,
    patterns: List[str],
    text: str,
) -> None:
    """
    Try each regex pattern (with re.IGNORECASE) in order.
    Store the first non-empty group(1) match under *key* in *fields*.
    No-ops silently if *key* is already set to a truthy value.
    """
    if fields.get(key):
        return
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            value = m.group(1).strip()
            if value:
                fields[key] = value
                return


def _extract_with_regex(text: str, doc_type: str) -> Dict[str, Any]:
    """
    Regex-based field extraction used as a fallback when the LLM is
    unavailable or returns an empty result.

    Covers the most critical fields for contradiction/ghost detection:
    amounts, document IDs, dates, and entity names.

    Args:
        text:     Full document text.
        doc_type: Normalised document-type string (QUARTERLY_REPORT already
                  remapped to OTHER before this function is called).

    Returns:
        Dict of extracted field values.  Never raises.
    """
    fields: Dict[str, Any] = {}

    # -----------------------------------------------------------------------
    # AMOUNTS
    # -----------------------------------------------------------------------
    _try_field(
        fields,
        "amount_total",
        [
            r"(?:grand\s*total|total\s*amount|amount\s*due|net\s*payable)[\s:₹$Rs\.]*([0-9][0-9,\.]+)",
            r"[₹]\s*([0-9][0-9,\.]+)",
            r"(?:rs\.?|inr)[\s.]*([0-9][0-9,\.]+)",
            r"(?:total|amount)[\s:]+(?:due|payable)?[\s:]*([0-9][0-9,\.]+)",
            r"\$\s*([0-9][0-9,\.]+)",
            r"([0-9][0-9,\.]+)\s*(?:lakhs?|lacs?|crores?)",
        ],
        text,
    )

    _try_field(
        fields,
        "amount_subtotal",
        [r"(?:sub\s*total|subtotal)[\s:₹$Rs\.]*([0-9][0-9,\.]+)"],
        text,
    )

    _try_field(
        fields,
        "tax_amount",
        [r"(?:tax\s*amount|gst|vat|cgst|sgst|igst)[\s:₹$Rs\.]*([0-9][0-9,\.]+)"],
        text,
    )

    # -----------------------------------------------------------------------
    # INVOICE NUMBER
    # Fixed: require "no / number / #" keyword before the value so that
    # "TAX INVOICE\n\nVendor" can never be matched as an invoice number.
    # -----------------------------------------------------------------------
    _try_field(
        fields,
        "invoice_number",
        [
            # Require colon: "Invoice Number: INV-089"
            r"invoice\s+(?:no\.?|number|#)\s*:\s*([A-Z0-9][\w\-/]{2,})",
            # Allow space only (no colon): "Invoice No INV-089"
            r"invoice\s+(?:no\.?|number|#)\s+([A-Z0-9][\w\-/]{2,})",
            # Short INV- / INV# / INV. prefix with a mandatory delimiter
            r"inv[.\-#\s]+([A-Z0-9][\w\-]{2,})",
        ],
        text,
    )

    # -----------------------------------------------------------------------
    # PO / PURCHASE ORDER NUMBER
    # -----------------------------------------------------------------------
    _try_field(
        fields,
        "po_number",
        [
            r"(?:purchase\s*order|p\.?o\.?)\s*(?:no\.?|number|#)?\s*:?\s*([A-Z0-9][\w\-/]+)",
            r"\bpo[\s#:\-]+([A-Z0-9][\w\-/]+)",
        ],
        text,
    )
    # Keep the alias in sync
    if fields.get("po_number") and not fields.get("purchase_order_number"):
        fields["purchase_order_number"] = fields["po_number"]

    # -----------------------------------------------------------------------
    # GRN NUMBER
    # -----------------------------------------------------------------------
    _try_field(
        fields,
        "grn_number",
        [
            r"(?:grn|goods\s*receipt\s*(?:note)?)\s*(?:no\.?|number|#)?\s*:?\s*([A-Z0-9][\w\-/]+)",
        ],
        text,
    )

    # -----------------------------------------------------------------------
    # CONTRACT NUMBER
    # -----------------------------------------------------------------------
    _try_field(
        fields,
        "contract_number",
        [r"(?:contract|agreement)\s*(?:no\.?|number|#)?\s*:?\s*([A-Z0-9][\w\-/]+)"],
        text,
    )

    # -----------------------------------------------------------------------
    # PAYMENT REFERENCE / TRANSACTION ID
    # -----------------------------------------------------------------------
    _try_field(
        fields,
        "payment_reference",
        [r"(?:payment\s*ref(?:erence)?|ref\.?\s*no\.?)\s*:?\s*([A-Z0-9][\w\-/]+)"],
        text,
    )
    _try_field(
        fields,
        "transaction_id",
        [r"(?:transaction\s*id|txn\s*id|txn\.?\s*no\.?)\s*:?\s*([A-Z0-9][\w\-/]+)"],
        text,
    )

    # -----------------------------------------------------------------------
    # DATES  (generic fallback first, then doc-type-specific labelled dates)
    # -----------------------------------------------------------------------
    _date_re = (
        r"(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}"
        r"|\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4}"
        r"|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})"
    )

    _try_field(fields, "date", [_date_re], text)

    if doc_type == "INVOICE":
        _try_field(
            fields,
            "invoice_date",
            [r"invoice\s*date[\s:]*" + _date_re],
            text,
        )
        _try_field(
            fields,
            "due_date",
            [r"(?:due|payment)\s*date[\s:]*" + _date_re],
            text,
        )

    elif doc_type == "PURCHASE_ORDER":
        _try_field(
            fields,
            "issue_date",
            [r"(?:issue|order)\s*date[\s:]*" + _date_re],
            text,
        )
        _try_field(
            fields,
            "delivery_deadline",
            [r"(?:delivery|required\s*by|deadline)\s*(?:date)?[\s:]*" + _date_re],
            text,
        )

    elif doc_type == "CONTRACT":
        _try_field(
            fields,
            "effective_date",
            [r"(?:effective|start|commencement)\s*date[\s:]*" + _date_re],
            text,
        )
        _try_field(
            fields,
            "expiry_date",
            [r"(?:expiry|expiration|end)\s*date[\s:]*" + _date_re],
            text,
        )
        _try_field(
            fields,
            "delivery_deadline",
            [r"(?:delivery|deadline)\s*(?:date)?[\s:]*" + _date_re],
            text,
        )

    elif doc_type == "GOODS_RECEIPT_NOTE":
        _try_field(
            fields,
            "receipt_date",
            [r"(?:receipt|received|delivery)\s*date[\s:]*" + _date_re],
            text,
        )

    elif doc_type == "PAYMENT_CONFIRMATION":
        _try_field(
            fields,
            "payment_date",
            [r"(?:payment|paid|transaction)\s*date[\s:]*" + _date_re],
            text,
        )

    elif doc_type == "APPROVAL_NOTE":
        _try_field(
            fields,
            "approval_date",
            [r"approval\s*date[\s:]*" + _date_re],
            text,
        )

    # -----------------------------------------------------------------------
    # VENDOR NAME
    # -----------------------------------------------------------------------
    _try_field(
        fields,
        "vendor_name",
        [
            r"(?:vendor|supplier|bill\s*from|seller)\s*[:\-]\s*([A-Z][A-Za-z0-9\s&\.\-]+?)(?:\n|,|gstin|gst\b|address)",
            r"(?:m/s\.?|messrs\.?)\s+([A-Z][A-Za-z0-9\s&\.\-]+?)(?:\n|,)",
        ],
        text,
    )

    # -----------------------------------------------------------------------
    # PEOPLE MENTIONED
    # -----------------------------------------------------------------------
    people: List[str] = []
    for pat in [
        r"(?:approved\s*by|authorized\s*by|prepared\s*by|project\s*lead|manager)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
        r"(?:mr\.?|ms\.?|mrs\.?|dr\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
    ]:
        for m in re.finditer(pat, text):
            name = m.group(1).strip()
            if len(name) > 3 and name not in people:
                people.append(name)
    if people:
        fields["people_mentioned"] = people[:10]

    _try_field(
        fields,
        "approved_by",
        [r"approved\s*by[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)"],
        text,
    )
    _try_field(
        fields,
        "received_by",
        [r"received\s*by[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)"],
        text,
    )

    # -----------------------------------------------------------------------
    # ORGANISATIONS MENTIONED
    # -----------------------------------------------------------------------
    orgs: List[str] = []
    for m in re.finditer(
        r"([A-Z][A-Za-z\s&]+\s*(?:ltd\.?|limited|pvt\.?|private|inc\.?|llp|llc|corp\.?))",
        text,
        re.IGNORECASE,
    ):
        org = m.group(1).strip()
        if 5 < len(org) < 100 and org not in orgs:
            orgs.append(org)
    if orgs:
        fields["organizations_mentioned"] = orgs[:10]

    # -----------------------------------------------------------------------
    # CONTRACT-SPECIFIC FIELDS
    # -----------------------------------------------------------------------
    if doc_type == "CONTRACT":
        _try_field(
            fields,
            "payment_terms",
            [r"payment\s*terms?\s*[:\-]\s*([^\.\n]{5,200})"],
            text,
        )
        _try_field(
            fields,
            "jurisdiction",
            [r"jurisdiction\s*[:\-]\s*([A-Za-z\s]+?)(?:\.|,|courts?)"],
            text,
        )
        _try_field(
            fields,
            "penalty_clause",
            [r"penalty\s*(?:clause)?\s*[:\-]\s*([^\.\n]{5,300})"],
            text,
        )
        _try_field(
            fields,
            "contract_value",
            [r"contract\s*value\s*[:\-₹$Rs\.]*\s*([0-9][0-9,\.]+)"],
            text,
        )

    # -----------------------------------------------------------------------
    # BANK STATEMENT-SPECIFIC FIELDS
    # -----------------------------------------------------------------------
    elif doc_type == "BANK_STATEMENT":
        _try_field(
            fields,
            "opening_balance",
            [r"opening\s*balance[\s:₹$Rs\.]*([0-9][0-9,\.]+)"],
            text,
        )
        _try_field(
            fields,
            "closing_balance",
            [r"closing\s*balance[\s:₹$Rs\.]*([0-9][0-9,\.]+)"],
            text,
        )
        _try_field(
            fields,
            "account_holder",
            [
                r"(?:account\s*holder|account\s*name)\s*[:\-]\s*([A-Z][A-Za-z\s\.]+?)(?:\n|,)"
            ],
            text,
        )
        _try_field(
            fields,
            "account_number",
            [r"(?:account\s*(?:no\.?|number))\s*[:\-]\s*([A-Z0-9][\w\-]+)"],
            text,
        )

    # -----------------------------------------------------------------------
    # APPROVAL NOTE-SPECIFIC FIELDS
    # -----------------------------------------------------------------------
    elif doc_type == "APPROVAL_NOTE":
        _try_field(
            fields,
            "amount_approved",
            [r"(?:amount\s*approved|approved\s*amount)[\s:₹$Rs\.]*([0-9][0-9,\.]+)"],
            text,
        )
        _try_field(
            fields,
            "purpose",
            [r"purpose\s*[:\-]\s*([^\.\n]{5,200})"],
            text,
        )

    # -----------------------------------------------------------------------
    # PAYMENT CONFIRMATION-SPECIFIC FIELDS
    # -----------------------------------------------------------------------
    elif doc_type == "PAYMENT_CONFIRMATION":
        _try_field(
            fields,
            "amount_paid",
            [r"(?:amount\s*paid|paid\s*amount)[\s:₹$Rs\.]*([0-9][0-9,\.]+)"],
            text,
        )
        _try_field(
            fields,
            "paid_to",
            [r"paid\s*to\s*[:\-]\s*([A-Z][A-Za-z0-9\s&\.\-]+?)(?:\n|,)"],
            text,
        )

    # -----------------------------------------------------------------------
    # OTHER — catches QUARTERLY_REPORT remapped above, plus any generic doc
    # -----------------------------------------------------------------------
    elif doc_type == "OTHER":
        pm = re.search(
            r"(?:q[1-4]|quarter\s*[1-4])[^\w]*(20\d{2})?",
            text,
            re.IGNORECASE,
        )
        if pm:
            fields["report_period"] = pm.group(0).strip()

        pjm = re.search(
            r"project[\s:]+([A-Za-z\s]+?)(?:\n|,|report)",
            text,
            re.IGNORECASE,
        )
        if pjm:
            fields["project_name"] = pjm.group(1).strip()

    return fields
