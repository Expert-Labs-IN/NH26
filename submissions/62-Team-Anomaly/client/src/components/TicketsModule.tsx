"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search, Filter, MoreHorizontal, CheckCircle2, AlertTriangle, Clock, Paperclip, MessageSquare, ShieldAlert, Zap, ArrowUpRight, Copy, Ticket as TicketIcon, Loader2, AlertCircle, RefreshCw, Phone } from "lucide-react";
import type { Ticket, TicketStatus, TicketSeverity } from "@/types/ticket";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";

function SeverityBadge({ severity }: { severity: TicketSeverity }) {
    const styles = {
        Low: "bg-white/5 text-white/40 border-white/5",
        Medium: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        High: "bg-red-500/10 text-red-500 border-red-500/20",
        Critical: "bg-red-600/20 text-red-600 border-red-600/30 animate-pulse"
    };
    return <span className={clsx("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border", styles[severity])}>{severity}</span>;
}

function StatusPill({ status }: { status: TicketStatus }) {
    const styles = {
        Open: "bg-[#F4C430]/10 text-[#F4C430] border-[#F4C430]/20",
        "In Progress": "bg-[#4F7CFF]/10 text-[#4F7CFF] border-[#4F7CFF]/20",
        Resolved: "bg-[#4CAF9A]/10 text-[#4CAF9A] border-[#4CAF9A]/20",
        Escalated: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        Duplicate: "bg-white/5 text-white/20 border-white/5"
    };
    return <span className={clsx("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border", styles[status])}>{status}</span>;
}

export default function TicketsModule() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<TicketStatus | "All">("All");
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [draftText, setDraftText] = useState("");
    const [internalNotes, setInternalNotes] = useState("");
    const [actionLogs, setActionLogs] = useState<any[]>([]);

    // Action States
    const [isClaiming, setIsClaiming] = useState(false);
    const [isResolving, setIsResolving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    const fetchLogs = async (ticketId: number) => {
        const { data } = await supabase
            .from('action_logs')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: false });
        if (data) setActionLogs(data);
    };

    const fetchTickets = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);

        const { data, error: sbError } = await supabase
            .from('tickets')
            .select(`
                id, title, status, priority, agent, created_at, ai_summary, ai_decision, entities
            `)
            .order('created_at', { ascending: false });

        if (sbError) {
            setError("Failed to stream neuro-updates. Please check connection.");
            setLoading(false);
            return;
        }

        if (data) {
            const mapped: Ticket[] = data.map(t => ({
                id: `T-${t.id}`,
                title: t.title,
                description: t.ai_summary || "No description provided.",
                category: t.ai_summary?.includes('Category:') ? t.ai_summary.split(']')[0].replace('[Category: ', '') : 'General',
                department: t.ai_summary?.includes('Category:') ? t.ai_summary.split(']')[0].replace('[Category: ', '') : 'Operations',
                severity: (t.priority || 'Medium') as any,
                status: t.status as any,
                agent: t.agent || "Unassigned",
                createdAt: t.created_at,
                slaStatus: t.priority === 'Critical' ? 'Breached' : 'Healthy',
                isDuplicate: t.status === 'Duplicate',
                aiSummary: t.ai_summary,
                entities: t.entities || [],
                transcript: t.ai_summary ? [{ role: 'system', message: t.ai_summary, time: new Date(t.created_at).toLocaleTimeString() }] : []
            }));
            setTickets(mapped);

            // Selection Logic: using a state setter function to avoid stale closure or dependency issues
            setSelectedTicket(prev => {
                if (prev) {
                    const updated = mapped.find(tk => tk.id === prev.id);
                    return updated || prev;
                }
                return mapped.length > 0 && !silent ? mapped[0] : null;
            });
        }
        setLoading(false);
    }, []); // Removed selectedTicket dependency

    useEffect(() => {
        fetchTickets();

        // Realtime Subscription
        const channel = supabase
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
                fetchTickets(true);
            })
            .subscribe();

        // Polling Fallback (5s)
        const interval = setInterval(() => fetchTickets(true), 5000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [fetchTickets]); // Stable dependency

    useEffect(() => {
        if (selectedTicket) {
            const id = parseInt(selectedTicket.id.split('-')[1]);
            fetchLogs(id);
            setDraftText(selectedTicket.draftedReply || "Neural draft processing... Recommended action: Confirm issue with hardware nodes.");
            setInternalNotes(selectedTicket.internalNotes || "");
        }
    }, [selectedTicket]);

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleClaim = async () => {
        if (!selectedTicket || isClaiming) return;
        setIsClaiming(true);
        const id = parseInt(selectedTicket.id.split('-')[1]);

        const { error } = await supabase
            .from('tickets')
            .update({
                status: 'In Progress',
                agent: 'Alex Carter' // Aligning with the Admin UI persona
            })
            .eq('id', id);

        if (!error) {
            showSuccess("Ticket claimed successfully");
            // Log action if table exists, else skip
            try {
                await supabase.from('action_logs').insert({
                    ticket_id: id,
                    action_type: 'CLAIM',
                    details: 'Ticket claimed by Alex Carter'
                });
            } catch (e) { }
            fetchTickets(true);
        } else {
            setError("Resolution claim failed.");
        }
        setIsClaiming(false);
    };

    const handleResolve = async () => {
        if (!selectedTicket || isResolving) return;
        setIsResolving(true);
        const id = parseInt(selectedTicket.id.split('-')[1]);

        const { error } = await supabase
            .from('tickets')
            .update({
                status: 'Resolved',
                // Packing resolution notes into ai_decision since resolved_at/internal_notes missing
                ai_decision: `Resolved by Alex Carter. Note: ${internalNotes}`
            })
            .eq('id', id);

        if (!error) {
            showSuccess("Ticket resolved successfully");
            try {
                await supabase.from('action_logs').insert({
                    ticket_id: id,
                    action_type: 'STATUS_CHANGE',
                    details: 'Ticket marked as Resolved by Alex Carter'
                });
            } catch (e) { }
            fetchTickets(true);
        } else {
            setError("Resolution update failed.");
        }
        setIsResolving(false);
    };

    const handleApproveDraft = async () => {
        if (!selectedTicket) return;
        const id = parseInt(selectedTicket.id.split('-')[1]);

        const { data: conv } = await supabase.from('conversations').select('*').eq('ticket_id', id).single();
        if (conv) {
            const messages = [...(conv.messages || []), { role: 'agent', message: draftText, time: new Date().toLocaleTimeString() }];
            await supabase.from('conversations').update({ messages }).eq('id', conv.id);
        }

        await supabase.from('action_logs').insert({
            ticket_id: id,
            action_type: 'AI_REPLY_APPROVED',
            details: 'Agent approved and sent the AI drafted reply.'
        });

        showSuccess("Draft sent to neuro-portal");
        fetchTickets(true);
        fetchLogs(id);
    };

    const filteredTickets = filter === "All" ? tickets : tickets.filter(t => t.status === filter);

    return (
        <div className="flex h-[calc(100vh-120px)] gap-10">
            {/* Left: Ticket List */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
                <header className="flex items-center justify-between">
                    <div className="relative w-96 flex items-center">
                        <Search className="absolute left-4 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search resolution stream..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#F4C430]/30 transition-all font-sans"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.open('https://omnidim.io/agent/131022', '_blank')}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-white/40 text-[10px] font-black uppercase tracking-tighter hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20 transition-all font-sans"
                        >
                            <Phone className="w-3 h-3" /> Voice Config
                        </button>
                        {loading && <Loader2 className="w-4 h-4 text-[#F4C430] animate-spin" />}
                        {successMessage && <span className="text-[10px] font-black uppercase text-[#4CAF9A] animate-pulse">{successMessage}</span>}
                        <button onClick={() => fetchTickets()} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <RefreshCw className={clsx("w-4 h-4 text-white/20", loading && "animate-spin")} />
                        </button>
                    </div>
                </header>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {["All", "Open", "In Progress", "Resolved", "Escalated", "Duplicate"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border transition-all whitespace-nowrap",
                                filter === f
                                    ? "bg-[#F4C430] text-black border-[#F4C430] shadow-[0_0_15px_rgba(244,196,48,0.2)]"
                                    : "bg-white/[0.03] text-white/40 border-white/5 hover:text-white/60"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="glass-panel flex-1 flex flex-col min-h-0 bg-white/[0.01]">
                    {error && (
                        <div className="p-6 flex items-center gap-3 text-red-400 bg-red-400/10 border-b border-red-400/20">
                            <AlertCircle className="w-4 h-4" />
                            <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
                        </div>
                    )}

                    <div className="overflow-y-auto p-2 flex flex-col gap-2 flex-1 scrollbar-thin">
                        {loading && tickets.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-20">
                                <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                                <p className="text-sm font-black uppercase tracking-[0.2em]">Syncing Neural Stream...</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-20">
                                <TicketIcon className="w-12 h-12 mb-4" />
                                <p className="text-sm font-black uppercase tracking-[0.2em]">Neural Stream Empty</p>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-20">
                                <Filter className="w-12 h-12 mb-4" />
                                <p className="text-sm font-black uppercase tracking-[0.2em]">No tickets match filter</p>
                            </div>
                        ) : (
                            filteredTickets.map((t) => (
                                <div
                                    key={t.id}
                                    onClick={() => setSelectedTicket(t)}
                                    className={clsx(
                                        "group p-5 rounded-2xl transition-all cursor-pointer border flex flex-col gap-3 relative",
                                        selectedTicket?.id === t.id
                                            ? "bg-[#F4C430]/[0.03] border-[#F4C430]/20 shadow-lg"
                                            : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5"
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-mono text-white/20">{t.id}</span>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white leading-tight group-hover:text-[#F4C430] transition-colors">{t.title}</h4>
                                                {t.title?.includes('Voice AI') && (
                                                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Voice
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <StatusPill status={t.status} />
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Dep:</span>
                                            <span className="text-xs font-bold text-white/60">{t.department}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Sev:</span>
                                            <SeverityBadge severity={t.severity} />
                                        </div>
                                        <div className="flex items-center gap-2 ml-auto">
                                            <Clock className="w-3 h-3 text-white/20" />
                                            <span className="text-[10px] font-bold text-white/30">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    {t.isDuplicate && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 text-[8px] font-black uppercase text-[#F4C430]/60 tracking-wider">
                                            <Copy className="w-2 h-2" /> Duplicate
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Ticket Detail Side Panel */}
            {selectedTicket ? (
                <div className="w-[450px] flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="glass-panel flex-1 flex flex-col overflow-hidden bg-white/[0.02]">
                        <header className="p-6 border-b border-white/10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className={clsx("w-4 h-4", selectedTicket.slaStatus === 'Breached' ? 'text-red-500' : 'text-[#4CAF9A]')} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">SLA: {selectedTicket.slaStatus}</span>
                                </div>
                                <button className="text-white/20 hover:text-white transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                            <h2 className="text-xl font-heading font-black text-white">{selectedTicket.title}</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleClaim}
                                    disabled={isClaiming || selectedTicket.agent !== 'Unassigned'}
                                    className={clsx(
                                        "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-sans flex items-center justify-center gap-2",
                                        selectedTicket.agent !== 'Unassigned'
                                            ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                                            : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                                    )}
                                >
                                    {isClaiming ? <Loader2 className="w-3 h-3 animate-spin" /> : <TicketIcon className="w-3 h-3" />}
                                    {selectedTicket.agent !== 'Unassigned' ? selectedTicket.agent : 'Claim'}
                                </button>
                                <button className="flex-1 py-2 bg-[#4F7CFF] text-black rounded-xl text-[10px] font-black uppercase tracking-widest font-bold hover:bg-[#7aa0ff] transition-all font-sans">In Progress</button>
                                <button
                                    onClick={handleResolve}
                                    disabled={isResolving || selectedTicket.status === 'Resolved'}
                                    className={clsx(
                                        "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-sans flex items-center justify-center gap-2",
                                        selectedTicket.status === 'Resolved'
                                            ? "bg-[#4CAF9A]/10 text-[#4CAF9A]/40 border border-[#4CAF9A]/10 cursor-not-allowed"
                                            : "bg-[#4CAF9A]/20 border border-[#4CAF9A]/30 text-[#4CAF9A] hover:bg-[#4CAF9A]/30"
                                    )}
                                >
                                    {isResolving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                    Resolve
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 scrollbar-thin">
                            <section>
                                <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F4C430] mb-3">
                                    <Zap className="w-3 h-3" /> AI Context Engine
                                </h3>
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-4">
                                    <div>
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Generated Summary</p>
                                        <p className="text-xs text-white/80 leading-relaxed">{selectedTicket.aiSummary || "Processing neural summary..."}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Entities would come from AI analysis if table had them */}
                                        <span className="px-2 py-1 rounded-lg bg-black/40 border border-white/5 text-[9px] text-[#4F7CFF] font-bold">#AUTOTRIAGE</span>
                                        <span className="px-2 py-1 rounded-lg bg-black/40 border border-white/5 text-[9px] text-[#4F7CFF] font-bold">#{selectedTicket.category.toUpperCase()}</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 flex items-center justify-between">
                                    Case Transcript
                                    <MessageSquare className="w-3 h-3 opacity-30" />
                                </h3>
                                <div className="flex flex-col gap-4">
                                    {(selectedTicket.transcript || []).map((m: any, i: number) => (
                                        <div key={i} className={clsx("flex gap-3", m.role === 'user' ? 'flex-row' : 'flex-row-reverse')}>
                                            <div className={clsx("w-6 h-6 rounded-full shrink-0", m.role === 'user' ? 'bg-white/10' : 'bg-[#4F7CFF]/20 border border-[#4F7CFF]/30')} />
                                            <div className={clsx("p-3 rounded-2xl text-[11px] leading-relaxed relative", m.role === 'user' ? 'bg-white/5 text-white/70 rounded-tl-none' : 'bg-[#4F7CFF]/10 border border-[#4F7CFF]/10 text-white/90 rounded-tr-none')}>
                                                {m.message}
                                                <span className="absolute -bottom-4 right-0 text-[8px] font-bold text-white/10 uppercase">{m.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedTicket.transcript?.length === 0 && <p className="text-[10px] text-white/20 uppercase font-black text-center py-4">No transcript nodes found</p>}
                                    {selectedTicket.transcript && selectedTicket.transcript.length > 0 && selectedTicket.transcript[0].role === 'system' && (
                                        <div className="flex flex-row-reverse gap-3">
                                            <div className="w-6 h-6 rounded-full shrink-0 bg-[#4F7CFF]/20 border border-[#4F7CFF]/30 flex items-center justify-center">
                                                <Zap className="w-3 h-3 text-[#4F7CFF]" />
                                            </div>
                                            <div className="p-3 rounded-2xl text-[11px] leading-relaxed relative bg-[#4F7CFF]/10 border border-[#4F7CFF]/10 text-white/90 rounded-tr-none">
                                                {selectedTicket.transcript[0].message}
                                                <span className="absolute -bottom-4 right-0 text-[8px] font-bold text-white/10 uppercase">Voice AI Digest</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4F7CFF] mb-4 flex items-center justify-between">
                                    Agent Internal Notes
                                    <Paperclip className="w-3 h-3 opacity-30" />
                                </h3>
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <textarea
                                        value={internalNotes}
                                        onChange={(e) => setInternalNotes(e.target.value)}
                                        className="bg-transparent text-[11px] text-white/80 border-none focus:ring-0 p-0 leading-relaxed min-h-[60px] w-full resize-none outline-none font-sans"
                                        placeholder="Add notes for yourself or other agents..."
                                    />
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4CAF9A] mb-4 flex items-center justify-between">
                                    Neural Draft Action
                                    <Zap className="w-3 h-3 opacity-30" />
                                </h3>
                                <div className="p-4 rounded-2xl bg-[#F4C430]/[0.05] border border-[#F4C430]/10 flex flex-col gap-3">
                                    <textarea
                                        value={draftText}
                                        onChange={(e) => setDraftText(e.target.value)}
                                        className="bg-transparent text-[11px] text-white/80 border-none focus:ring-0 p-0 leading-relaxed min-h-[80px] w-full resize-none outline-none font-sans"
                                        placeholder="Customize AI draft here..."
                                    />
                                    <div className="h-px bg-white/5 w-full" />
                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Neural engine has scoped this as a Level 1 Resolution Step</p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 flex items-center justify-between">
                                    Activity Log
                                    <Clock className="w-3 h-3 opacity-30" />
                                </h3>
                                <div className="flex flex-col gap-4 border-l border-white/5 ml-2 pl-6">
                                    {actionLogs.length === 0 && <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">No activities recorded</p>}
                                    {actionLogs.map((log: any, i: number) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[29px] top-1 w-2 h-2 rounded-full bg-white/20 border border-black" />
                                            <p className="text-[10px] font-bold text-white/70 leading-tight">{log.details}</p>
                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">
                                                {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <footer className="p-5 bg-black/40 border-t border-white/5">
                            <button
                                onClick={handleApproveDraft}
                                className="w-full py-3 bg-[#F4C430] text-black font-black uppercase tracking-widest text-[11px] rounded-2xl flex items-center justify-center gap-2 group transition-all hover:bg-[#ffe3a1] active:scale-[0.98]"
                            >
                                Approve & Send Neural Draft <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </footer>
                    </div>
                </div>
            ) : (
                <div className="w-[450px] glass-panel flex flex-col items-center justify-center text-center p-12 opacity-20">
                    <TicketIcon className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/40">Select a node from the neural stream</p>
                </div>
            )}
        </div>
    );
}
