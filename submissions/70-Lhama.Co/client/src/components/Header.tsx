import { Zap, Moon, Sun, ClipboardList, LogOut } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useActionStore } from '../stores/actionStore';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../utils/helpers';
import ProcessAllButton from './ProcessAllButton';

export default function Header() {
  const { darkMode, toggleDarkMode, showAuditLog, toggleAuditLog, logout, loginMode } = useAppStore();
  const auditCount = useActionStore((s) => s.auditLog.length);
  const { logoutOutlook, logoutGmail } = useAuthStore();

  const handleLogout = async () => {
    if (loginMode === 'gmail') await logoutGmail().catch(() => {});
    if (loginMode === 'outlook') await logoutOutlook().catch(() => {});
    logout();
  };

  return (
    <header className="flex-shrink-0 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-3 shadow-sm z-10">
      {/* Logo */}
      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-200 flex-shrink-0">
        <Zap className="w-4 h-4 text-white" aria-hidden="true" />
      </div>

      {/* Brand */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          TriageAI
        </h1>
        <span className="hidden md:inline text-xs text-slate-400 dark:text-slate-500 font-medium border-l border-slate-200 dark:border-slate-700 pl-2">
          Agentic Email Assistant
        </span>
      </div>

      {/* Process All — centre */}
      <div className="hidden sm:flex ml-4">
        <ProcessAllButton />
      </div>

      {/* Right controls */}
      <div className="ml-auto flex items-center gap-2">

        {/* Guest badge */}
        {loginMode === 'guest' && (
          <span className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full font-medium">
            Demo Mode
          </span>
        )}

        {/* AI ready badge */}
        <span className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full font-medium">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true" />
          AI Ready
        </span>

        {/* Audit log toggle */}
        <button
          onClick={toggleAuditLog}
          className={cn(
            'relative flex items-center gap-1.5 p-2 rounded-lg transition-colors text-xs font-medium',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
            showAuditLog
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
          )}
          aria-pressed={showAuditLog}
          aria-label="Toggle audit log"
        >
          <ClipboardList className="w-4 h-4" aria-hidden="true" />
          {auditCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {auditCount > 9 ? '9+' : auditCount}
            </span>
          )}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-pressed={darkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Moon className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
