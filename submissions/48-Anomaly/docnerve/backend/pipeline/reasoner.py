"""
DocNerve — LLM Reasoner (Step 9)
Generates human-readable explanations using Phi-4-mini.
"""

from typing import Any, Dict, List

# Import router from O2
try:
    from models.router import router
except ImportError:
    router = None


def generate_reasoning_report(
    documents: List[Dict[str, Any]],
    contradictions: List[Dict[str, Any]],
    missing_chains: List[Dict[str, Any]],
    ghost_entities: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Generate reasoning and explanations for findings.

    Args:
        documents: List of analyzed documents
        contradictions: List of detected contradictions
        missing_chains: List of missing chain alerts
        ghost_entities: List of ghost entity alerts

    Returns:
        {contradiction_explanations, ghost_narratives, report_text}
    """
    result = {
        "contradiction_explanations": [],
        "ghost_narratives": [],
        "report_text": "",
    }

    # Try to load Phi-4-mini for enhanced reasoning
    llm = None
    if router:
        try:
            llm = router.load("phi4mini")
        except Exception as e:
            print(f"[Reasoner] Could not load Phi-4-mini: {e}")

    # Generate contradiction explanations
    result["contradiction_explanations"] = _explain_contradictions(contradictions, llm)

    # Generate ghost narratives
    result["ghost_narratives"] = _explain_ghosts(ghost_entities, llm)

    # Generate document summaries
    _summarize_documents(documents, llm)

    # Generate full report
    result["report_text"] = _generate_full_report(
        documents, contradictions, missing_chains, ghost_entities, llm
    )

    # Evict LLM to free VRAM
    if router:
        router.evict()

    return result


def _explain_contradictions(contradictions: list, llm) -> List[Dict]:
    """Generate enhanced explanations for contradictions."""
    explanations = []

    for contra in contradictions:
        explanation = contra.get("explanation", "")

        # Try LLM enhancement
        if llm:
            try:
                prompt = f"""You are a forensic document auditor. Explain this finding in 2-3 sentences:

Finding Type: {contra.get("type")}
Document 1: {contra.get("doc_1_filename")}
Document 2: {contra.get("doc_2_filename")}
Value 1: {contra.get("value_1")}
Value 2: {contra.get("value_2")}
Basic Explanation: {explanation}

Provide a clear, professional explanation of why this is concerning:"""

                response = llm.create_chat_completion(
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=150,
                    temperature=0.3,
                    stop=["<|im_end|>", "\n\n"],
                )
                enhanced = response["choices"][0]["message"]["content"].strip()
                if enhanced:
                    explanation = enhanced
            except Exception as e:
                print(f"[Reasoner] LLM enhancement failed: {e}")

        explanations.append(
            {
                "id": contra.get("id"),
                "type": contra.get("type"),
                "explanation": explanation,
            }
        )

    return explanations


def _explain_ghosts(ghost_entities: list, llm) -> List[Dict]:
    """Generate narrative explanations for ghost entities."""
    narratives = []

    for ghost in ghost_entities:
        narrative = ghost.get("explanation", "")

        # Try LLM enhancement
        if llm:
            try:
                prompt = f"""You are a forensic document auditor. Write a brief narrative about this suspicious absence:

Entity: {ghost.get("entity")}
Role: {ghost.get("role")}
Present in: {", ".join(ghost.get("present_filenames", []))}
Absent from: {", ".join(ghost.get("absent_filenames", []))}
Suspicion Score: {ghost.get("suspicion_score", 0):.0%}

Write 2-3 sentences explaining why this absence is suspicious and what it might indicate:"""

                response = llm.create_chat_completion(
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=150,
                    temperature=0.3,
                    stop=["<|im_end|>", "\n\n"],
                )
                enhanced = response["choices"][0]["message"]["content"].strip()
                if enhanced:
                    narrative = enhanced
            except Exception as e:
                print(f"[Reasoner] LLM narrative failed: {e}")

        narratives.append(
            {
                "id": ghost.get("id"),
                "entity": ghost.get("entity"),
                "narrative": narrative,
            }
        )

    return narratives


def _summarize_documents(documents: list, llm) -> None:
    """Generate a one-paragraph summary for each document."""
    for doc in documents:
        text = doc.get("full_text", "")
        if not text:
            doc["summary"] = "No text available to summarize."
            continue

        if llm:
            try:
                prompt = f"Write a concise, one-paragraph summary of this document:\n\n{text[:2000]}\n\nSummary:"
                response = llm.create_chat_completion(
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=150,
                    temperature=0.3,
                    stop=["<|im_end|>", "\n\n"],
                )
                summary = response["choices"][0]["message"]["content"].strip()
                doc["summary"] = (
                    summary if summary else "Summary could not be generated."
                )
            except Exception as e:
                print(f"[Reasoner] LLM summary failed: {e}")
                doc["summary"] = "Error generating summary."
        else:
            doc["summary"] = "LLM unavailable for summarization."


def _generate_full_report(
    documents: list,
    contradictions: list,
    missing_chains: list,
    ghost_entities: list,
    llm,
) -> str:
    """Generate full investigation report."""

    # Build summary stats
    total_docs = len(documents)
    high_risk = sum(1 for d in documents if d.get("risk_level") == "HIGH_RISK")
    suspicious = sum(1 for d in documents if d.get("risk_level") == "SUSPICIOUS")

    total_amount_at_risk = sum(c.get("difference", 0) for c in contradictions) + sum(
        m.get("amount_at_risk", 0) for m in missing_chains
    )

    # Build report sections
    report = f"""
================================================================================
                      DOCNERVE FORENSIC INVESTIGATION REPORT
================================================================================

EXECUTIVE SUMMARY
-----------------
Documents Analyzed: {total_docs}
High-Risk Documents: {high_risk}
Suspicious Documents: {suspicious}
Total Contradictions: {len(contradictions)}
Missing Document Chains: {len(missing_chains)}
Ghost Entities Detected: {len(ghost_entities)}
Estimated Amount at Risk: ₹{total_amount_at_risk:,.2f}

"""

    # Contradictions section
    if contradictions:
        report += """
CONTRADICTIONS DETECTED
-----------------------
"""
        for i, c in enumerate(contradictions, 1):
            report += f"""
{i}. {c.get("type")} [{c.get("severity")}]
   Documents: {c.get("doc_1_filename")} vs {c.get("doc_2_filename")}
   {c.get("explanation", "No explanation available")}
"""

    # Missing chains section
    if missing_chains:
        report += """
MISSING DOCUMENT CHAINS
-----------------------
"""
        for i, m in enumerate(missing_chains, 1):
            report += f"""
{i}. {m.get("type")} [{m.get("severity")}]
   Missing: {m.get("missing_doc_type")}
   Amount at Risk: ₹{m.get("amount_at_risk", 0):,.2f}
   {m.get("explanation", "No explanation available")}
"""

    # Ghost entities section
    if ghost_entities:
        report += """
GHOST ENTITIES (SUSPICIOUS ABSENCES)
------------------------------------
"""
        for i, g in enumerate(ghost_entities, 1):
            report += f"""
{i}. {g.get("entity")} ({g.get("role")})
   Suspicion Score: {g.get("suspicion_score", 0):.0%}
   {g.get("explanation", "No explanation available")}
"""

    # Document scores section
    report += """
DOCUMENT TRUST SCORES
---------------------
"""
    for doc in sorted(documents, key=lambda d: d.get("trust_score", 100)):
        score = doc.get("trust_score", 100)
        level = doc.get("risk_level", "UNKNOWN")
        report += f"  {doc.get('filename', 'Unknown')}: {score}/100 [{level}]\n"

    # Footer
    report += """
================================================================================
Report generated by DocNerve - AI Forensic Document Auditor
"Your documents have secrets. We find them."
================================================================================
"""

    return report
