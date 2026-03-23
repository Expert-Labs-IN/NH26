"""
DocNerve — Step 2: Document Type Classifier
Primary:  Phi-4-mini on GPU via the model router (O2 spec).
Fallback: Rule-based keyword matching (CPU-only, used when LLM is unavailable).
"""

import json
import logging
import re
from typing import Any, Dict, List, Tuple

from models.router import router

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Locked output vocabulary — ONLY these 8 types may ever be returned
# ---------------------------------------------------------------------------
LOCKED_TYPES = frozenset(
    {
        "INVOICE",
        "PURCHASE_ORDER",
        "CONTRACT",
        "GOODS_RECEIPT_NOTE",
        "APPROVAL_NOTE",
        "PAYMENT_CONFIRMATION",
        "BANK_STATEMENT",
        "OTHER",
    }
)

# ---------------------------------------------------------------------------
# Rule-based keyword sets (case-insensitive substring matching)
# Used ONLY as fallback — types are limited to the 8 locked types above
# ---------------------------------------------------------------------------
RULE_KEYWORDS: Dict[str, List[str]] = {
    "INVOICE": [
        "tax invoice",
        "bill to",
        "amount due",
        "invoice number",
        "invoice date",
        "payment due",
        "gstin",
        "total amount due",
        "invoice no",
        "inv no",
        "inv #",
    ],
    "PURCHASE_ORDER": [
        "purchase order",
        "p.o. number",
        "po number",
        "order to supply",
        "ordered by",
        "delivery to",
        "po no",
        "purchase order number",
    ],
    "CONTRACT": [
        "this agreement",
        "terms and conditions",
        "jurisdiction",
        "this contract",
        "party of the first part",
        "whereas",
        "hereinafter",
        "contract number",
        "effective date",
        "expiry date",
        "termination",
    ],
    "GOODS_RECEIPT_NOTE": [
        "goods receipt",
        "grn",
        "received in good condition",
        "delivery note",
        "receipt note",
        "goods received",
        "delivery challan",
        "items received",
    ],
    "APPROVAL_NOTE": [
        "approval note",
        "sanction letter",
        "authorization",
        "approved amount",
        "this is to approve",
        "authorized by",
        "approval granted",
        "approval sheet",
    ],
    "PAYMENT_CONFIRMATION": [
        "payment confirmed",
        "amount paid",
        "transaction id",
        "utr number",
        "payment reference",
        "neft transfer",
        "payment confirmation",
        "payment receipt",
        "remittance",
        "amount credited",
        "paid successfully",
    ],
    "BANK_STATEMENT": [
        "account statement",
        "closing balance",
        "opening balance",
        "bank statement",
        "transaction history",
        "statement period",
        "account number",
        "debit",
    ],
}

# Keywords that strongly indicate a report/narrative document → OTHER
# If ANY of these appear in the text, bias heavily toward OTHER
_OTHER_SIGNALS: List[str] = [
    "quarterly report",
    "annual report",
    "progress report",
    "project report",
    "executive summary",
    "report period",
    "q1 20",
    "q2 20",
    "q3 20",
    "q4 20",
    "quarter 1",
    "quarter 2",
    "quarter 3",
    "quarter 4",
    "milestones",
    "key findings",
    "status update",
    "project lead",
    "prepared by",
]

# Minimum keyword hits required to assign a non-OTHER type in fallback mode.
# A single incidental word (e.g. "invoice" appearing in a contract's payment
# section) should not be enough to flip the classification.
_MIN_HITS_FOR_CLASSIFICATION = 2

# ---------------------------------------------------------------------------
# User prompt template (exact, per O2 spec)
# ---------------------------------------------------------------------------
_PROMPT_TEMPLATE = """\
Classify this document into exactly one category.

Categories: INVOICE, PURCHASE_ORDER, CONTRACT, GOODS_RECEIPT_NOTE, APPROVAL_NOTE, PAYMENT_CONFIRMATION, BANK_STATEMENT, OTHER

Rules:
- Quarterly/annual reports → OTHER
- Documents with no matching category → OTHER
- Return ONLY this JSON, nothing else: {{"doc_type": "CATEGORY", "confidence": 0.0}}

Document (first 600 chars):
{text}\
"""


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def classify_documents(documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Classify each document's type using Phi-4-mini via the model router.

    Loads the model once, classifies the entire batch, then evicts the model
    to free VRAM for downstream steps.  Falls back to rule-based classification
    per document if the LLM is unavailable or returns bad output.

    Args:
        documents: List of doc dicts that must contain a ``full_text`` field.

    Returns:
        Same list, each dict augmented with:
            - ``doc_type``                (str)   one of the 8 locked types
            - ``classification_confidence`` (float) 0.0 – 1.0
    """
    llm = _load_model()

    for doc in documents:
        text = doc.get("full_text", "")
        filename = doc.get("filename", "")

        doc_type, confidence = _classify_single(llm, text, filename)

        doc["doc_type"] = doc_type
        doc["classification_confidence"] = confidence

    _evict_model()

    return documents


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _load_model():
    """Load Phi-4-mini via the router; return the llm handle or None."""
    try:
        llm = router.load("phi4mini")
        return llm
    except Exception as exc:
        logger.warning(
            "classifier: failed to load phi4mini — will use rule-based fallback. reason: %s",
            exc,
        )
        return None


def _evict_model() -> None:
    """Evict the model from the router after the batch is done."""
    try:
        router.evict()
    except Exception as exc:
        logger.warning("classifier: router.evict() raised an error: %s", exc)


def _classify_single(llm, text: str, filename: str) -> Tuple[str, float]:
    """
    Classify one document.

    Tries LLM first; falls back to rules on any failure.
    Always returns a (doc_type, confidence) pair with doc_type in LOCKED_TYPES.
    """
    if llm is not None and text:
        try:
            return _classify_with_llm(llm, text)
        except Exception as exc:
            logger.warning(
                "classifier: LLM classification failed for '%s', falling back to rules. reason: %s",
                filename,
                exc,
            )

    return _classify_with_rules(text, filename)


def _classify_with_llm(llm, text: str) -> Tuple[str, float]:
    """
    Call Phi-4-mini via create_chat_completion and parse the JSON response.

    Raises on any unrecoverable error so the caller can fall back to rules.
    """
    user_prompt = _PROMPT_TEMPLATE.format(text=text[:600])

    response = llm.create_chat_completion(
        messages=[
            {
                "role": "system",
                "content": "You are a document classifier. Return only valid JSON, no explanation.",
            },
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=64,
        temperature=0.0,
        stop=["<|end|>", "<|im_end|>", "\n\n"],
    )
    raw = response["choices"][0]["message"]["content"].strip()

    doc_type, confidence = _parse_llm_output(raw)

    # Enforce locked vocabulary
    if doc_type not in LOCKED_TYPES:
        logger.warning(
            "classifier: LLM returned unknown type '%s', mapping to OTHER.", doc_type
        )
        doc_type = "OTHER"
        confidence = min(confidence, 0.4)

    return doc_type, confidence


def _parse_llm_output(raw: str) -> Tuple[str, float]:
    """
    Parse the LLM's raw text output with three fallback strategies.

    Strategy 1 — direct json.loads
    Strategy 2 — regex-extract the first {...} block and json.loads that
    Strategy 3 — scan raw_upper for the first known locked type name

    Returns (doc_type, confidence).  Raises ValueError if all strategies fail.
    """
    # --- Strategy 1: direct parse ---
    try:
        data = json.loads(raw)
        return _extract_fields(data)
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        pass

    # --- Strategy 2: regex extract {...} ---
    match = re.search(r"\{[^}]+\}", raw, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group())
            return _extract_fields(data)
        except (json.JSONDecodeError, KeyError, TypeError, ValueError):
            pass

    # --- Strategy 3: scan for known type names ---
    raw_upper = raw.upper()
    for locked_type in LOCKED_TYPES:
        if locked_type in raw_upper:
            logger.warning(
                "classifier: fell back to string-scan for type '%s' in raw='%s'",
                locked_type,
                raw[:120],
            )
            return locked_type, 0.5

    raise ValueError(f"classifier: could not parse LLM output: {raw!r}")


def _extract_fields(data: Dict[str, Any]) -> Tuple[str, float]:
    """
    Pull doc_type and confidence out of a parsed JSON dict.
    Raises ValueError if mandatory fields are missing or malformed.
    """
    doc_type = str(data["doc_type"]).strip().upper()
    confidence = float(data.get("confidence", 0.7))
    confidence = max(0.0, min(1.0, confidence))
    return doc_type, round(confidence, 4)


# ---------------------------------------------------------------------------
# Rule-based fallback (CPU-only, 8 locked types only)
# ---------------------------------------------------------------------------


def _classify_with_rules(text: str, filename: str) -> Tuple[str, float]:
    """
    Classify a document using plain keyword / substring matching.

    Only the 8 locked types can be returned.  Types such as QUARTERLY_REPORT,
    LEGAL_NOTICE, and EMAIL that existed in older versions are intentionally
    absent — they would map to OTHER.

    Guard rails:
    - If any _OTHER_SIGNALS are detected, return OTHER immediately.
    - Require at least _MIN_HITS_FOR_CLASSIFICATION keyword hits before
      assigning a non-OTHER type (prevents single-word false positives).
    """
    if not text:
        return "OTHER", 0.1

    text_lower = text.lower()
    filename_lower = filename.lower() if filename else ""
    combined = text_lower + " " + filename_lower

    # ── Strong OTHER signal check ──────────────────────────────────────────
    other_hits = sum(1 for sig in _OTHER_SIGNALS if sig in combined)
    if other_hits >= 2:
        # Clearly a report/narrative document
        return "OTHER", round(min(0.9, 0.5 + other_hits * 0.05), 4)

    # ── Score each locked type ─────────────────────────────────────────────
    scores: Dict[str, int] = {}
    for doc_type, keywords in RULE_KEYWORDS.items():
        hit_count = sum(1 for kw in keywords if kw in combined)
        if hit_count:
            scores[doc_type] = hit_count

    if not scores:
        return "OTHER", 0.3

    best_type = max(scores, key=lambda k: scores[k])
    best_hits = scores[best_type]

    # ── Minimum-hit guard ─────────────────────────────────────────────────
    if best_hits < _MIN_HITS_FOR_CLASSIFICATION:
        # Only 1 incidental keyword match — not reliable enough
        return "OTHER", 0.35

    total_keywords = len(RULE_KEYWORDS[best_type])

    # Confidence: 0.50 base + up to 0.40 from keyword coverage, capped at 0.92
    coverage = best_hits / total_keywords
    confidence = round(min(0.92, 0.50 + coverage * 0.40), 4)

    return best_type, confidence
