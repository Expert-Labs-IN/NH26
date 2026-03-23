"""
DocNerve — Ghost Entity Detector (Step 7)
Finds entities suspiciously absent from document series.
"""
from typing import List, Dict, Any, Set
from collections import defaultdict
import uuid

from config import GHOST_SUSPICION_THRESHOLD, GHOST_HIGH_SUSPICION

def detect_ghost_entities(
    doc_graph: Dict[str, Any],
    documents: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Detect entities suspiciously absent from related documents.
    
    Args:
        doc_graph: Graph with entity_matrix from build_doc_graph
        documents: List of doc dicts
    
    Returns:
        List of ghost entity dicts
    """
    ghost_entities = []
    
    # Build doc lookup
    doc_lookup = {d["id"]: d for d in documents}
    
    # Get entity matrix
    entity_matrix = doc_graph.get("entity_matrix", {})
    
    if not entity_matrix:
        return []
    
    # Find document series (quarterly reports, related docs)
    doc_series = _identify_document_series(documents)
    
    for entity, doc_roles in entity_matrix.items():
        # Get docs this entity appears in
        present_docs = set(doc_roles.keys())
        
        # Check each series for gaps
        for series_name, series_doc_ids in doc_series.items():
            series_set = set(series_doc_ids)
            
            # Skip if entity not in this series at all
            if not (present_docs & series_set):
                continue
            
            # Find absent docs in series
            absent_docs = series_set - present_docs
            
            if not absent_docs:
                continue
            
            # Calculate suspicion score
            present_count = len(present_docs & series_set)
            total_count = len(series_set)
            
            # Suspicion: present in most but not all
            if present_count >= 2 and present_count < total_count:
                # Higher suspicion if absent from minority
                absent_ratio = len(absent_docs) / total_count
                suspicion = 1.0 - absent_ratio  # More suspicious if fewer absences
                
                # Boost for key roles
                roles = list(doc_roles.values())
                key_roles = {"Project Lead", "Approver", "Authorizer", "Manager"}
                if any(r in key_roles for r in roles):
                    suspicion = min(1.0, suspicion + 0.2)
                
                if suspicion >= GHOST_SUSPICION_THRESHOLD:
                    # Build explanation
                    present_filenames = [
                        doc_lookup[did].get("filename", did)
                        for did in present_docs & series_set
                        if did in doc_lookup
                    ]
                    absent_filenames = [
                        doc_lookup[did].get("filename", did)
                        for did in absent_docs
                        if did in doc_lookup
                    ]
                    
                    role = roles[0] if roles else "Unknown"
                    
                    ghost_entities.append({
                        "id": f"ghost_{uuid.uuid4().hex[:8]}",
                        "entity": entity,
                        "role": role,
                        "present_in": list(present_docs & series_set),
                        "present_filenames": present_filenames,
                        "absent_from": list(absent_docs),
                        "absent_filenames": absent_filenames,
                        "series": series_name,
                        "suspicion_score": round(suspicion, 2),
                        "severity": "HIGH" if suspicion >= GHOST_HIGH_SUSPICION else "MEDIUM",
                        "explanation": _build_ghost_explanation(
                            entity, role, present_filenames, absent_filenames, series_name
                        ),
                    })
    
    # Sort by suspicion score
    ghost_entities.sort(key=lambda x: x["suspicion_score"], reverse=True)
    
    return ghost_entities


def _identify_document_series(documents: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    """
    Identify document series (e.g., quarterly reports).
    Returns: {series_name: [doc_ids]}
    """
    series = defaultdict(list)
    
    for doc in documents:
        doc_id = doc.get("id", "")
        doc_type = doc.get("doc_type", "")
        filename = doc.get("filename", "").lower()
        
        # Quarterly reports
        if doc_type == "QUARTERLY_REPORT" or "q1" in filename or "q2" in filename or "q3" in filename or "q4" in filename:
            # Extract project/vendor name for grouping
            fields = doc.get("structured_fields", {})
            project = fields.get("project_name", "")
            vendor = fields.get("vendor_name", "")
            
            series_key = f"quarterly_{project or vendor or 'reports'}"
            series[series_key].append(doc_id)
        
        # Same vendor documents
        fields = doc.get("structured_fields", {})
        vendor = fields.get("vendor_name", "")
        if vendor:
            series[f"vendor_{vendor}"].append(doc_id)
    
    # Only return series with multiple docs
    return {k: v for k, v in series.items() if len(v) >= 2}


def _build_ghost_explanation(
    entity: str,
    role: str,
    present: List[str],
    absent: List[str],
    series: str
) -> str:
    """Build human-readable explanation for ghost entity."""
    present_str = ", ".join(present[:3])
    if len(present) > 3:
        present_str += f" (+{len(present)-3} more)"
    
    absent_str = ", ".join(absent[:2])
    
    explanation = f"{entity} ({role}) appears in {present_str} but is conspicuously absent from {absent_str}."
    
    if "quarterly" in series.lower():
        explanation += " This gap in quarterly reports may indicate personnel changes or deliberate omission."
    
    return explanation


def get_entity_timeline(doc_graph: dict, entity: str, documents: list) -> List[Dict]:
    """
    Get timeline of an entity's appearances across documents.
    Useful for detailed investigation.
    """
    timeline = []
    doc_lookup = {d["id"]: d for d in documents}
    entity_matrix = doc_graph.get("entity_matrix", {})
    
    if entity not in entity_matrix:
        return []
    
    doc_roles = entity_matrix[entity]
    
    for doc_id, role in doc_roles.items():
        doc = doc_lookup.get(doc_id, {})
        fields = doc.get("structured_fields", {})
        
        # Try to get date
        date = None
        for date_field in ["invoice_date", "po_date", "contract_date", "grn_date"]:
            if date_field in fields:
                date = fields[date_field]
                break
        
        timeline.append({
            "doc_id": doc_id,
            "filename": doc.get("filename", ""),
            "doc_type": doc.get("doc_type", ""),
            "role": role,
            "date": date,
        })
    
    return timeline
