import { useState, useEffect } from 'react';
import Header from './components/Header';
import InboxSidebar from './components/InboxSidebar';
import MainContent from './components/MainContent';
import Toast from './components/Toast';
import LoginPage from './components/LoginPage';
import EmailPasteModal from './components/EmailPasteModal';
import { useAppStore } from './stores/appStore';
import { useAuthStore } from './stores/authStore';
import { useEmailStore } from './stores/emailStore';

export default function App() {
  const [toast, setToast] = useState<string | null>(null);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const darkMode = useAppStore((s) => s.darkMode);
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const setLoggedIn = useAppStore((s) => s.setLoggedIn);
  const { checkStatus } = useAuthStore();
  const { loadEmails } = useEmailStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const gmailConnected = params.get('gmail_connected');
    const gmailUser = params.get('gmail_user');
    const gmailError = params.get('gmail_error');

    const outlookConnected = params.get('outlook_connected');
    const outlookUser = params.get('user');
    const outlookError = params.get('outlook_error');

    if (gmailConnected === 'true') {
      window.history.replaceState({}, '', window.location.pathname);
      checkStatus().then(() => loadEmails());
      setLoggedIn('gmail');
      setToast(`✓ Connected to Gmail${gmailUser ? ` — ${decodeURIComponent(gmailUser)}` : ''}`);
    } else if (gmailError) {
      window.history.replaceState({}, '', window.location.pathname);
      setToast(`⚠️ Gmail connection failed: ${decodeURIComponent(gmailError)}`);
    } else if (outlookConnected === 'true') {
      window.history.replaceState({}, '', window.location.pathname);
      checkStatus().then(() => loadEmails());
      setLoggedIn('outlook');
      setToast(`✓ Connected to Outlook${outlookUser ? ` — ${decodeURIComponent(outlookUser)}` : ''}`);
    } else if (outlookError) {
      window.history.replaceState({}, '', window.location.pathname);
      setToast(`⚠️ Outlook connection failed: ${decodeURIComponent(outlookError)}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGuestAccess = () => {
    setLoggedIn('guest');
    loadEmails();
  };

  // ── Show login page when not yet authenticated ──────────────────────────
  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onGuestAccess={handleGuestAccess} />
        <Toast message={toast} onDismiss={() => setToast(null)} />
      </>
    );
  }

  // ── Main app ────────────────────────────────────────────────────────────
  return (
    <div
      className={`h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 min-w-[900px] ${darkMode ? 'dark' : ''}`}
    >
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[280px] flex-shrink-0 overflow-hidden flex flex-col">
          <InboxSidebar onOpenPasteModal={() => setIsPasteModalOpen(true)} />
        </div>
        <MainContent onToast={setToast} />
      </div>
      <Toast message={toast} onDismiss={() => setToast(null)} />

      {/* Feature 8: Email Paste & Analyse Modal */}
      <EmailPasteModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
      />
    </div>
  );
}
