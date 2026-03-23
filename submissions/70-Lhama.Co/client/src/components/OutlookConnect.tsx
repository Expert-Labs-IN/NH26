import { useEffect } from 'react';
import { Mail, LogOut, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { triggerOutlookLogin, triggerGmailLogin } from '../api/auth';
import { useEmailStore } from '../stores/emailStore';
import { cn } from '../utils/helpers';

// ─── Single provider button ───────────────────────────────────────────────────

interface ProviderButtonProps {
  label: string;
  icon: string; // emoji or text
  color: string;
  connected: boolean;
  configured: boolean;
  email?: string;
  displayName?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

function ProviderButton({
  label, icon, color, connected, configured, displayName, email, onConnect, onDisconnect,
}: ProviderButtonProps) {
  if (!configured) return null;

  if (connected && email) {
    return (
      <div className="flex items-center gap-1.5">
        <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium', color)}>
          <span className="text-base leading-none" aria-hidden="true">{icon}</span>
          <span className="hidden md:inline truncate max-w-[110px]">
            {displayName ?? email}
          </span>
        </div>
        <button
          onClick={onDisconnect}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          aria-label={`Disconnect ${label}`}
          title={`Disconnect ${label}`}
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-sm"
      aria-label={`Connect ${label}`}
    >
      <span className="text-base leading-none" aria-hidden="true">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OutlookConnect() {
  const { status, isChecking, checkStatus, logoutOutlook, logoutGmail } = useAuthStore();
  const loadEmails = useEmailStore((s) => s.loadEmails);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleDisconnect = async (provider: 'outlook' | 'gmail') => {
    if (provider === 'gmail') await logoutGmail();
    else await logoutOutlook();
    await loadEmails();
  };

  if (isChecking) {
    return (
      <div className="flex items-center gap-1 text-slate-400 text-xs">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      </div>
    );
  }

  const neitherConfigured = !status.gmail.configured && !status.outlook.configured;
  if (neitherConfigured) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Gmail */}
      <ProviderButton
        label="Gmail"
        icon="📧"
        color="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
        configured={status.gmail.configured}
        connected={status.gmail.connected}
        email={status.gmail.email}
        displayName={status.gmail.displayName}
        onConnect={triggerGmailLogin}
        onDisconnect={() => handleDisconnect('gmail')}
      />

      {/* Outlook */}
      <ProviderButton
        label="Outlook"
        icon="📨"
        color="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
        configured={status.outlook.configured}
        connected={status.outlook.connected}
        email={status.outlook.email}
        displayName={status.outlook.displayName}
        onConnect={triggerOutlookLogin}
        onDisconnect={() => handleDisconnect('outlook')}
      />

      {/* Live indicator — show when either is connected */}
      {(status.gmail.connected || status.outlook.connected) && (
        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true" />
          <span className="hidden lg:inline">Live</span>
        </span>
      )}
    </div>
  );
}

