"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Filter, Clock, ArrowUpRight, CheckCircle2, AlertTriangle, Timer, MessageSquare, Loader2, Bot } from "lucide-react";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";

/**
 * MyTicketsModule
 * Live stream of user-attributed tickets from Supabase.
 */
export default function MyTicketsModule() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMyTickets = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
        } catch (err) {
            console.error("Ticket Sync Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyTickets();
        const channel = supabase.channel('portal-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
            fetchMyTickets(true);
        }).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [fetchMyTickets]);

    if (loading && tickets.length === 0) return (
        <div className="flex flex-col items-center justify-center p-20 glass-panel border-white/5">
            <Loader2 className="w-8 h-8 text-[#4F7CFF] animate-spin mb-4" />
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Synchronizing resolution stream...</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-black text-white tracking-tighter uppercase text-glow">My Tickets</h1>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-1 text-shadow">Real-time status of your workplace issues</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all group"
                        title="Refresh Stream"
                    >
                        <Timer className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                {tickets.length === 0 ? (
                    <div className="col-span-full p-20 text-center glass-panel border-dashed border-white/10">
                        <MessageSquare className="w-12 h-12 text-white/5 mx-auto mb-4" />
                        <h2 className="text-white/20 font-bold uppercase tracking-widest">No Active Tickets</h2>
                        <p className="text-white/10 text-xs mt-2">Issues raised via AI will appear here instantly.</p>
                    </div>
                ) : (
                    tickets.map(ticket => (
                        <div key={ticket.id} className="glass-panel p-6 border-white/5 bg-white/[0.01] hover:border-[#4F7CFF]/30 transition-all cursor-pointer group">
                            <div className="flex items-start justify-between mb-4">
                                <span className="text-[10px] font-mono text-white/20 bg-white/5 px-2 py-0.5 rounded">#{ticket.id}</span>
                                <div className={clsx(
                                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                                    ticket.status === 'Resolved' ? 'bg-[#4CAF9A]/10 text-[#4CAF9A] border-[#4CAF9A]/20' : 'bg-[#4F7CFF]/10 text-[#4F7CFF] border-[#4F7CFF]/20'
                                )}>
                                    {ticket.status}
                                </div>
                            </div>
                            <h3 className="font-bold text-white group-hover:text-[#4F7CFF] transition-colors mb-4">{ticket.title}</h3>

                            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/30">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-[#4F7CFF]/50" />
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </div>
                                {ticket.agent && (
                                    <div className="flex items-center gap-2">
                                        <Bot className="w-3 h-3 text-[#4CAF9A]" />
                                        {ticket.agent}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex gap-3">
                                    <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/5 text-[9px] text-white/40">
                                        {ticket.ai_summary?.includes('Category:') ? ticket.ai_summary.split(']')[0].replace('[Category: ', '') : 'General'}
                                    </span>
                                    <span className={clsx(
                                        "px-3 py-1 rounded-lg border text-[9px]",
                                        (ticket.priority === 'High' || ticket.priority === 'Critical') ? 'text-red-400 border-red-500/20 bg-red-500/5' : 'text-white/20 border-white/10'
                                    )}>{ticket.priority || 'Normal'} Priority</span>
                                </div>
                                <button className="flex items-center gap-2 text-[10px] font-black text-[#4F7CFF] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    Track Issue <ArrowUpRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
