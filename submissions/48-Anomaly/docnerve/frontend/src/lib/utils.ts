import { clsx, type ClassValue } from 'clsx'
import type { RiskLevel, Severity, TrustSignal } from '../types'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

export function severityColor(severity: Severity | string): string {
  const map: Record<string, string> = {
    CRITICAL: 'border-red-200 bg-red-50/80 text-red-700',
    HIGH: 'border-amber-200 bg-amber-50/80 text-amber-700',
    MEDIUM: 'border-blue-200 bg-blue-50/80 text-blue-700',
    LOW: 'border-emerald-200 bg-emerald-50/80 text-emerald-700',
  }
  return map[severity] ?? 'border-zinc-200 bg-white text-zinc-700'
}

export function severityBadgeType(severity: Severity | string): 'danger' | 'warning' | 'info' | 'success' | 'neutral' {
  if (severity === 'CRITICAL') return 'danger'
  if (severity === 'HIGH') return 'warning'
  if (severity === 'MEDIUM') return 'info'
  if (severity === 'LOW') return 'success'
  return 'neutral'
}

export function riskBadge(risk: RiskLevel): { text: string; classes: string } {
  const map: Record<RiskLevel, { text: string; classes: string }> = {
    HIGH_RISK: { text: 'High Risk', classes: 'border-red-200 bg-red-50 text-red-700' },
    SUSPICIOUS: { text: 'Suspicious', classes: 'border-amber-200 bg-amber-50 text-amber-700' },
    CLEAN: { text: 'Clean', classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  }
  return map[risk] ?? { text: risk, classes: 'border-zinc-200 bg-zinc-50 text-zinc-700' }
}

export function docTypeLabel(type: string): string {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function formatFieldLabel(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatCurrency(value?: number | string | null): string {
  if (typeof value === 'string') {
    return value.trim() || 'Not available'
  }
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'Not available'
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value?: number | null, fractionDigits = 0): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'N/A'
  }
  return `${value.toFixed(fractionDigits)}%`
}

export function trustScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

export function formatSignalLabel(signal: TrustSignal): string {
  const raw = signal.type || signal.signal || 'SIGNAL'
  return raw.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

export function formatStepLabel(step?: string | null): string {
  const map: Record<string, string> = {
    initializing: 'Starting job',
    preprocessing: 'Preparing files',
    parsing_documents: 'Reading documents',
    parsing_complete: 'Text ready',
    classifying_documents: 'Identifying document types',
    classification_complete: 'Document types ready',
    extracting_fields: 'Extracting fields',
    extraction_complete: 'Fields ready',
    building_graph: 'Linking related records',
    graph_complete: 'Links ready',
    detecting_contradictions: 'Checking conflicts',
    contradictions_complete: 'Conflict check complete',
    detecting_missing_chains: 'Checking missing records',
    chains_complete: 'Missing record check complete',
    detecting_ghost_entities: 'Checking entity gaps',
    ghosts_complete: 'Entity gap check complete',
    scoring_trust: 'Scoring documents',
    scoring_complete: 'Scores ready',
    generating_reasoning: 'Preparing notes',
    reasoning_complete: 'Notes ready',
    generating_report: 'Preparing report',
    report_complete: 'Report ready',
    complete: 'Run complete',
    failed: 'Run failed',
  }
  return step ? map[step] || formatFieldLabel(step) : 'Starting job'
}

export function readableModelState(ready: boolean | null): string {
  if (ready === true) return 'Ready'
  if (ready === false) return 'Unavailable'
  return 'Unknown'
}
