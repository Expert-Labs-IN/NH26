"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Clock, CheckCircle2, AlertCircle, Search, 
    ArrowUpRight, Tag, Building2, Calendar, FileText, ChevronRight,
    User, MoreVertical, CheckCircle
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import { strapi } from "@/lib/sdk/sdk";
import Link from "next/link";

export default function AgentAssignedTicketsPage() {
    const { data: session } = useSession();
    const agentID = (session?.user as any)?.id;
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingTicket, setUpdatingTicket] = useState<string | null>(null);

    const { data: ticketsResponse, isLoading, mutate } = useStrapi("tickets", {
        filters: {
            assignedTo: { id: agentID },
        },
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

    const handleResolve = async (ticketId: string) => {
        setUpdatingTicket(ticketId);
        try {
            await strapi.update("tickets", ticketId, {
                aiResolved: true
            });
            mutate(); // Re-fetch the data
        } catch (error) {
            console.error("Error resolving ticket:", error);
            alert("Failed to resolve ticket. Please try again.");
        } finally {
            setUpdatingTicket(null);
        }
    };

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
        { label: "Assigned", count: tickets.length, color: "blue", icon: <FileText className="w-5 h-5" /> },
        { label: "Resolved", count: tickets.filter((t: any) => (t.attributes || t).aiResolved).length, color: "emerald", icon: <CheckCircle2 className="w-5 h-5" /> },
        { label: "Pending Issues", count: tickets.filter((t: any) => !(t.attributes || t).aiResolved).length, color: "orange", icon: <Clock className="w-5 h-5" /> },
    ];

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 py-12 px-6 font-sans relative">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-blue-500/20">
                                Agent Dashboard
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Assigned Tickits</h1>
                        <p className="text-slate-400">Resolve client queries and manage your ticket workload efficiently.</p>
                    </div>
                </header>

                {/* Dashboard Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#111] border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden group hover:border-slate-700 transition-all shadow-2xl"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-5xl font-black text-white mt-1">{stat.count}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Filters & Tabs */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-[#111] p-2 rounded-2xl border border-slate-800 backdrop-blur-md">
                    <div className="flex p-1 bg-black/40 rounded-xl w-full md:w-auto">
                        {["all", "pending", "resolved"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 md:flex-none md:w-32 py-2.5 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${
                                    activeTab === tab 
                                    ? "bg-white text-black shadow-lg" 
                                    : "text-slate-500 hover:text-white"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    
                    <div className="relative w-full md:w-80 px-2">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Filter by title..."
                            className="w-full bg-black/40 border-none outline-none pl-12 pr-4 py-3.5 rounded-xl text-sm text-white focus:ring-1 ring-white/10 placeholder:text-slate-600"
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
                                const raisedBy = attr.raisedBy?.data?.attributes?.username || attr.raisedBy?.username || "Guest User";
                                const department = attr.department?.data?.attributes?.title || attr.department?.title || "Support";
                                
                                return (
                                    <motion.div 
                                        key={ticket.id}
                                        variants={cardVariants}
                                        className="group bg-[#111] border border-slate-800/80 rounded-[2.5rem] p-8 hover:bg-[#151515] hover:border-slate-700 transition-all shadow-xl relative overflow-hidden"
                                    >
                                        <div className={`absolute top-0 left-0 w-2 h-full bg-${isResolved ? "emerald" : "orange"}-500/40`} />
                                        
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex gap-3">
                                                <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${
                                                    isResolved ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                                                }`}>
                                                    {isResolved ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                    {isResolved ? "Resolved" : "Active"}
                                                </span>
                                                <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-slate-700 bg-slate-800/50 text-slate-400`}>
                                                    {attr.severity} Priority
                                                </span>
                                            </div>
                                            
                                            {!isResolved && (
                                                <button 
                                                    disabled={updatingTicket === ticket.id}
                                                    onClick={() => handleResolve(ticket.id)}
                                                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-50"
                                                    title="Mark as Resolved"
                                                >
                                                    {updatingTicket === ticket.id ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                                </button>
                                            )}
                                        </div>

                                        <h3 className="text-2xl font-black text-white mb-4 group-hover:text-blue-400 transition-colors line-clamp-1">
                                            {attr.title}
                                        </h3>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-black/30 p-4 rounded-2xl border border-slate-800/50">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Raised By</p>
                                                <div className="flex items-center gap-2 text-white font-bold text-sm">
                                                    <User className="w-3 h-3 text-blue-400" />
                                                    {raisedBy}
                                                </div>
                                            </div>
                                            <div className="bg-black/30 p-4 rounded-2xl border border-slate-800/50">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</p>
                                                <div className="flex items-center gap-2 text-white font-bold text-sm">
                                                    <Building2 className="w-3 h-3 text-purple-400" />
                                                    {department}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-800/60">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <Calendar className="w-4 h-4" />
                                                {attr.createdAt ? new Date(attr.createdAt).toLocaleDateString() : "Pending"}
                                            </div>
                                            <Link 
                                                href={`/agent/tickit/details/${ticket.documentId || ticket.id}`}
                                                className="flex items-center gap-2 text-xs font-black text-white bg-slate-800 hover:bg-white hover:text-black px-6 py-2.5 rounded-full transition-all uppercase tracking-widest"
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-[#111] border-2 border-slate-800/50 border-dashed rounded-[3rem] p-24 flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl">
                                <FileText className="w-12 h-12 text-slate-700" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-3">No tasks found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">
                                You don't have any tickets assigned that match your current filter. Enjoy the quiet!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
