"""
DocNerve — PDF Report Generator
Creates professional PDF investigation reports.
"""

import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import cm, inch
    from reportlab.platypus import (
        HRFlowable,
        KeepTogether,
        PageBreak,
        Paragraph,
        SimpleDocTemplate,
        Spacer,
        Table,
        TableStyle,
    )

    REPORTLAB_AVAILABLE = True
    REPORTLAB_IMPORT_ERROR = None
except ImportError:
    REPORTLAB_AVAILABLE = False
    REPORTLAB_IMPORT_ERROR = "reportlab not installed"

from config import EXPORTS_DIR


def generate_pdf_report(
    job_id: str,
    documents: List[Dict[str, Any]],
    contradictions: List[Dict[str, Any]],
    missing_chains: List[Dict[str, Any]],
    ghost_entities: List[Dict[str, Any]],
    report_text: str,
) -> str:
    """
    Generate PDF investigation report.

    Returns: Path to generated PDF
    """
    if not REPORTLAB_AVAILABLE:
        logger.warning(
            "ReportLab unavailable (%s); generating text report instead of PDF",
            REPORTLAB_IMPORT_ERROR or "unknown reason",
        )
        # Fallback: save as text file
        txt_path = EXPORTS_DIR / f"report_{job_id[:8]}.txt"
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(report_text)
        return str(txt_path)

    # Create PDF
    pdf_path = EXPORTS_DIR / f"DocNerve_Report_{job_id[:8]}.pdf"
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    # Styles
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="Title2",
            parent=styles["Heading1"],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor("#1a365d"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="Section",
            parent=styles["Heading2"],
            fontSize=14,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.HexColor("#2c5282"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="Finding",
            parent=styles["Normal"],
            fontSize=10,
            spaceBefore=5,
            spaceAfter=5,
            leftIndent=20,
        )
    )
    styles.add(
        ParagraphStyle(
            name="DocSubSection",
            parent=styles["Heading3"],
            fontSize=11,
            spaceBefore=8,
            spaceAfter=6,
            textColor=colors.HexColor("#2d3748"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="SmallLabel",
            parent=styles["Normal"],
            fontSize=9,
            textColor=colors.HexColor("#4a5568"),
            spaceBefore=2,
            spaceAfter=2,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodySmall",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#1a202c"),
            spaceBefore=2,
            spaceAfter=6,
        )
    )

    # Build content
    story = []

    # Title
    story.append(Paragraph("DocNerve Investigation Report", styles["Title2"]))
    story.append(
        Paragraph(
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles["Normal"]
        )
    )
    story.append(Spacer(1, 20))

    # Executive Summary
    story.append(Paragraph("Executive Summary", styles["Section"]))

    total_docs = len(documents)
    high_risk = sum(1 for d in documents if d.get("risk_level") == "HIGH_RISK")
    total_amount = sum(c.get("difference", 0) for c in contradictions) + sum(
        m.get("amount_at_risk", 0) for m in missing_chains
    )

    summary_data = [
        ["Documents Analyzed", str(total_docs)],
        ["Contradictions Found", str(len(contradictions))],
        ["Missing Chains", str(len(missing_chains))],
        ["Ghost Entities", str(len(ghost_entities))],
        ["High-Risk Documents", str(high_risk)],
        ["Amount at Risk", f"₹{total_amount:,.2f}"],
    ]

    summary_table = Table(summary_data, colWidths=[3 * inch, 2 * inch])
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f7fafc")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#2d3748")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ]
        )
    )
    story.append(summary_table)
    story.append(Spacer(1, 20))

    # Contradictions
    if contradictions:
        story.append(Paragraph("Contradictions Detected", styles["Section"]))
        for i, c in enumerate(contradictions, 1):
            severity_color = {
                "HIGH": "#e53e3e",
                "MEDIUM": "#dd6b20",
                "LOW": "#38a169",
            }.get(c.get("severity", ""), "#718096")

            text = f"<b>{i}. {c.get('type', 'Unknown')}</b> "
            text += f"<font color='{severity_color}'>[{c.get('severity', 'UNKNOWN')}]</font><br/>"
            text += f"Documents: {c.get('doc_1_filename', '')} vs {c.get('doc_2_filename', '')}<br/>"
            text += c.get("explanation", "")

            story.append(Paragraph(text, styles["Finding"]))
        story.append(Spacer(1, 10))

    # Missing Chains
    if missing_chains:
        story.append(Paragraph("Missing Document Chains", styles["Section"]))
        for i, m in enumerate(missing_chains, 1):
            text = (
                f"<b>{i}. {m.get('type', 'Unknown')}</b> [{m.get('severity', '')}]<br/>"
            )
            text += f"Missing: {m.get('missing_doc_type', '')}<br/>"
            text += f"Amount at Risk: ₹{m.get('amount_at_risk', 0):,.2f}<br/>"
            text += m.get("explanation", "")

            story.append(Paragraph(text, styles["Finding"]))
        story.append(Spacer(1, 10))

    # Ghost Entities
    if ghost_entities:
        story.append(Paragraph("Ghost Entities", styles["Section"]))
        for i, g in enumerate(ghost_entities, 1):
            text = (
                f"<b>{i}. {g.get('entity', 'Unknown')}</b> ({g.get('role', '')})<br/>"
            )
            text += f"Suspicion Score: {g.get('suspicion_score', 0):.0%}<br/>"
            text += g.get("explanation", "")

            story.append(Paragraph(text, styles["Finding"]))
        story.append(Spacer(1, 10))

    # Document Scores
    story.append(Paragraph("Document Trust Scores", styles["Section"]))

    doc_data = [["Document", "Score", "Risk Level"]]
    for d in sorted(documents, key=lambda x: x.get("trust_score", 100)):
        score = d.get("trust_score", 100)
        level = d.get("risk_level", "UNKNOWN")
        doc_data.append([d.get("filename", "Unknown"), f"{score}/100", level])

    doc_table = Table(doc_data, colWidths=[3 * inch, 1 * inch, 1.5 * inch])
    doc_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4a5568")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e0")),
            ]
        )
    )
    story.append(doc_table)
    story.append(Spacer(1, 16))

    # Per-document detail section (summary + extracted text)
    story.append(Paragraph("Per-Document Details", styles["Section"]))

    def _safe_text(value: Any, fallback: str = "N/A") -> str:
        text = str(value).strip() if value is not None else ""
        return text if text else fallback

    def _escape_html(text: str) -> str:
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    def _truncate(text: str, max_chars: int) -> str:
        if len(text) <= max_chars:
            return text
        return text[: max_chars - 3].rstrip() + "..."

    for index, d in enumerate(documents, start=1):
        filename = _safe_text(d.get("filename"), "Unknown")
        doc_type = _safe_text(d.get("doc_type"), "OTHER")
        mode = _safe_text(d.get("mode"), "unknown")
        trust = d.get("trust_score", 100)
        risk = _safe_text(d.get("risk_level"), "UNKNOWN")
        summary_text = _safe_text(d.get("summary"), "No AI summary available.")
        extracted_text = _safe_text(d.get("full_text"), "No extracted text available.")

        # Keep each document block neat and grouped
        block = []
        block.append(
            Paragraph(f"{index}. {_escape_html(filename)}", styles["DocSubSection"])
        )
        block.append(
            Paragraph(
                f"<b>Type:</b> {_escape_html(doc_type)} &nbsp;&nbsp; "
                f"<b>Mode:</b> {_escape_html(mode)} &nbsp;&nbsp; "
                f"<b>Trust:</b> {_escape_html(str(trust))}/100 &nbsp;&nbsp; "
                f"<b>Risk:</b> {_escape_html(risk)}",
                styles["SmallLabel"],
            )
        )
        block.append(Spacer(1, 4))

        block.append(Paragraph("Phi Summary", styles["SmallLabel"]))
        block.append(
            Paragraph(_escape_html(_truncate(summary_text, 2000)), styles["BodySmall"])
        )

        block.append(Paragraph("Extracted Text", styles["SmallLabel"]))
        block.append(
            Paragraph(
                _escape_html(_truncate(extracted_text, 4500)).replace("\n", "<br/>"),
                styles["BodySmall"],
            )
        )

        block.append(
            HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#e2e8f0"))
        )
        block.append(Spacer(1, 6))

        story.append(KeepTogether(block))

    # Footer
    story.append(Spacer(1, 18))
    story.append(
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"))
    )
    story.append(Spacer(1, 10))
    story.append(
        Paragraph(
            "<i>DocNerve - AI Forensic Document Auditor</i><br/>"
            '<i>"Your documents have secrets. We find them."</i>',
            styles["Normal"],
        )
    )

    # Build PDF
    doc.build(story)

    return str(pdf_path)
