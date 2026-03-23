import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { Badge } from '../components/ui/Badge';
import { Filter, Search, Settings, Star, Square, X, Loader2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Email {
  id: string;
  sender: { name: string; email: string };
  subject: string;
  snippet: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  intent: string;
}

interface ApiEmail {
  id: string;
  message_id: string;
  sender: string;
  sender_name: string;
  subject: string;
  snippet?: string;
  received_at: string;
  priority_label: string;
  suggested_actions: string[];
  is_read: boolean;
  is_starred?: boolean;
}

type BadgeIntent = 'urgent' | 'warning' | 'danger' | 'neutral';

// ─── Priority labels from API ─────────────────────────────────────────────────

const PRIORITY_LABELS = ['urgent', 'requires_action', 'fyi'] as const;
type PriorityLabel = typeof PRIORITY_LABELS[number];

const PRIORITY_DISPLAY: Record<PriorityLabel, string> = {
  urgent: 'Urgent',
  requires_action: 'Action Required',
  fyi: 'FYI',
};

// ─── Route → title map ────────────────────────────────────────────────────────

const ROUTE_TITLES: Record<string, string> = {
  '/starred': 'Starred',
  '/sent': 'Sent',
  '/archive': 'Archive',
  '/trash': 'Trash',
};

const BASE = 'http://localhost:8000';

// ─── Normalize API response ───────────────────────────────────────────────────

function normalize(e: ApiEmail): Email {
  return {
    id: e.id,
    sender: { name: e.sender_name, email: e.sender },
    subject: e.subject,
    snippet: e.snippet ?? '',
    date: new Date(e.received_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    isRead: e.is_read,
    isStarred: e.is_starred ?? false,
    intent: e.priority_label,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Inbox() {
  const navigate = useNavigate();
  const location = useLocation();

  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePriority, setActivePriority] = useState<PriorityLabel | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // ── Fetch with optional API-level filters ───────────────────────────────
  const fetchEmails = useCallback(async (priority?: PriorityLabel | null, unreadOnly?: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (priority) params.set('priority', priority);
      if (unreadOnly) params.set('is_read', 'false');
      const query = params.toString();
      const res = await fetch(`${BASE}/api/emails/${query ? `?${query}` : ''}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data: ApiEmail[] = await res.json();
      setEmails(data.map(normalize));
    } catch (err) {
      console.error('Failed to fetch emails:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever API-level filters change
  useEffect(() => {
    fetchEmails(activePriority, showUnreadOnly);
  }, [activePriority, showUnreadOnly, fetchEmails]);

  // ── Route-based filtering (client-side, no extra fetch) ─────────────────
  const routeTitle = ROUTE_TITLES[location.pathname];
  let title = routeTitle ?? 'Inbox';

  let routeFiltered: Email[] = emails;
  if (location.pathname === '/starred') {
    routeFiltered = emails.filter(e => e.isStarred);
  } else if (['/sent', '/archive', '/trash'].includes(location.pathname)) {
    routeFiltered = [];
  }

  // ── Client-side search across sender, subject, snippet ──────────────────
  const q = searchQuery.trim().toLowerCase();
  const visibleEmails = q
    ? routeFiltered.filter(
        e =>
          e.sender.name.toLowerCase().includes(q) ||
          e.sender.email.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          e.snippet.toLowerCase().includes(q),
      )
    : routeFiltered;

  const unreadCount = visibleEmails.filter(e => !e.isRead).length;

  const clearFilters = () => {
    setActivePriority(null);
    setShowUnreadOnly(false);
    setSearchQuery('');
  };

  const hasActiveFilters = activePriority !== null || showUnreadOnly || searchQuery.trim() !== '';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#060e20] px-10 py-10 overflow-y-auto custom-scrollbar">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="display-lg text-white">{title}</h1>
          {unreadCount > 0 && (
            <div className="bg-[#8083ff]/20 text-[#8083ff] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#8083ff]/10 uppercase tracking-widest">
              {unreadCount} NEW
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center bg-[#131b2e]/60 rounded-xl px-4 h-10 border border-default hover:border-bright transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 w-80 shadow-sm ease-premium">
            <Search size={14} className="text-[#908fa0] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by sender, subject..."
              className="bg-transparent border-none outline-none text-[13px] w-full text-white placeholder-[#464554] ml-3"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#464554] hover:text-[#908fa0] transition-colors ml-1 shrink-0">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all ease-premium ml-2 relative ${
              showFilters || activePriority || showUnreadOnly
                ? 'border-[#8083ff]/40 bg-[#8083ff]/10 text-[#8083ff]'
                : 'border-transparent hover:border-default hover:bg-[#131b2e] text-[#908fa0] hover:text-[#dae2fd]'
            }`}
          >
            <Filter size={18} />
            {(activePriority || showUnreadOnly) && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#8083ff]" />
            )}
          </button>

          <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-transparent hover:border-default hover:bg-[#131b2e] text-[#908fa0] hover:text-[#dae2fd] transition-all ease-premium">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      {showFilters && (
        <div className="flex items-center gap-2 mb-5 flex-wrap animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Priority filters */}
          <span className="text-[11px] text-[#464554] uppercase tracking-widest font-bold mr-1">Priority</span>
          {PRIORITY_LABELS.map(label => (
            <button
              key={label}
              onClick={() => setActivePriority(prev => prev === label ? null : label)}
              className={`h-8 px-3 rounded-lg text-xs font-medium border transition-all ${
                activePriority === label
                  ? 'bg-[#8083ff]/20 text-[#8083ff] border-[#8083ff]/30'
                  : 'bg-[#131b2e]/60 text-[#908fa0] border-white/5 hover:border-[#8083ff]/20 hover:text-[#dae2fd]'
              }`}
            >
              {PRIORITY_DISPLAY[label]}
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-5 bg-white/5 mx-1" />

          {/* Unread toggle */}
          <button
            onClick={() => setShowUnreadOnly(v => !v)}
            className={`h-8 px-3 rounded-lg text-xs font-medium border transition-all ${
              showUnreadOnly
                ? 'bg-[#8083ff]/20 text-[#8083ff] border-[#8083ff]/30'
                : 'bg-[#131b2e]/60 text-[#908fa0] border-white/5 hover:border-[#8083ff]/20 hover:text-[#dae2fd]'
            }`}
          >
            Unread only
          </button>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-8 px-3 rounded-lg text-xs font-medium border border-white/5 text-[#464554] hover:text-red-400 hover:border-red-400/20 transition-all ml-1 flex items-center gap-1.5"
            >
              <X size={12} /> Clear all
            </button>
          )}
        </div>
      )}

      {/* ── Active filter chips (always visible summary) ── */}
      {!showFilters && hasActiveFilters && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {activePriority && (
            <span className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-[#8083ff]/10 text-[#8083ff] text-xs border border-[#8083ff]/20">
              {PRIORITY_DISPLAY[activePriority]}
              <button onClick={() => setActivePriority(null)}><X size={11} /></button>
            </span>
          )}
          {showUnreadOnly && (
            <span className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-[#8083ff]/10 text-[#8083ff] text-xs border border-[#8083ff]/20">
              Unread only
              <button onClick={() => setShowUnreadOnly(false)}><X size={11} /></button>
            </span>
          )}
          {searchQuery.trim() && (
            <span className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-[#8083ff]/10 text-[#8083ff] text-xs border border-[#8083ff]/20">
              "{searchQuery.trim()}"
              <button onClick={() => setSearchQuery('')}><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {/* ── Email List ── */}
      <div className="bg-[#131b2e]/40 rounded-xl border border-[rgba(255,255,255,0.02)] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-[#908fa0] text-sm py-12">
            <Loader2 size={16} className="animate-spin" />
            Loading...
          </div>
        ) : visibleEmails.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[#c7c4d7] text-sm mb-1">
              {hasActiveFilters ? 'No emails match your filters.' : `No emails in ${title}.`}
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-[#8083ff] text-xs hover:underline mt-1">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          visibleEmails.map(email => (
            <div
              key={email.id}
              onClick={() => navigate(`/email/${email.id}`)}
              className={`flex items-center gap-4 py-3.5 px-6 border-b border-subtle cursor-pointer hover:bg-[#171f33]/80 hover:shadow-[inset_0_1px_rgba(255,255,255,0.02)] transition-all group last:border-0 relative ${
                !email.isRead ? 'bg-[#8083ff]/5' : ''
              }`}
            >
              {!email.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8083ff] opacity-80" />
              )}

              <div className="flex items-center gap-3 text-[#464554] flex-shrink-0">
                <Square size={16} className="hover:text-[#908fa0]" />
                <Star
                  size={16}
                  className={email.isStarred ? 'fill-[#ffb783] text-[#ffb783]' : 'hover:text-[#908fa0]'}
                />
              </div>

              <div className={`w-44 truncate flex-shrink-0 text-[13px] ${!email.isRead ? 'font-bold text-[#dae2fd]' : 'font-medium text-[#c7c4d7]'}`}>
                {email.sender.name}
              </div>

              <div className="flex-1 min-w-0 flex items-center gap-3 text-[13px] truncate">
                {email.intent && (
                  <Badge intent={email.intent as BadgeIntent} className="shrink-0 scale-90 origin-left">
                    {email.intent}
                  </Badge>
                )}
                <div className="truncate flex items-baseline gap-2 min-w-0">
                  <span className={`flex-shrink-0 ${!email.isRead ? 'font-bold text-[#dae2fd]' : 'font-medium text-[#c7c4d7]'}`}>
                    {highlight(email.subject, q)}
                  </span>
                  {email.snippet && (
                    <>
                      <span className="text-[#464554] shrink-0 text-xs">-</span>
                      <span className="text-[#908fa0] truncate group-hover:text-[#c7c4d7] transition-colors">
                        {email.snippet}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className={`w-20 text-right shrink-0 text-xs ${!email.isRead ? 'font-bold text-[#dae2fd]' : 'font-medium text-[#908fa0]'}`}>
                {email.date}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Highlight matching text ──────────────────────────────────────────────────

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#8083ff]/25 text-[#dae2fd] rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}