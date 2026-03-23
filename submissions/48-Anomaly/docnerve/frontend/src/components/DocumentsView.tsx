import { FileText } from "lucide-react";
import type { Document } from "../types";
import {
  cn,
  docTypeLabel,
  formatFieldLabel,
  formatSignalLabel,
  riskBadge,
  severityBadgeType,
  trustScoreColor,
} from "../lib/utils";
import { EmptyState } from "./shared/EmptyState";
import { SectionHeader } from "./shared/SectionHeader";
import { StatusBadge } from "./shared/StatusBadge";

interface Props {
  documents: Document[];
  selected: Document | null;
  onSelect: (doc: Document | null) => void;
}

export default function DocumentsView({
  documents,
  selected,
  onSelect,
}: Props) {
  return (
    <section className="rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm sm:p-8">
      <SectionHeader
        title="Documents"
        description="Review extracted fields, trust signals, and document-level metadata."
        icon={<FileText className="h-5 w-5 text-zinc-600" />}
        count={documents.length}
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3">
          {documents.map((document) => {
            const risk = riskBadge(document.risk_level);
            const isActive = selected?.id === document.id;

            return (
              <button
                key={document.id}
                type="button"
                onClick={() => onSelect(isActive ? null : document)}
                className={cn(
                  "w-full rounded-[24px] border p-4 text-left shadow-sm transition-colors",
                  isActive
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {document.filename}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {docTypeLabel(document.doc_type)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${trustScoreColor(document.trust_score)}`}
                    >
                      {document.trust_score}
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${risk.classes}`}
                    >
                      {risk.text}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-zinc-500">
                  {document.trust_signals.length} signal
                  {document.trust_signals.length === 1 ? "" : "s"} ·{" "}
                  {document.table_count} table
                  {document.table_count === 1 ? "" : "s"}
                </div>
              </button>
            );
          })}
        </div>

        {selected ? (
          <DocumentDetail doc={selected} />
        ) : (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="Select a document"
            description="Choose a document from the list to inspect its extracted fields and trust signals."
          />
        )}
      </div>
    </section>
  );
}

function DocumentDetail({ doc }: { doc: Document }) {
  const risk = riskBadge(doc.risk_level);
  const fields = Object.entries(doc.structured_fields || {}).filter(
    ([, value]) => {
      if (value === null || value === undefined || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    },
  );

  return (
    <div className="rounded-[28px] border border-zinc-200 bg-zinc-50/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
            Document Detail
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
            {doc.filename}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge type="neutral">
              {docTypeLabel(doc.doc_type)}
            </StatusBadge>
            <StatusBadge
              type={
                doc.risk_level === "HIGH_RISK"
                  ? "danger"
                  : doc.risk_level === "SUSPICIOUS"
                    ? "warning"
                    : "success"
              }
            >
              {risk.text}
            </StatusBadge>
            <StatusBadge type="info">{doc.mode}</StatusBadge>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-right">
          <p
            className={`text-3xl font-semibold ${trustScoreColor(doc.trust_score)}`}
          >
            {doc.trust_score}
          </p>
          <p className="text-xs text-zinc-500">trust score</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {doc.summary && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
                AI Summary
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-700">
                {doc.summary}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
              Extracted Fields
            </p>
            {fields.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">
                No structured fields were extracted for this document.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {fields.map(([key, value]) => (
                  <FieldRenderer key={key} field={key} value={value} />
                ))}
              </div>
            )}
          </div>

          {doc.full_text && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
                Extracted Text
              </p>
              <div className="mt-4 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600">
                {doc.full_text}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
              Metadata
            </p>
            <div className="mt-4 space-y-3 text-sm text-zinc-600">
              <MetaRow label="Mode" value={doc.mode} />
              <MetaRow label="Tables" value={String(doc.table_count)} />
              <MetaRow
                label="Scan quality"
                value={
                  doc.scan_quality_score
                    ? `${doc.scan_quality_score}/100`
                    : "N/A"
                }
              />
              <MetaRow
                label="Classification confidence"
                value={
                  typeof doc.classification_confidence === "number"
                    ? `${Math.round(doc.classification_confidence * 100)}%`
                    : "N/A"
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
              Risk Signals
            </p>
            {doc.trust_signals.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">
                No explicit trust penalties were recorded.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {doc.trust_signals.map((signal, index) => (
                  <div
                    key={`${doc.id}-${index}`}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        type={severityBadgeType(signal.severity || "MEDIUM")}
                      >
                        {signal.severity || "Signal"}
                      </StatusBadge>
                      <span className="text-sm font-medium text-zinc-900">
                        {formatSignalLabel(signal)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600">
                      {signal.detail}
                    </p>
                    {typeof signal.impact === "number" ? (
                      <p className="mt-2 text-xs text-zinc-500">
                        {signal.impact} point impact
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldRenderer({ field, value }: { field: string; value: unknown }) {
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    value[0] !== null
  ) {
    const rows = value as Array<Record<string, unknown>>;
    const columns = Array.from(
      new Set(rows.flatMap((row) => Object.keys(row))),
    );

    return (
      <div className="overflow-hidden rounded-2xl border border-zinc-200">
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
          {formatFieldLabel(field)}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="border-b border-zinc-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400"
                  >
                    {formatFieldLabel(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-zinc-100 last:border-b-0"
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="px-4 py-3 align-top text-zinc-700"
                    >
                      {String(row[column] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
        {formatFieldLabel(field)}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-700">
        {renderFieldValue(value)}
      </p>
    </div>
  );
}

function renderFieldValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-900">{value}</span>
    </div>
  );
}
