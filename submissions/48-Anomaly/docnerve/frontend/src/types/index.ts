export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type RiskLevel = "HIGH_RISK" | "SUSPICIOUS" | "CLEAN";
export type JobStatus = "processing" | "complete" | "error";
export type ActiveView = "findings" | "timeline" | "documents";

export type DocType =
  | "INVOICE"
  | "CONTRACT"
  | "PURCHASE_ORDER"
  | "GOODS_RECEIPT_NOTE"
  | "APPROVAL_NOTE"
  | "BANK_STATEMENT"
  | "LEGAL_NOTICE"
  | "EMAIL"
  | "INTERNAL_MEMO"
  | "PAYMENT_CONFIRMATION"
  | "PURCHASE_REQUISITION"
  | "QUARTERLY_REPORT"
  | "OTHER"
  | (string & {});

export interface ModelCheck {
  path: string;
  artifact_exists: boolean;
  runtime_ready: boolean | null;
  error: string | null;
}

export interface HealthResponse {
  status: string;
  models_ready: boolean;
  debug: boolean;
  checks: Record<string, ModelCheck>;
}

export interface SampleDocsResponse {
  files: string[];
  count: number;
  path: string;
}

export interface AnalyzeResponse {
  job_id: string;
  status: string;
  file_count: number;
}

export interface TrustSignal {
  signal?: string;
  type?: string;
  detail: string;
  severity?: Severity;
  impact?: number;
}

export interface Document {
  id: string;
  filename: string;
  doc_type: DocType;
  mode: "digital" | "scan" | "unknown";
  trust_score: number;
  risk_level: RiskLevel;
  trust_signals: TrustSignal[];
  structured_fields: Record<string, unknown>;
  table_count: number;
  classification_confidence?: number;
  scan_quality_score?: number;
  summary?: string;
  full_text?: string;
}

export interface ContradictionDoc {
  id: string;
  filename: string;
  type: DocType;
}

export interface Contradiction {
  id: string;
  type: string;
  field: string;
  severity: Severity;
  layer?: string;
  po_number?: string;
  doc_1_id?: string;
  doc_2_id?: string;
  doc_a: ContradictionDoc;
  doc_b: ContradictionDoc;
  doc_a_value?: string;
  doc_b_value?: string;
  value_1?: string | number;
  value_2?: string | number;
  difference?: number;
  difference_pct?: number;
  explanation?: string;
  reasoning_explanation?: string;
  recommended_action?: string;
  nli_confidence?: number;
}

export interface MissingChain {
  id: string;
  type: string;
  severity: Severity;
  po_number?: string;
  vendor?: string;
  missing_doc_type?: string;
  present_nodes: string[];
  missing_nodes: string[];
  present_docs?: string[];
  trigger_doc_filename?: string;
  amount_at_risk?: number;
  amount_display?: string;
  explanation?: string;
  recommended_action?: string;
}

export interface GhostEntity {
  id: string;
  entity: string;
  role?: string;
  series: string;
  present_in: string[];
  present_filenames: string[];
  absent_from: string[];
  absent_filenames: string[];
  suspicion_score: number;
  severity: Severity;
  explanation?: string;
  reasoning_narrative?: string;
}

export interface TimelineEvent {
  date: string;
  date_obj?: string | null;
  doc_id: string;
  doc_type: DocType;
  filename: string;
  event_type: string;
  field: string;
}

export interface AnalysisResult {
  documents: Document[];
  contradictions: Contradiction[];
  missing_chains: MissingChain[];
  ghost_entities: GhostEntity[];
  timeline: TimelineEvent[];
  doc_graph?: {
    po_groups: Record<string, string[]>;
    vendor_groups: Record<string, string[]>;
  };
  report_text: string;
  report_pdf_path?: string | null;
  report_download_path?: string | null;
  contradiction_explanations?: Array<Record<string, unknown>>;
  ghost_narratives?: Array<Record<string, unknown>>;
  summary: {
    total_documents: number;
    contradictions_found: number;
    missing_chains_found: number;
    ghost_entities_found: number;
    high_risk_documents: number;
    suspicious_documents: number;
  };
}

export interface JobResponse {
  status: JobStatus;
  progress: number;
  current_step?: string | null;
  file_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  result: AnalysisResult | null;
  error?: string | null;
}
