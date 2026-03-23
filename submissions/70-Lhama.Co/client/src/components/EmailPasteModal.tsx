import { useState, useId } from 'react';
import { X, Clipboard, Send, Plus, Mail } from 'lucide-react';
import type { Email } from '../types';
import { useEmailStore } from '../stores/emailStore';
import { cn } from '../utils/helpers';

interface EmailPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailPasteModal({ isOpen, onClose }: EmailPasteModalProps) {
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const { addEmail } = useEmailStore();
  const subjectId = useId();
  const fromId = useId();
  const bodyId = useId();

  const handleSubmit = () => {
    if (!body.trim()) {
      setError('Please paste the email body to analyse.');
      return;
    }
    setError('');

    const id = `paste_${Date.now()}`;
    const email: Email = {
      id,
      from: fromEmail.trim() || 'unknown@example.com',
      fromName: fromName.trim() || 'Unknown Sender',
      to: 'me@example.com',
      subject: subject.trim() || '(No subject)',
      body: body.trim(),
      timestamp: new Date().toISOString(),
      thread: [],
      isRead: false,
      priority: null,
    };

    addEmail(email);
    // Reset fields
    setFromName('');
    setFromEmail('');
    setSubject('');
    setBody('');
    onClose();
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setBody(text);
    } catch {
      setError('Unable to read clipboard. Please paste manually.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Analyse a new email"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Analyse New Email</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Paste an email to triage it with AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Sender fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={fromId} className="block text-xs font-medium text-slate-500 mb-1">
                Sender Name <span className="text-slate-300">(optional)</span>
              </label>
              <input
                id={fromId}
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="John Smith"
                className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Sender Email <span className="text-slate-300">(optional)</span>
              </label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-500"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor={subjectId} className="block text-xs font-medium text-slate-500 mb-1">
              Subject <span className="text-slate-300">(optional)</span>
            </label>
            <input
              id={subjectId}
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Re: Project update..."
              className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-500"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor={bodyId} className="block text-xs font-medium text-slate-500">
                Email Body <span className="text-red-400">*</span>
              </label>
              <button
                onClick={handlePasteFromClipboard}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1"
              >
                <Clipboard className="w-3 h-3" />
                Paste from clipboard
              </button>
            </div>
            <textarea
              id={bodyId}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste the email content here..."
              rows={7}
              className={cn(
                'w-full text-sm border rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-500 leading-relaxed',
                error
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-slate-200 dark:border-slate-600',
              )}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Analyse Email
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Trigger button ─────────────────────────────────────────────────────────────

export function EmailPasteModalTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      aria-label="Analyse a new email"
      title="Paste & analyse a new email"
    >
      <Plus className="w-3.5 h-3.5" />
    </button>
  );
}
