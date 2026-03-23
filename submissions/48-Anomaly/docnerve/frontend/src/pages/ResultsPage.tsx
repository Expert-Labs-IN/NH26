import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileText,
  ImageIcon,
  Loader2,
  ScanSearch,
  Shield,
} from 'lucide-react'
import { getReportDownloadUrl } from '../api/client'
import { useJobPolling } from '../hooks/useJobPolling'
import { cn, docTypeLabel, formatStepLabel, riskBadge, trustScoreColor } from '../lib/utils'
import type { Document } from '../types'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button className="icon-btn" onClick={handleCopy} title="Copy" type="button">
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

function DocumentCard({ doc, index }: { doc: Document; index: number }) {
  const [expanded, setExpanded] = useState(index === 0)
  const risk = riskBadge(doc.risk_level)
  const hasText = Boolean(doc.full_text && doc.full_text.length > 0)

  return (
    <div className="doc-card">
      <div className="doc-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="doc-card-meta">
          <div className="doc-card-icon">
            {doc.mode === 'scan' ? <ImageIcon size={18} /> : <FileText size={18} />}
          </div>
          <div>
            <h3 className="doc-card-filename">{doc.filename}</h3>
            <div className="doc-card-tags">
              <span className="tag tag-type">{docTypeLabel(doc.doc_type)}</span>
              <span className="tag tag-mode">
                {doc.mode === 'scan' ? 'Scan' : doc.mode === 'digital' ? 'Digital' : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        <div className="doc-card-right">
          <div className="trust-score-mini">
            <Shield size={14} />
            <span className={trustScoreColor(doc.trust_score)}>{doc.trust_score}</span>
          </div>
          <span className={cn('risk-badge', risk.classes)}>{risk.text}</span>
          <button className="expand-btn" type="button">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="doc-card-body">
          <div className="ocr-section">
            <div className="section-label-row">
              <div className="section-label">
                <ScanSearch size={14} />
                <span>Text</span>
              </div>
              {hasText && <CopyButton text={doc.full_text || ''} />}
            </div>

            <div className="ocr-text-box">
              {hasText ? (
                <pre className="ocr-text">{doc.full_text}</pre>
              ) : (
                <p className="ocr-empty">No text could be extracted from this document.</p>
              )}
            </div>
          </div>

          <div className="summary-section">
            <div className="section-label">
              <FileText size={14} />
              <span>Details</span>
            </div>

            <div className="summary-content">
              {doc.summary && doc.summary.trim().length > 0 && (
                <>
                  <div className="fields-divider" />
                  <p className="fields-heading">Summary</p>
                  <div className="summary-row">
                    <span className="summary-key">Summary</span>
                    <span className="summary-val">{doc.summary}</span>
                  </div>
                </>
              )}

              <div className="summary-row">
                <span className="summary-key">Document Type</span>
                <span className="summary-val">{docTypeLabel(doc.doc_type)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-key">Classification Confidence</span>
                <span className="summary-val">
                  {doc.classification_confidence != null
                    ? `${(doc.classification_confidence * 100).toFixed(0)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-key">Mode</span>
                <span className="summary-val">
                  {doc.mode === 'scan' ? 'Scan' : doc.mode === 'digital' ? 'Digital' : 'Unknown'}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-key">Scan Quality</span>
                <span className="summary-val">
                  {doc.scan_quality_score != null ? `${doc.scan_quality_score}/100` : 'N/A'}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-key">Trust Score</span>
                <span className={cn('summary-val font-semibold', trustScoreColor(doc.trust_score))}>
                  {doc.trust_score}/100
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-key">Tables Detected</span>
                <span className="summary-val">{doc.table_count}</span>
              </div>

              {doc.structured_fields && Object.keys(doc.structured_fields).length > 0 && (
                <>
                  <div className="fields-divider" />
                  <p className="fields-heading">Fields</p>
                  {Object.entries(doc.structured_fields)
                    .filter(([key]) => !key.endsWith('_norm'))
                    .map(([key, value]) => {
                      if (value === null || value === undefined || value === '') return null

                      const display =
                        typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)

                      return (
                        <div key={key} className="summary-row">
                          <span className="summary-key">{key.replace(/_/g, ' ')}</span>
                          <span className="summary-val">{display}</span>
                        </div>
                      )
                    })}
                </>
              )}

              {doc.trust_signals && doc.trust_signals.length > 0 && (
                <>
                  <div className="fields-divider" />
                  <p className="fields-heading">Signals</p>
                  {doc.trust_signals.map((signal, indexSignal) => (
                    <div key={indexSignal} className="signal-row">
                      <span className="signal-type">
                        {(signal.type || signal.signal || 'Signal').replace(/_/g, ' ')}
                      </span>
                      <span className="signal-detail">{signal.detail}</span>
                      {signal.impact != null && (
                        <span className="signal-impact">
                          {signal.impact > 0 ? '+' : ''}
                          {signal.impact}
                        </span>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { job, error } = useJobPolling(jobId ?? null)

  const result = job?.result ?? null

  if (!jobId) {
    return (
      <div className="page-wrapper">
        <header className="navbar">
          <div className="navbar-inner">
            <div className="navbar-brand">
              <div className="navbar-icon">
                <ScanSearch size={20} />
              </div>
              <div>
                <p className="navbar-title">DocNerve</p>
                <p className="navbar-subtitle">Missing result</p>
              </div>
            </div>
          </div>
        </header>

        <main className="results-error-main">
          <div className="error-card">
            <AlertTriangle size={28} className="text-red-500" />
            <h1>No result selected</h1>
            <p>Open a valid result URL or start a new upload.</p>
            <button className="submit-btn" onClick={() => navigate('/')} type="button">
              <ArrowLeft size={16} />
              Back to upload
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (!job || job.status === 'processing') {
    return (
      <div className="page-wrapper">
        <header className="navbar">
          <div className="navbar-inner">
            <div className="navbar-brand">
              <div className="navbar-icon">
                <ScanSearch size={20} />
              </div>
              <div>
                <p className="navbar-title">DocNerve</p>
                <p className="navbar-subtitle">Processing</p>
              </div>
            </div>
            <Link to="/" className="nav-link">
              <ArrowLeft size={14} /> New Upload
            </Link>
          </div>
        </header>

        <main className="processing-main">
          <div className="processing-card">
            <div className="processing-spinner">
              <Loader2 size={40} className="spin" />
            </div>
            <h2 className="processing-title">Processing documents</h2>
            <p className="processing-step">{formatStepLabel(job?.current_step)}</p>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${job?.progress ?? 0}%` }} />
            </div>
            <p className="processing-pct">{job?.progress ?? 0}%</p>
            {job?.file_count && (
              <p className="processing-meta">
                {job.file_count} file{job.file_count !== 1 ? 's' : ''} in queue
              </p>
            )}
          </div>
        </main>
      </div>
    )
  }

  if (job.status === 'error' || error || !result) {
    return (
      <div className="page-wrapper">
        <header className="navbar">
          <div className="navbar-inner">
            <div className="navbar-brand">
              <div className="navbar-icon">
                <ScanSearch size={20} />
              </div>
              <div>
                <p className="navbar-title">DocNerve</p>
                <p className="navbar-subtitle">Run failed</p>
              </div>
            </div>
          </div>
        </header>

        <main className="results-error-main">
          <div className="error-card">
            <AlertTriangle size={28} className="text-red-500" />
            <h1>Could not complete this run</h1>
            <p>{job.error || error || 'Unknown error occurred.'}</p>
            <div className="error-actions">
              <button className="submit-btn" onClick={() => navigate('/')} type="button">
                <ArrowLeft size={16} /> Start Over
              </button>
              <button className="outline-btn" onClick={() => window.location.reload()} type="button">
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const docs = result.documents || []
  const hasContradictions = (result.contradictions?.length ?? 0) > 0
  const hasMissingChains = (result.missing_chains?.length ?? 0) > 0
  const hasGhosts = (result.ghost_entities?.length ?? 0) > 0
  const hasFindings = hasContradictions || hasMissingChains || hasGhosts

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="navbar-icon">
              <ScanSearch size={20} />
            </div>
            <div>
              <p className="navbar-title">DocNerve</p>
              <p className="navbar-subtitle">Review results</p>
            </div>
          </div>

          <div className="navbar-actions">
            <a href={getReportDownloadUrl(jobId)} download className="outline-btn">
              <Download size={14} /> Download report
            </a>
            <Link to="/" className="nav-link">
              <ArrowLeft size={14} /> New Upload
            </Link>
          </div>
        </div>
      </header>

      <main className="results-main">
        <div className="results-summary-strip">
          <div className="summary-stat">
            <span className="stat-num">{result.summary.total_documents}</span>
            <span className="stat-label">Documents</span>
          </div>

          {hasFindings && (
            <>
              <div className="summary-stat">
                <span className="stat-num stat-danger">{result.summary.contradictions_found}</span>
                <span className="stat-label">Conflicts</span>
              </div>
              <div className="summary-stat">
                <span className="stat-num stat-warning">{result.summary.missing_chains_found}</span>
                <span className="stat-label">Missing Records</span>
              </div>
              <div className="summary-stat">
                <span className="stat-num stat-info">{result.summary.ghost_entities_found}</span>
                <span className="stat-label">Entity Gaps</span>
              </div>
              <div className="summary-stat">
                <span className="stat-num stat-danger">{result.summary.high_risk_documents}</span>
                <span className="stat-label">High Risk</span>
              </div>
            </>
          )}
        </div>

        <section className="doc-results">
          <h2 className="results-heading">
            <FileText size={20} />
            Documents
          </h2>
          <div className="doc-cards">
            {docs.map((doc, index) => (
              <DocumentCard key={doc.id} doc={doc} index={index} />
            ))}
          </div>
        </section>

        {hasFindings && (
          <section className="findings-section">
            <h2 className="results-heading">
              <AlertTriangle size={20} />
              Findings
            </h2>

            {hasContradictions && (
              <div className="finding-group">
                <h3 className="finding-group-title">Conflicts ({result.contradictions.length})</h3>
                {result.contradictions.map((contradiction, indexContradiction) => (
                  <div key={indexContradiction} className="finding-card finding-card-danger">
                    <div className="finding-header">
                      <span className="finding-type">
                        {(contradiction.type || '').replace(/_/g, ' ')}
                      </span>
                      <span
                        className={cn(
                          'severity-badge',
                          `severity-${(contradiction.severity || 'medium').toLowerCase()}`,
                        )}
                      >
                        {contradiction.severity}
                      </span>
                    </div>
                    <p className="finding-detail">
                      <strong>{contradiction.doc_a?.filename || 'Doc A'}:</strong>{' '}
                      {contradiction.doc_a_value || contradiction.value_1 || '-'}
                    </p>
                    <p className="finding-detail">
                      <strong>{contradiction.doc_b?.filename || 'Doc B'}:</strong>{' '}
                      {contradiction.doc_b_value || contradiction.value_2 || '-'}
                    </p>
                    {contradiction.explanation && (
                      <p className="finding-explanation">{contradiction.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {hasMissingChains && (
              <div className="finding-group">
                <h3 className="finding-group-title">Missing Records ({result.missing_chains.length})</h3>
                {result.missing_chains.map((chain, indexChain) => (
                  <div key={indexChain} className="finding-card finding-card-warning">
                    <div className="finding-header">
                      <span className="finding-type">{(chain.type || '').replace(/_/g, ' ')}</span>
                      <span
                        className={cn(
                          'severity-badge',
                          `severity-${(chain.severity || 'medium').toLowerCase()}`,
                        )}
                      >
                        {chain.severity}
                      </span>
                    </div>
                    <p className="finding-detail">
                      {chain.explanation || `Missing: ${chain.missing_nodes?.join(', ')}`}
                    </p>
                    {chain.amount_display && (
                      <p className="finding-amount">Amount at risk: {chain.amount_display}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {hasGhosts && (
              <div className="finding-group">
                <h3 className="finding-group-title">Entity Gaps ({result.ghost_entities.length})</h3>
                {result.ghost_entities.map((ghost, indexGhost) => (
                  <div key={indexGhost} className="finding-card finding-card-info">
                    <div className="finding-header">
                      <span className="finding-type">
                        {ghost.entity}
                        {ghost.role ? ` (${ghost.role})` : ''}
                      </span>
                      <span
                        className={cn(
                          'severity-badge',
                          `severity-${(ghost.severity || 'medium').toLowerCase()}`,
                        )}
                      >
                        {ghost.severity}
                      </span>
                    </div>
                    <p className="finding-detail">
                      Present in: {ghost.present_filenames?.join(', ') || ghost.present_in?.join(', ') || '-'}
                    </p>
                    <p className="finding-detail">
                      Absent from: {ghost.absent_filenames?.join(', ') || ghost.absent_from?.join(', ') || '-'}
                    </p>
                    {ghost.explanation && <p className="finding-explanation">{ghost.explanation}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
