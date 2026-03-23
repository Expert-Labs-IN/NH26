import { MousePointerClick } from 'lucide-react';
import { useSelectedEmail } from '../stores/emailStore';
import { useAppStore } from '../stores/appStore';
import EmailDetail from './EmailDetail';
import TriagePanel from './TriagePanel';
import AuditLog from './AuditLog';

interface MainContentProps {
  onToast: (msg: string) => void;
}

export default function MainContent({ onToast }: MainContentProps) {
  const selectedEmail = useSelectedEmail();
  const showAuditLog = useAppStore((s) => s.showAuditLog);

  if (!selectedEmail) {
    return (
      <main className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-800/30" role="main">
        <div className="flex flex-col items-center gap-3 text-center max-w-xs px-4">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <MousePointerClick className="w-7 h-7 text-slate-300 dark:text-slate-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Select an email to begin
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              The AI will automatically triage it and suggest actions
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex overflow-hidden" role="main">
      {/* Email body — scrollable */}
      <div className="flex-1 overflow-y-auto min-w-0 border-r border-slate-100 dark:border-slate-700">
        <EmailDetail email={selectedEmail} />
      </div>

      {/* Triage panel — fixed 360px */}
      <aside
        className="w-[360px] flex-shrink-0 overflow-y-auto bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-slate-700"
        aria-label="AI triage panel"
      >
        <TriagePanel email={selectedEmail} onToast={onToast} />
      </aside>

      {/* Audit log — collapsible 260px panel */}
      {showAuditLog && (
        <div className="w-[260px] flex-shrink-0 overflow-hidden animate-slide-up">
          <AuditLog />
        </div>
      )}
    </main>
  );
}
