"""
DocNerve pipeline orchestrator.
Runs each pipeline stage with guarded fallbacks and non-blocking thread offloading.
"""

from __future__ import annotations

import asyncio
import copy
import logging
from pathlib import Path
from typing import Any, Callable, Optional

from config import EXPORTS_DIR, get_model_diagnostics
from pipeline.chain_detector import detect_missing_chains
from pipeline.classifier import classify_documents
from pipeline.contradiction import detect_contradictions
from pipeline.extractor import extract_fields
from pipeline.ghost_detector import detect_ghost_entities
from pipeline.graph_builder import build_doc_graph
from pipeline.parser import parse_document
from pipeline.preprocessor import preprocess
from pipeline.reasoner import generate_reasoning_report
from pipeline import trust_scorer as trust_scorer_module
from utils.report_generator import generate_pdf_report

logger = logging.getLogger(__name__)

ProgressCallback = Callable[[int, Optional[str]], None]

RISK_LEVEL_PRIORITY = {
    "CLEAN": 0,
    "SUSPICIOUS": 1,
    "HIGH_RISK": 2,
}


def _default_graph() -> dict[str, Any]:
    return {
        "po_groups": {},
        "vendor_groups": {},
        "invoice_groups": {},
        "entity_matrix": {},
        "date_sequence": [],
    }


def _default_document(doc_id: str, filename: str, mode: str, scan_quality_score: int) -> dict[str, Any]:
    return {
        "id": doc_id,
        "filename": filename,
        "mode": mode,
        "scan_quality_score": scan_quality_score,
        "full_text": "",
        "pages": [],
        "table_count": 0,
        "doc_type": "OTHER",
        "classification_confidence": 0.0,
        "structured_fields": {},
        "trust_score": 100,
        "risk_level": "CLEAN",
        "trust_signals": [],
    }


def _report_progress(progress_cb: ProgressCallback | None, pct: int, step: str) -> None:
    if progress_cb:
        progress_cb(pct, step)
    logger.info("[Pipeline] %s%% - %s", pct, step)


def _model_ready(name: str, require_runtime: bool = False) -> bool:
    model_status = get_model_diagnostics(probe_runtime=False).get(name, {})
    if not model_status.get("artifact_exists"):
        return False
    runtime_ready = model_status.get("runtime_ready")
    if require_runtime and runtime_ready is False:
        return False
    return True


def _prepare_contradictions_for_trust(contradictions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    prepared: list[dict[str, Any]] = []
    for contradiction in contradictions:
        prepared.append({
            **contradiction,
            "doc_1_id": contradiction.get("doc_a", {}).get("id", ""),
            "doc_2_id": contradiction.get("doc_b", {}).get("id", ""),
        })
    return prepared


def _merge_trust_state(target: dict[str, Any], scored: dict[str, Any]) -> None:
    baseline_score = target.get("trust_score", 100)
    baseline_level = target.get("risk_level", "CLEAN")
    baseline_signals = list(target.get("trust_signals", []))

    computed_score = scored.get("trust_score", scored.get("score", 100))
    computed_level = scored.get("risk_level", "CLEAN")
    computed_signals = scored.get("trust_signals", scored.get("signals", []))

    target["trust_score"] = min(baseline_score, computed_score)
    target["risk_level"] = max(
        baseline_level,
        computed_level,
        key=lambda level: RISK_LEVEL_PRIORITY.get(level, 0),
    )
    merged_signals: list[dict[str, Any]] = []
    seen_signals: set[tuple[Any, ...]] = set()
    for signal in baseline_signals + list(computed_signals):
        signal_key = (
            signal.get("signal") or signal.get("type"),
            signal.get("detail"),
            signal.get("impact"),
            signal.get("severity"),
        )
        if signal_key in seen_signals:
            continue
        seen_signals.add(signal_key)
        merged_signals.append(signal)
    target["trust_signals"] = merged_signals


def _apply_trust_scores_with_contradictions(
    documents: list[dict[str, Any]],
    doc_graph: dict[str, Any],
    contradictions: list[dict[str, Any]],
) -> None:
    if hasattr(trust_scorer_module, "calculate_trust_scores"):
        scored_documents = trust_scorer_module.calculate_trust_scores(
            copy.deepcopy(documents),
            doc_graph,
            _prepare_contradictions_for_trust(contradictions),
        )
        scored_lookup = {doc["id"]: doc for doc in scored_documents}
        for original in documents:
            scored = scored_lookup.get(original["id"])
            if scored:
                _merge_trust_state(original, scored)
        return

    if hasattr(trust_scorer_module, "calculate_trust_score"):
        docs_lookup = {doc["id"]: doc for doc in documents}
        for doc in documents:
            trust_result = trust_scorer_module.calculate_trust_score(doc, doc_graph, docs_lookup)
            _merge_trust_state(doc, trust_result)
        return

    raise RuntimeError("No supported trust scoring interface found")


def _merge_reasoning_into_findings(
    contradictions: list[dict[str, Any]],
    ghost_entities: list[dict[str, Any]],
    reasoning: dict[str, Any],
) -> None:
    explanation_map = {
        item.get("contradiction_id") or item.get("id"): item
        for item in reasoning.get("contradiction_explanations", [])
        if item.get("contradiction_id") or item.get("id")
    }
    for contradiction in contradictions:
        explanation = explanation_map.get(contradiction.get("id"))
        if not explanation:
            continue
        enhanced_text = explanation.get("explanation") or explanation.get("finding")
        if enhanced_text:
            contradiction["reasoning_explanation"] = enhanced_text
            contradiction["explanation"] = enhanced_text
        recommended_action = explanation.get("recommended_action")
        if recommended_action:
            contradiction["recommended_action"] = recommended_action

    narrative_map = {
        item.get("ghost_id") or item.get("id"): item
        for item in reasoning.get("ghost_narratives", [])
        if item.get("ghost_id") or item.get("id")
    }
    for ghost_entity in ghost_entities:
        narrative = narrative_map.get(ghost_entity.get("id"))
        if not narrative:
            continue
        enhanced_narrative = narrative.get("narrative") or narrative.get("explanation")
        if enhanced_narrative:
            ghost_entity["reasoning_narrative"] = enhanced_narrative
            ghost_entity["explanation"] = enhanced_narrative


def _fallback_report_text(
    documents: list[dict[str, Any]],
    contradictions: list[dict[str, Any]],
    missing_chains: list[dict[str, Any]],
    ghost_entities: list[dict[str, Any]],
) -> str:
    return (
        "Automated report generation unavailable.\n\n"
        f"Documents analyzed: {len(documents)}\n"
        f"Contradictions found: {len(contradictions)}\n"
        f"Missing chains found: {len(missing_chains)}\n"
        f"Ghost entities found: {len(ghost_entities)}"
    )


def _normalize_report_paths(raw_path: str | None) -> tuple[str | None, str | None]:
    if not raw_path:
        return None, None

    path = Path(raw_path)
    candidates = [path]
    if not path.is_absolute():
        candidates.append(EXPORTS_DIR / path.name)

    for candidate in candidates:
        if candidate.exists():
            resolved = str(candidate.resolve())
            if candidate.suffix.lower() == ".pdf":
                return resolved, resolved
            return None, resolved
    return None, None


async def run_pipeline(
    job_id: str,
    file_paths: list[str],
    progress_cb: ProgressCallback | None = None,
) -> dict[str, Any]:
    documents: list[dict[str, Any]] = []
    contradictions: list[dict[str, Any]] = []
    missing_chains: list[dict[str, Any]] = []
    ghost_entities: list[dict[str, Any]] = []
    doc_graph: dict[str, Any] = _default_graph()
    reasoning: dict[str, Any] = {
        "contradiction_explanations": [],
        "ghost_narratives": [],
        "report_text": "",
    }

    _report_progress(progress_cb, 5, "preprocessing")
    preprocessed: list[dict[str, Any]] = []
    for file_path in file_paths:
        try:
            result = await asyncio.to_thread(preprocess, file_path)
            result["original_filename"] = Path(file_path).name
            preprocessed.append(result)
        except Exception as exc:
            logger.warning("Preprocess failed for %s: %s", file_path, exc)
            preprocessed.append({
                "path": file_path,
                "original_filename": Path(file_path).name,
                "mode": "unknown",
                "scan_quality_score": 50,
            })

    _report_progress(progress_cb, 15, "parsing_documents")
    for index, pre in enumerate(preprocessed, start=1):
        base_doc = _default_document(
            doc_id=f"doc_{index}",
            filename=pre.get("original_filename", Path(pre.get("path", "")).name),
            mode=pre.get("mode", "unknown"),
            scan_quality_score=pre.get("scan_quality_score", 50),
        )
        try:
            parsed = await asyncio.to_thread(parse_document, pre["path"])
            base_doc["full_text"] = parsed.get("full_text", "")
            base_doc["pages"] = parsed.get("pages", [])
            base_doc["table_count"] = parsed.get("table_count", 0)
        except Exception as exc:
            logger.warning("Parse failed for %s: %s", pre.get("path"), exc)
            base_doc["trust_score"] = 50
            base_doc["risk_level"] = "SUSPICIOUS"
            base_doc["trust_signals"] = [{
                "type": "PARSE_FAILED",
                "detail": f"Document parsing failed: {exc}",
                "severity": "HIGH",
                "impact": -50,
            }]
        documents.append(base_doc)
    _report_progress(progress_cb, 25, "parsing_complete")

    _report_progress(progress_cb, 30, "classifying_documents")
    try:
        documents = await asyncio.to_thread(classify_documents, documents)
        if not _model_ready("phi4mini"):
            logger.warning("Phi-4-mini unavailable; classifier fallback implementation was used")
    except Exception as exc:
        logger.warning("Classification failed: %s", exc)
    for document in documents:
        if not document.get("doc_type"):
            document["doc_type"] = "OTHER"
            document["classification_confidence"] = 0.0
    _report_progress(progress_cb, 35, "classification_complete")

    _report_progress(progress_cb, 40, "extracting_fields")
    if _model_ready("nuextract", require_runtime=True):
        try:
            documents = await asyncio.to_thread(extract_fields, documents)
        except Exception as exc:
            logger.warning("Extraction failed: %s", exc)
    else:
        logger.warning("Skipping extraction because nuextract is unavailable at runtime")
    for document in documents:
        if not isinstance(document.get("structured_fields"), dict):
            document["structured_fields"] = {}
    _report_progress(progress_cb, 50, "extraction_complete")

    # Cross-document analysis only makes sense with 2+ documents
    is_multi_doc = len(documents) >= 2

    _report_progress(progress_cb, 52, "building_graph")
    if is_multi_doc:
        try:
            doc_graph = await asyncio.to_thread(build_doc_graph, documents)
        except Exception as exc:
            logger.warning("Graph building failed: %s", exc)
            doc_graph = _default_graph()
    else:
        logger.info("Single document — skipping cross-document graph")
    _report_progress(progress_cb, 55, "graph_complete")

    _report_progress(progress_cb, 58, "detecting_contradictions")
    if is_multi_doc:
        try:
            contradictions = await asyncio.to_thread(detect_contradictions, documents, doc_graph)
        except Exception as exc:
            logger.warning("Contradiction detection failed: %s", exc)
            contradictions = []
    else:
        logger.info("Single document — skipping contradiction detection")
    _report_progress(progress_cb, 65, "contradictions_complete")

    _report_progress(progress_cb, 68, "detecting_missing_chains")
    if is_multi_doc:
        try:
            missing_chains = await asyncio.to_thread(detect_missing_chains, doc_graph, documents)
        except Exception as exc:
            logger.warning("Missing chain detection failed: %s", exc)
            missing_chains = []
    else:
        logger.info("Single document — skipping missing chain detection")
    _report_progress(progress_cb, 72, "chains_complete")

    _report_progress(progress_cb, 75, "detecting_ghost_entities")
    if is_multi_doc:
        try:
            ghost_entities = await asyncio.to_thread(detect_ghost_entities, doc_graph, documents)
        except Exception as exc:
            logger.warning("Ghost entity detection failed: %s", exc)
            ghost_entities = []
    else:
        logger.info("Single document — skipping ghost entity detection")
    _report_progress(progress_cb, 78, "ghosts_complete")

    _report_progress(progress_cb, 80, "scoring_trust")
    try:
        await asyncio.to_thread(_apply_trust_scores_with_contradictions, documents, doc_graph, contradictions)
    except Exception as exc:
        logger.warning("Trust scoring stage failed: %s", exc)
    _report_progress(progress_cb, 85, "scoring_complete")

    _report_progress(progress_cb, 88, "generating_reasoning")
    if _model_ready("phi4mini", require_runtime=True):
        try:
            reasoning = await asyncio.to_thread(
                generate_reasoning_report,
                documents,
                contradictions,
                missing_chains,
                ghost_entities,
            )
        except Exception as exc:
            logger.warning("Reasoning failed: %s", exc)
            reasoning = {
                "contradiction_explanations": [],
                "ghost_narratives": [],
                "report_text": _fallback_report_text(documents, contradictions, missing_chains, ghost_entities),
            }
    else:
        logger.warning("Skipping reasoning because phi4mini is unavailable at runtime")
        reasoning = {
            "contradiction_explanations": [],
            "ghost_narratives": [],
            "report_text": _fallback_report_text(documents, contradictions, missing_chains, ghost_entities),
        }
    _merge_reasoning_into_findings(contradictions, ghost_entities, reasoning)
    _report_progress(progress_cb, 93, "reasoning_complete")

    _report_progress(progress_cb, 95, "generating_report")
    pdf_path: str | None = None
    report_download_path: str | None = None
    try:
        raw_pdf_path = await asyncio.to_thread(
            generate_pdf_report,
            job_id,
            documents,
            contradictions,
            missing_chains,
            ghost_entities,
            reasoning.get("report_text", ""),
        )
        pdf_path, report_download_path = _normalize_report_paths(raw_pdf_path)
    except Exception as exc:
        logger.warning("PDF generation failed: %s", exc)
    _report_progress(progress_cb, 98, "report_complete")
    _report_progress(progress_cb, 100, "complete")

    return {
        "documents": documents,
        "contradictions": contradictions,
        "missing_chains": missing_chains,
        "ghost_entities": ghost_entities,
        "timeline": doc_graph.get("date_sequence", []),
        "doc_graph": {
            "po_groups": doc_graph.get("po_groups", {}),
            "vendor_groups": doc_graph.get("vendor_groups", {}),
        },
        "report_text": reasoning.get("report_text") or _fallback_report_text(
            documents,
            contradictions,
            missing_chains,
            ghost_entities,
        ),
        "contradiction_explanations": reasoning.get("contradiction_explanations", []),
        "ghost_narratives": reasoning.get("ghost_narratives", []),
        "report_pdf_path": pdf_path,
        "report_download_path": report_download_path,
        "summary": {
            "total_documents": len(documents),
            "contradictions_found": len(contradictions),
            "missing_chains_found": len(missing_chains),
            "ghost_entities_found": len(ghost_entities),
            "high_risk_documents": sum(1 for doc in documents if doc.get("risk_level") == "HIGH_RISK"),
            "suspicious_documents": sum(1 for doc in documents if doc.get("risk_level") == "SUSPICIOUS"),
        },
    }
