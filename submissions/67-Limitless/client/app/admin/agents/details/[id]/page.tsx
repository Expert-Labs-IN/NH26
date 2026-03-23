"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, Users, Mail, Building2, 
    ShieldCheck, Calendar, Clock, Ticket,
    CheckCircle2, AlertTriangle, ExternalLink,
    MessageSquare, Send, BarChart3, User, Sparkles
} from "lucide-react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function AdminAgentDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    // Fetch Agent details
    const { data: agent, isLoading: loadingAgent } = useStrapi(`users/${id}`, { populate: "*" });
    
    // Fetch Agent's tickets
    const { data: ticketsResponse, isLoading: loadingTickets } = useStrapi("tickets", { 
        filters: { assignedTo: { id: { $eq: id } } },
        populate: "*",
        sort: ["createdAt:desc"]
    });

    const tickets = ticketsResponse?.data || [];
    const resolvedCount = tickets.filter((t: any) => (t.attributes || t).aiResolved).length;
    const pendingCount = tickets.length - resolvedCount;
    const successRate = tickets.length ? Math.round((resolvedCount / tickets.length) * 100) : 0;

    if (loadingAgent || loadingTickets) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/5 border-t-white rounded-full animate-spin shadow-3xl shadow-white/10" />
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mb-8 border border-rose-500/20 shadow-2xl">
                    <Users className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-white mb-4">Expert Node Offline</h1>
                <p className="text-slate-500 max-w-sm mb-10 text-lg font-medium">The requested expert identity is not indexed in the registry.</p>
                <Link href="/admin/dashboard" className="bg-white text-black font-bold px-10 py-4 rounded-2xl hover:bg-slate-200 transition-all shadow-3xl">Return to Dash</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-200 pb-32 px-6 font-sans relative">
            <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-blue-600/5 rounded-full blur-[180px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto pt-20 space-y-16">
                {/* Global Back Link */}
                <Link 
                    href="/admin/dashboard" 
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest group border border-slate-800/50 px-6 py-3 rounded-full bg-black/40 hover:bg-black/60 shadow-xl"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                    Administrative Panel
                </Link>

                {/* Profile Header Block */}
                <div className="bg-[#111] border border-slate-800/80 rounded-[4rem] p-12 lg:p-20 shadow-3xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-16">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] pointer-events-none" />
                    
                    <div className="relative group">
                        <div className="w-40 h-40 lg:w-48 lg:h-48 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[3rem] items-center justify-center flex text-6xl font-black text-white shadow-3xl relative z-10">
                            {(agent as any).username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -inset-4 bg-blue-500/10 rounded-[4rem] blur-2xl -z-10 group-hover:bg-blue-500/20 transition-all" />
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-[#0a0a0a] border border-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 z-20 shadow-2xl">
                            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                            Level 5 Expert
                        </div>
                    </div>

                    <div className="flex-1 text-center lg:text-left space-y-8">
                        <div>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-3">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full shadow-inner">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Active Authority
                                </span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-4 py-1.5 bg-black/40 border border-slate-800 rounded-full shadow-inner">
                                    <Calendar className="w-3.5 h-3.5" />
                                    ID: {(agent as any).id}
                                </span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none mb-4">{(agent as any).username}</h1>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 mt-6">
                                <div className="flex items-center gap-3 text-slate-400 font-medium text-lg">
                                    <Mail className="w-5 h-5 text-slate-600" />
                                    {(agent as any).email}
                                </div>
                                <div className="flex items-center gap-3 text-slate-400 font-medium text-lg">
                                    <Building2 className="w-5 h-5 text-slate-600" />
                                    {(agent as any).department?.title || "Standard Support"}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl">
                            <div className="p-6 bg-black/40 border border-slate-800/60 rounded-3xl text-center shadow-inner">
                                <p className="text-3xl font-black text-white mb-1">{tickets.length}</p>
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Load</p>
                            </div>
                            <div className="p-6 bg-black/40 border border-slate-800/60 rounded-3xl text-center shadow-inner">
                                <p className="text-3xl font-black text-emerald-500 mb-1">{resolvedCount}</p>
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Fixed</p>
                            </div>
                            <div className="p-6 bg-black/40 border border-slate-800/60 rounded-3xl text-center shadow-inner">
                                <p className="text-3xl font-black text-blue-500 mb-1">{successRate}%</p>
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Rate</p>
                            </div>
                            <div className="p-6 bg-black/40 border border-slate-800/60 rounded-3xl text-center shadow-inner">
                                <p className="text-3xl font-black text-orange-500 mb-1">{pendingCount}</p>
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Backlog</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tickets Breakdown Area */}
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Metrics Sidebar */}
                    <div className="space-y-10 order-2 lg:order-1">
                        <section className="bg-[#111] border border-slate-800 rounded-[3rem] p-10 space-y-10 shadow-3xl">
                            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-3">
                                <BarChart3 className="w-4 h-4 text-blue-500" />
                                Performance Audit
                            </h2>
                            <div className="space-y-10">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <span>Resolution Velocity</span>
                                        <span className="text-white">{successRate}% Total</span>
                                    </div>
                                    <div className="h-3 bg-black/60 rounded-full border border-slate-900 border-inner overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${successRate}%` }}
                                            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 shadow-lg"
                                        />
                                    </div>
                                </div>
                                <div className="p-6 bg-black/40 rounded-3xl border border-slate-800/50 space-y-4 shadow-inner">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-indigo-400" />
                                        <p className="font-bold text-white uppercase text-xs">Node Availability</p>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Agent is currently monitoring the platform from the central hub.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Assigned Tickets Main List */}
                    <div className="lg:col-span-2 space-y-10 order-1 lg:order-2">
                        <div className="flex items-center justify-between px-6">
                            <h2 className="text-3xl font-black text-white flex items-center gap-4">
                                <Ticket className="w-8 h-8 text-blue-500" />
                                Infrastructure Queue
                            </h2>
                            <span className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-2xl">
                                {tickets.length} Registered Nodes
                            </span>
                        </div>

                        <div className="grid gap-6">
                            <AnimatePresence mode="popLayout">
                                {tickets.length > 0 ? (
                                    tickets.map((ticket: any, i: number) => {
                                        const attr = ticket.attributes || ticket;
                                        const isResolved = !!attr.aiResolved;
                                        const docId = ticket.documentId || ticket.id;

                                        return (
                                            <motion.div
                                                key={ticket.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="bg-[#111]/80 backdrop-blur-2xl border border-slate-800/60 rounded-[2.5rem] p-8 hover:border-slate-700 transition-all group relative shadow-xl overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] pointer-events-none group-hover:bg-blue-500/10 transition-all" />
                                                
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                                    <div className="space-y-4 max-w-xl">
                                                        <div className="flex flex-wrap items-center gap-4">
                                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-inner ${
                                                                isResolved 
                                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                                : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                                            }`}>
                                                                {isResolved ? 'Stable' : 'In Progress'}
                                                            </div>
                                                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest px-3 py-1 bg-black/40 rounded-lg border border-slate-800/50">
                                                                {attr.severity} Impact
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                                                {new Date(attr.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
                                                            {attr.title}
                                                        </h3>
                                                    </div>

                                                    <Link 
                                                        href={`/admin/tickets/details/${docId}`}
                                                        className="px-8 py-4 bg-white/5 border border-slate-800/80 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-2"
                                                    >
                                                        Details
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div className="py-24 bg-[#111]/40 border-2 border-dashed border-slate-800 rounded-[3rem] text-center shadow-inner">
                                        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <Ticket className="w-8 h-8 text-slate-800" />
                                        </div>
                                        <p className="text-xl font-black text-slate-700 uppercase tracking-widest">Queue Vacuum</p>
                                        <p className="text-slate-600 font-medium mt-2">This expert has no assigned nodes in the system.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
