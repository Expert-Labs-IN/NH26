"use client";

import { motion } from "framer-motion";
import { 
    Clock, CheckCircle2, AlertTriangle, ArrowLeft, 
    Building2, Tag, MessageSquare, 
    Calendar, ShieldCheck, Activity, User, ChevronRight,
    LayoutDashboard
} from "lucide-react";
import { useState, use } from "react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import Link from "next/link";

export default function UserTicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: ticketId } = use(params);

    const { data: fetchResponse, isLoading } = useStrapi(
        "tickets",
        {
            filters: {
                $or: [
                    { documentId: { $eq: ticketId } },
                    { id: { $eq: ticketId } }
                ]
            },
            populate: "*"
        }
    );

    const ticket = fetchResponse?.data?.[0] as any;

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin shadow-[0_0_25px_rgba(59,130,246,0.15)]" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mb-6 drop-shadow-2xl" />
                <h1 className="text-3xl font-black mb-3">Tickit Not Found</h1>
                <p className="text-slate-500 mb-10 text-lg">We couldn't locate the ticket details you requested.</p>
                <Link href="/user/my-tickets" className="px-10 py-4 bg-white text-black font-black rounded-2xl shadow-2xl hover:scale-105 transition-all">Return to Tickets</Link>
            </div>
        );
    }

    const attr = ticket.attributes || ticket;
    const isResolved = attr.aiResolved;
    const chatHistory = attr.aiAgentChat || [];
    const department = attr.department?.data?.attributes?.title || attr.department?.title || "Support Team";
    const agentName = attr.assignedTo?.data?.attributes?.username || attr.assignedTo?.username || "Awaiting Assignment";

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 py-16 px-6 font-sans relative overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-blue-600/5 rounded-full blur-[180px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-indigo-600/5 rounded-full blur-[180px] pointer-events-none -z-10" />

            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header Navigation */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-5">
                        <Link 
                            href="/user/my-tickets" 
                            className="inline-flex items-center gap-2.5 text-slate-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                            Back to my Dashboard
                        </Link>
                        <div className="flex flex-wrap items-center gap-5">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{attr.title}</h1>
                            <span className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border shadow-2xl ${
                                isResolved ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-orange-500/10 border-orange-500/20 text-orange-500"
                            }`}>
                                {isResolved ? "Fully Resolved" : "Awaiting Action"}
                            </span>
                        </div>
                    </div>

                </header>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Summary Section */}
                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#111]/90 backdrop-blur-2xl border border-slate-800 p-10 rounded-[3rem] space-y-8 shadow-3xl"
                        >
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
                                    <Activity className="w-4 h-4" />
                                    Issue Overview
                                </h3>
                                <p className="text-2xl font-black text-slate-100 leading-tight">{attr.summary || attr.title}</p>
                            </div>
                            
                            <hr className="border-slate-800/60" />
                            
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Problem Statement
                                </h3>
                                <p className="text-slate-400 leading-relaxed text-lg font-medium">
                                    {attr.description || "The user did not provide additional context for this entry."}
                                </p>
                            </div>
                        </motion.section>

                        {/* AI Log Transcript */}
                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#111]/90 backdrop-blur-2xl border border-slate-800 p-10 rounded-[3rem] space-y-8 shadow-3xl"
                        >
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
                                <ShieldCheck className="w-4 h-4" />
                                Interactive AI Context
                            </h3>
                            
                            <div className="space-y-8 max-h-[450px] overflow-y-auto pr-6 no-scrollbar">
                                {chatHistory.length > 0 ? chatHistory.map((item: any, i: number) => (
                                    <div key={i} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-[2rem] p-7 shadow-2xl ${
                                            item.role === 'user' 
                                            ? 'bg-blue-600/90 text-white rounded-br-none' 
                                            : 'bg-black/50 border border-slate-800 text-slate-200 rounded-bl-none'
                                        }`}>
                                            <p className="text-sm leading-relaxed font-semibold">{item.content}</p>
                                            <p className="text-[10px] mt-3 font-black uppercase tracking-widest opacity-40">
                                                {item.role === 'user' ? 'Direct Entry' : 'Sarathi AI'}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-16 bg-black/30 rounded-[2.5rem] border border-dashed border-slate-800">
                                        <p className="text-slate-600 font-black italic tracking-wide">No automated transcripts detected for this ticket.</p>
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    </div>

                    {/* Meta Sidebar */}
                    <div className="space-y-10">
                        {/* Status Sidebar */}
                        <motion.aside 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#111]/90 backdrop-blur-2xl border border-slate-800 p-10 rounded-[3rem] space-y-10 shadow-3xl"
                        >
                            <div className="space-y-8">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
                                    <Tag className="w-4 h-4" />
                                    Tickit Configuration
                                </h3>
                                
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-slate-800/60 shadow-inner">
                                        <div className="flex items-center gap-3.5">
                                            <ShieldCheck className={`w-5 h-5 ${
                                                attr.severity === 'High' ? 'text-rose-500' :
                                                attr.severity === 'Medium' ? 'text-yellow-500' : 'text-emerald-500'
                                            }`} />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Priority</span>
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-widest text-${
                                            attr.severity === 'High' ? 'rose' :
                                            attr.severity === 'Medium' ? 'yellow' : 'emerald'
                                        }-500`}>
                                            {attr.severity}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-slate-800/60 shadow-inner">
                                        <div className="flex items-center gap-3.5 text-slate-400">
                                            <Building2 className="w-5 h-5 text-indigo-400" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Handler</span>
                                        </div>
                                        <span className="text-[11px] font-black text-white uppercase tracking-widest">{department}</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-800/60" />

                            <div className="space-y-8">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
                                    <User className="w-4 h-4" />
                                    Assigned Expert
                                </h3>
                                
                                <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-5 shadow-inner">
                                    <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl">
                                        {agentName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white leading-none mb-1.5">{agentName}</p>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5 leading-none">
                                            <ShieldCheck className="w-3 h-3 text-blue-500" />
                                            Verified Support
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-600 uppercase tracking-widest justify-center">
                                    <Calendar className="w-4 h-4" />
                                    Submitted {new Date(attr.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </motion.aside>

                        {/* Quick Nav back */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border border-blue-500/20 p-8 rounded-[2.5rem] flex flex-col items-center text-center gap-4"
                        >
                            <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em]">Have more questions?</p>
                            <Link 
                                href="/user/raise-tickit" 
                                className="group flex items-center gap-2 text-sm font-black text-white hover:text-white transition-all underline underline-offset-8 decoration-white/20 hover:decoration-white"
                            >
                                Contact Support Again
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
