"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Ticket, Search, Filter, ArrowLeft, 
    CheckCircle2, Clock, ShieldAlert,
    ExternalLink, Users, Calendar, Sparkles
} from "lucide-react";
import { useState } from "react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import Link from "next/link";

export default function AdminAllTicketsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // all, pending, resolved

    const { data: ticketsResponse, isLoading } = useStrapi("tickets", { 
        populate: "*",
        sort: ["createdAt:desc"]
    });

    const tickets = ticketsResponse?.data || [];

    const filteredTickets = tickets.filter((ticket: any) => {
        const attr = ticket.attributes || ticket;
        const matchesSearch = attr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            attr.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const isResolved = !!attr.aiResolved;
        const matchesStatus = filterStatus === "all" || 
                           (filterStatus === "resolved" && isResolved) || 
                           (filterStatus === "pending" && !isResolved);

        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/5 border-t-white rounded-full animate-spin shadow-3xl shadow-white/10" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 py-16 px-6 relative overflow-x-hidden">
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <Link 
                            href="/admin/dashboard" 
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.2 transition-transform" />
                            Global Repository
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">System Tickets</h1>
                        <p className="text-slate-500 text-lg font-medium">Audit and monitor every support request in the infrastructure.</p>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input 
                                type="text" 
                                placeholder="Audit logs by title..."
                                className="w-full bg-[#111] border border-slate-800 outline-none pl-14 pr-6 py-4.5 rounded-[1.5rem] text-[13px] text-white focus:ring-1 ring-blue-500/30 transition-all font-medium placeholder:text-slate-700 shadow-2xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-[#111] border border-slate-800 p-1.5 rounded-2xl gap-1">
                            {["all", "pending", "resolved"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        filterStatus === s ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="grid gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredTickets.map((ticket: any, i: number) => {
                            const attr = ticket.attributes || ticket;
                            const isResolved = !!attr.aiResolved;
                            const docId = ticket.documentId || ticket.id;

                            return (
                                <motion.div 
                                    key={ticket.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-[#111]/80 backdrop-blur-3xl border border-slate-800 hover:border-slate-700 transition-all rounded-[2rem] p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group shadow-xl"
                                >
                                    <div className="space-y-4 max-w-2xl">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-inner ${
                                                isResolved 
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                            }`}>
                                                {isResolved ? 'Resolved' : 'Escalated'}
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(attr.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-3 py-1 bg-black/40 rounded-lg border border-slate-800/50">
                                                {attr.severity} PRIO
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">{attr.title}</h3>
                                        <div className="flex flex-wrap gap-6 mt-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Users className="w-3.5 h-3.5 text-slate-600" />
                                                By: {attr.raisedBy?.data?.attributes?.username || attr.raisedBy?.username || "Anonymous"}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
                                                Agent: {attr.assignedTo?.data?.attributes?.username || attr.assignedTo?.username || "Awaiting Assignment"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Link 
                                            href={`/admin/tickets/details/${docId}`}
                                            className="px-8 py-4 bg-white/5 border border-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-300 hover:bg-white hover:text-black hover:border-white transition-all flex items-center gap-2"
                                        >
                                            Audit Details
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {filteredTickets.length === 0 && !isLoading && (
                        <div className="bg-[#111] border-2 border-slate-800 border-dashed rounded-[3rem] py-32 flex flex-col items-center text-center shadow-inner">
                            <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-10">
                                <Ticket className="w-10 h-10 text-slate-700" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4">No audit trails found</h2>
                            <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed font-medium font-sans">
                                We couldn&apos;t find any tickets matching your current search parameters.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
