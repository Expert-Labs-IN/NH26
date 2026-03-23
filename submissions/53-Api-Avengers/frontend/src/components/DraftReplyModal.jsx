import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle, RefreshCw, Mail } from 'lucide-react';
import { emailService } from '../services/api';

const DraftReplyModal = ({ email, isGmailConnected, onClose, onSent }) => {
  const senderName = email.sender.replace(/<[^>]+>/, '').trim() || email.sender;
  const senderMatch = email.sender.match(/<(.+)>/);
  const toAddress = senderMatch ? senderMatch[1] : email.sender;
  const subject = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;
  const draftText = email.triage?.suggestedAction?.payload?.text || '';

  const [body, setBody] = useState(draftText);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSend = async () => {
    if (!body.trim()) return;
    setStatus('sending');
    try {
      const { data } = await emailService.sendReply(email.id, body);
      setStatus('success');
      setTimeout(() => {
        onSent(data.data);
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to send reply. Please try again.');
      setStatus('error');
    }
  };

  const handleDiscard = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl glass-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Review &amp; Send Reply</h2>
              <p className="text-[11px] text-white/30">AI-generated draft — review before sending</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gmail not connected warning */}
        {!isGmailConnected && (
          <div className="mx-6 mt-4 flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed">
              Gmail is not connected. Connect your Gmail account to send replies.
              The draft is still visible below for reference.
            </p>
          </div>
        )}

        {/* Meta fields */}
        <div className="px-6 pt-4 space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/30 w-14 shrink-0">To:</span>
            <span className="text-white/80 bg-white/5 px-3 py-1.5 rounded-lg text-sm flex-1 font-mono">
              {toAddress}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/30 w-14 shrink-0">Subject:</span>
            <span className="text-white/60 px-3 py-1.5 flex-1 text-sm">{subject}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 my-4 border-t border-white/5" />

        {/* Body editor */}
        <div className="px-6 pb-2">
          <label className="text-[10px] uppercase tracking-widest text-white/30 mb-2 block font-bold">
            Message Body
          </label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={8}
            disabled={status === 'sending' || status === 'success'}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/80 leading-relaxed resize-none focus:outline-none focus:border-secondary/50 transition-colors custom-scrollbar disabled:opacity-50"
            placeholder="Type your reply here..."
          />
          <p className="text-[10px] text-white/20 mt-1.5">
            ✨ AI-drafted · edit freely before sending
          </p>
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="mx-6 mb-2 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="mx-6 mb-2 flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            Reply sent successfully! Closing…
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={handleDiscard}
            disabled={status === 'sending' || status === 'success'}
            className="px-4 py-2 text-sm text-white/50 hover:text-white/80 hover:bg-white/5 rounded-xl transition-colors disabled:opacity-40"
          >
            Discard
          </button>
          <button
            onClick={handleSend}
            disabled={!body.trim() || !isGmailConnected || status === 'sending' || status === 'success'}
            className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === 'sending' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending…
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Sent!
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Reply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftReplyModal;
