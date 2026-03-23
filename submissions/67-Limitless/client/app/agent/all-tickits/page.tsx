"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Clock, CheckCircle2, AlertCircle, Search, 
    ArrowUpRight, Tag, Building2, Calendar, FileText, ChevronRight,
    User, MoreVertical, CheckCircle, Shield
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import { strapi } from "@/lib/sdk/sdk";
import Link from "next/link";

export default function AgentAllTicketsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: ticketsResponse, isLoading, mutate } = useStrapi("tickets", {
        populate: "*"
    });

    const tickets = ticketsResponse?.data || [];

    const filteredTickets = tickets.filter((ticket: any) => {
        const attr = ticket.attributes || ticket;
        const isResolved = attr.aiResolved;
        const matchesTab = activeTab === "all" || 
            (activeTab === "resolved" && isResolved) || 
            (activeTab === "pending" && !isResolved);
        
        const title = attr.title || "";
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesTab && matchesSearch;
    });

    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const cardVariants: any = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4, ease: "easeOut" },
        },
    };

    const stats = [
        { label: "Internal Total", count: tickets.length, color: "blue", icon: <Shield className="w-5 h-5" /> },
        { label: "Resolved", count: tickets.filter((t: any) => (t.attributes || t).aiResolved).length, color: "emerald", icon: <CheckCircle2 className="w-5 h-5" /> },
        { label: "Active Support", count: tickets.filter((t: any) => !(t.attributes || t).aiResolved).length, color: "orange", icon: <Clock className="w-5 h-5" /> },
    ];

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.2)]" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 py-12 px-6 font-sans relative">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-[150px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border border-blue-500/20 shadow-lg shadow-blue-500/5">
                                System Repository
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">Internal All Tickits</h1>
                        <p className="text-slate-400 text-lg">Full access to all system-wide support entries and escalations.</p>
                    </div>
                </header>

                {/* Dashboard Stats */}
                <div className="grid sm:grid-cols-3 gap-8">
                    {stats.map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#111] border border-slate-800/80 p-10 rounded-[2.5rem] relative overflow-hidden group hover:bg-[#151515] transition-all shadow-2xl"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 shadow-inner`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                            <p className="text-6xl font-black text-white">{stat.count}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Filters & Tabs */}
                <div className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-[#0e0e0e] p-3 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
                    <div className="flex p-1.5 bg-black/40 rounded-2xl w-full xl:w-auto overflow-x-auto">
                        {["all", "pending", "resolved"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 xl:flex-none xl:w-40 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab 
                                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                                    : "text-slate-500 hover:text-white"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    
                    <div className="relative w-full xl:w-[450px] px-2">
                        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input 
                            type="text" 
                            placeholder="Universal Search..."
                            className="w-full bg-black/40 border border-slate-800/50 outline-none pl-14 pr-6 py-4.5 rounded-2xl text-[13px] text-white focus:ring-1 ring-blue-500/50 placeholder:text-slate-700 transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Results Section */}
                <AnimatePresence mode="wait">
                    {filteredTickets.length > 0 ? (
                        <motion.div 
                            key="grid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0 }}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {filteredTickets.map((ticket: any) => {
                                const attr = ticket.attributes || ticket;
                                const isResolved = attr.aiResolved;
                                const raisedBy = attr.raisedBy?.data?.attributes?.username || attr.raisedBy?.username || "Guest User";
                                const assignedTo = attr.assignedTo?.data?.attributes?.username || attr.assignedTo?.username || "Unassigned";
                                const department = attr.department?.data?.attributes?.title || attr.department?.title || "Internal";
                                
                                return (
                                    <motion.div 
                                        key={ticket.id}
                                        variants={cardVariants}
                                        className="group bg-[#111] border border-slate-800/60 rounded-[2.5rem] p-8 hover:bg-[#151515] hover:border-slate-700 transition-all shadow-xl relative flex flex-col h-full overflow-hidden"
                                    >
                                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] pointer-events-none transition-opacity opacity-0 group-hover:opacity-10 ${
                                            isResolved ? "bg-emerald-500" : "bg-orange-500"
                                        }`} />

                                        <div className="flex justify-between items-start mb-6">
                                            <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                isResolved ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                                            }`}>
                                                {isResolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                {isResolved ? "Resolved" : "Active"}
                                            </span>
                                            <div className="flex gap-2">
                                                <span className="px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-700 shadow-sm">
                                                    {attr.severity}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-white mb-6 group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[56px] leading-tight">
                                            {attr.title}
                                        </h3>
                                        
                                        <div className="space-y-3 mb-8 flex-grow">
                                            <div className="bg-black/30 p-4 rounded-2xl border border-slate-800/50 flex flex-col gap-1">
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Raised By</p>
                                                <div className="flex items-center gap-2 text-white font-bold text-xs">
                                                    <User className="w-3.5 h-3.5 text-blue-500" />
                                                    {raisedBy}
                                                </div>
                                            </div>
                                            <div className="bg-black/30 p-4 rounded-2xl border border-slate-800/50 flex flex-col gap-1">
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Assigned To</p>
                                                <div className="flex items-center gap-2 text-white font-bold text-xs">
                                                    <Building2 className={`w-3.5 h-3.5 ${assignedTo === 'Unassigned' ? 'text-rose-500' : 'text-emerald-500'}`} />
                                                    {assignedTo}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-800/60">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {attr.createdAt ? new Date(attr.createdAt).toLocaleDateString() : "PENDING"}
                                            </div>
                                            <Link 
                                                href={`/agent/tickit/details/${ticket.documentId || ticket.id}`}
                                                className="flex items-center gap-2 text-[10px] font-black text-white bg-slate-800 hover:bg-white hover:text-black px-5 py-3 rounded-xl transition-all uppercase tracking-widest shadow-lg"
                                            >
                                                Inspect
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-[#111] border border-slate-800 border-dashed rounded-[3rem] py-32 flex flex-col items-center text-center shadow-inner mt-12"
                        >
                            <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-10 shadow-3xl">
                                <FileText className="w-10 h-10 text-slate-700" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4">Repository Empty</h3>
                            <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed font-medium">
                                No tickets found matching those parameters. The support queue is currently clear.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
