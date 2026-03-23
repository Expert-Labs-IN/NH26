"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Clock, CheckCircle2, Search, ArrowUpRight, Tag, 
    Building2, Calendar, FileText, ChevronRight
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import Link from "next/link";

export default function MyTicketsPage() {
    const { data: session } = useSession();
    const userID = (session?.user as any)?.id;
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: ticketsResponse, isLoading } = useStrapi("tickets", {
        filters: {
            raisedBy: { id: userID },
        },
        sort: "createdAt:desc",
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
            transition: { staggerChildren: 0.1 },
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
        { label: "Total Tickets", count: tickets.length, color: "blue" },
        { label: "Resolved", count: tickets.filter((t: any) => (t.attributes || t).aiResolved).length, color: "emerald" },
        { label: "Pending", count: tickets.filter((t: any) => !(t.attributes || t).aiResolved).length, color: "orange" },
    ];

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-white rounded-full animate-spin shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 py-12 px-6 font-sans relative overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">Support Center</h1>
                        <p className="text-slate-400 text-lg">Manage your raised queries and track their resolution status.</p>
                    </motion.div>
                    
                    <Link 
                        href="/user/raise-tickit/create"
                        className="inline-flex items-center gap-2 bg-white text-black font-black px-8 py-4 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]"
                    >
                        Raise New Ticket
                        <ArrowUpRight className="w-5 h-5" />
                    </Link>
                </header>

                {/* Dashboard Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#111]/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl group hover:border-slate-700 transition-all shadow-xl"
                        >
                            <p className="text-xs font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className={`text-5xl font-black text-white group-hover:text-${stat.color}-400 transition-colors`}>{stat.count}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-[#111]/50 backdrop-blur-md p-3 rounded-2xl border border-slate-800">
                    <div className="flex bg-black/40 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
                        {["all", "pending", "resolved"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 md:flex-none md:px-8 py-2.5 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${
                                    activeTab === tab 
                                    ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                                    : "text-slate-500 hover:text-white"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    
                    <div className="relative w-full md:w-96 px-2">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Find a ticket..."
                            className="w-full bg-black/50 border border-slate-800/50 outline-none pl-12 pr-4 py-3.5 rounded-xl text-sm text-white focus:ring-1 ring-white/20 transition-all placeholder:text-slate-600"
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
                            className="grid xl:grid-cols-2 gap-8"
                        >
                            {filteredTickets.map((ticket: any) => {
                                const attr = ticket.attributes || ticket;
                                const isResolved = attr.aiResolved;
                                const department = attr.department?.data?.attributes?.title || attr.department?.title || "General";
                                const severity = attr.severity || "Low";
                                
                                return (
                                    <motion.div 
                                        key={ticket.id}
                                        variants={cardVariants}
                                        className="group bg-[#111]/80 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-8 hover:bg-[#151515] hover:border-slate-600 transition-all shadow-2xl relative overflow-hidden"
                                    >
                                        <div className={`absolute top-0 left-0 w-2 h-full bg-${isResolved ? "emerald" : "orange"}-500/30 group-hover:bg-${isResolved ? "emerald" : "orange"}-500 transition-all`} />
                                        
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-wrap gap-3">
                                                <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${
                                                    isResolved ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                                                }`}>
                                                    {isResolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                    {isResolved ? "Resolved" : "Pending"}
                                                </span>
                                                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-slate-900 text-slate-400 border border-slate-800 shadow-sm">
                                                    <Tag className="w-3.5 h-3.5" />
                                                    {attr.category || "General"}
                                                </span>
                                            </div>
                                            <span className={`text-[11px] font-black tracking-widest px-3 py-1.5 rounded-lg border shadow-sm ${
                                                severity === "High" ? "border-rose-500/30 bg-rose-500/5 text-rose-500" :
                                                severity === "Medium" ? "border-yellow-500/30 bg-yellow-500/5 text-yellow-500" :
                                                "border-emerald-500/30 bg-emerald-500/5 text-emerald-500"
                                            }`}>
                                                {severity} PRIORITY
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-black text-white mb-3 group-hover:text-blue-400 transition-colors leading-tight line-clamp-1">
                                            {attr.title}
                                        </h3>
                                        
                                        <p className="text-[15px] text-slate-400 line-clamp-2 mb-8 leading-relaxed h-[3em]">
                                            {attr.description || "No problem detail provided."}
                                        </p>

                                        <div className="flex items-center justify-between pt-8 border-t border-slate-800/50">
                                            <div className="flex gap-6">
                                                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors">
                                                    <Building2 className="w-4 h-4" />
                                                    {department}
                                                </div>
                                                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors">
                                                    <Calendar className="w-4 h-4" />
                                                    {attr.createdAt ? new Date(attr.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                                                </div>
                                            </div>
                                            <Link 
                                                href={`/user/my-tickets/ticket/details/${ticket.documentId || ticket.id}`}
                                                className="inline-flex items-center gap-2 text-xs font-black text-white hover:text-blue-400 hover:gap-3 transition-all uppercase tracking-widest"
                                            >
                                                Details
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#111]/50 border-2 border-slate-800/50 border-dashed rounded-[3rem] p-24 flex flex-col items-center text-center backdrop-blur-sm shadow-xl"
                        >
                            <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl">
                                <FileText className="w-12 h-12 text-slate-700" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-3">No active tickets</h3>
                            <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">
                                Everything is looking clear! If you encounter any issues, create a new ticket to get started.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
