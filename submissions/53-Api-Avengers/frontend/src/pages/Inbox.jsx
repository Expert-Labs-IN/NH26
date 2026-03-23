import React, { useState, useEffect } from 'react';
import { Mail, Search, RefreshCw, AlertCircle, Clock, Zap, Send } from 'lucide-react';
import { emailService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import DraftReplyModal from '../components/DraftReplyModal';

const StatusBadge = ({ priority }) => {
  const colors = {
    'Urgent': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Action Required': 'bg-secondary/10 text-secondary border-secondary/20',
    'FYI': 'bg-white/5 text-white/30 border-white/5'
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colors[priority] || colors['FYI']} uppercase tracking-tighter formular-mono`}>
      {priority}
    </span>
  );
};

const EmailCard = ({ email, isSelected, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-4 cursor-pointer transition-all duration-300 border-l-2 ${
      isSelected 
        ? 'glass-card bg-white/10 border-secondary' 
        : 'hover:bg-white/5 border-transparent'
    }`}
  >
    <div className="flex justify-between items-start mb-1">
      <span className="text-xs font-semibold text-white/50 truncate max-w-[150px]">{email.sender}</span>
      <span className="text-[10px] text-white/30 formular-mono">
        {formatDistanceToNow(new Date(email.received_at), { addSuffix: true })}
      </span>
    </div>
    <h3 className={`text-sm mb-2 truncate ${email.triage ? 'text-white/80' : 'text-white font-medium'}`}>
      {email.subject}
    </h3>
    <div className="flex items-center gap-2">
      {email.triage?.priority && <StatusBadge priority={email.triage.priority} />}
      {!email.triage && <span className="text-[10px] bg-white/5 text-white/40 px-2 py-0.5 rounded-full uppercase tracking-tighter">New</span>}
    </div>
  </div>
);

const InboxPage = ({ filterTriagedOnly = false }) => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTriageLoading, setIsTriageLoading] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);

  const fetchEmails = async () => {
    try {
      const { data } = await emailService.fetchEmails();
      let emailList = data.emails;
      setIsGmailConnected(!!data.isGmailConnected);
      
      if (filterTriagedOnly) {
        emailList = emailList.filter(e => e.triage && e.triage.summary && e.triage.summary.length > 0);
      }
      
      setEmails(emailList);
      if (!selectedEmail && emailList.length > 0) {
        setSelectedEmail(emailList[0]);
      }
    } catch (err) {
      console.error("Failed to fetch emails", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriage = async () => {
    if (!selectedEmail) return;
    setIsTriageLoading(true);
    try {
      const { data } = await emailService.triageEmail(selectedEmail.id);
      setSelectedEmail(data.data);
      setEmails(prev => prev.map(e => e.id === selectedEmail.id ? data.data : e));
    } catch (err) {
      console.error("Triage failed", err);
    } finally {
      setIsTriageLoading(false);
    }
  };

  const handleReplySent = (updatedEmail) => {
    setSelectedEmail(updatedEmail);
    setEmails(prev => prev.map(e => e.id === updatedEmail.id ? updatedEmail : e));
  };

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 5000);
    return () => clearInterval(interval);
  }, [filterTriagedOnly]);

  return (
    <div className="glass-panel min-h-[calc(100vh-160px)] flex overflow-hidden">
      {/* Email List */}
      <div className="w-[400px] border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{filterTriagedOnly ? 'Pending Review' : 'Inbox'}</h2>
            <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full formular-mono">{emails.length}</span>
          </div>
          <button onClick={fetchEmails} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-secondary/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/[0.02]">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-white/20">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            emails.map(email => (
              <EmailCard 
                key={email.id} 
                email={email} 
                isSelected={selectedEmail?.id === email.id}
                onClick={() => setSelectedEmail(email)}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 flex flex-col bg-white/[0.01]">
        {selectedEmail ? (
          <>
            <div className="p-8 border-b border-white/5">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/40">from:</span>
                    <span className="text-sm font-medium text-secondary">{selectedEmail.sender}</span>
                  </div>
                </div>
                {(!selectedEmail.triage || !selectedEmail.triage.summary || selectedEmail.triage.summary.length === 0 || selectedEmail.triage.summary[0].includes('unavailable')) && (
                  <button 
                    onClick={handleTriage}
                    disabled={isTriageLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {isTriageLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Analyze with AI
                  </button>
                )}
              </div>

              {selectedEmail.triage && selectedEmail.triage.summary && selectedEmail.triage.summary.length > 0 && (
                <div className="grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="col-span-2 space-y-4">
                    <div className="glass-card p-6 bg-glow-cyan/5">
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-secondary" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-secondary">AI Summary</h4>
                      </div>
                      <ul className="space-y-3">
                        {selectedEmail.triage.summary.map((point, i) => (
                          <li key={i} className="text-sm text-white/80 flex items-start gap-3">
                            <span className="text-secondary mt-1.5">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="glass-card p-6 bg-white/5">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-4 h-4 text-white/40" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Priority</h4>
                      </div>
                      <StatusBadge priority={selectedEmail.triage.priority} />
                    </div>
                    <div className="glass-card p-6 bg-white/5">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-white/40" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Action</h4>
                      </div>
                      <div className="text-sm font-medium text-white/80 capitalize mb-3">
                        {selectedEmail.triage.suggestedAction?.type || 'No Action'}
                      </div>
                      {/* Review & Send Reply button */}
                      {selectedEmail.triage.suggestedAction?.type === 'reply' &&
                        selectedEmail.triage.draftReply?.status !== 'sent' && (
                        <button
                          onClick={() => setShowDraftModal(true)}
                          className="btn-primary flex items-center gap-2 w-full justify-center text-xs py-2"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Review &amp; Send Reply
                        </button>
                      )}
                      {selectedEmail.triage.draftReply?.status === 'sent' && (
                        <span className="text-xs text-green-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                          Reply sent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar text-white/70 leading-relaxed max-w-4xl">
              <div className="whitespace-pre-wrap text-sm">{selectedEmail.body}</div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/10 opacity-50">
            <Mail className="w-16 h-16 mb-4" strokeWidth={1} />
            <p className="text-lg">Select an email to read</p>
          </div>
        )}
      </div>

      {/* Draft Reply Modal */}
      {showDraftModal && selectedEmail && (
        <DraftReplyModal
          email={selectedEmail}
          isGmailConnected={isGmailConnected}
          onClose={() => setShowDraftModal(false)}
          onSent={handleReplySent}
        />
      )}
    </div>
  );
};

export default InboxPage;
