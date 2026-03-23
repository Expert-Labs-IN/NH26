"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Clock, CheckCircle2, AlertCircle, Search, 
    HandMetal, Tag, Building2, Calendar, FileText, ChevronRight,
    User, MoreVertical, CheckCircle, ShieldAlert, Sparkles,
    UserPlus
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import { strapi } from "@/lib/sdk/sdk";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AgentUnassignedTicketsPage() {
    const { data: session } = useSession();
    const agentID = (session?.user as any)?.id;
    const [searchQuery, setSearchQuery] = useState("");
    const [claimingTicketId, setClaimingTicketId] = useState<string | null>(null);

    const { data: ticketsResponse, isLoading, mutate } = useStrapi("tickets", {
        filters: {
            assignedTo: { id: { $null: true } },
        },
        populate: "*"
    });

    const tickets = ticketsResponse?.data || [];

    const filteredTickets = tickets.filter((ticket: any) => {
        const attr = ticket.attributes || ticket;
        const title = attr.title || "";
        return title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleClaim = async (ticket: any) => {
        if (!agentID) {
            toast.error("Authentication required to claim tickets.");
            return;
        }

        const docId = ticket.documentId || ticket.id;
        setClaimingTicketId(docId);

        try {
            await strapi.update("tickets", docId, {
                assignedTo: agentID
            });
            toast.success("Ticket claimed successfully! Check your Assigned Tickets.");
            mutate(); // Refresh the list
        } catch (error) {
            console.error("Error claiming ticket:", error);
            toast.error("Failed to claim ticket. It might already be assigned.");
        } finally {
            setClaimingTicketId(null);
        }
    };

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

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-white rounded-full animate-spin shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 py-16 px-6 font-sans relative overflow-x-hidden">
            {/* Ambient Background Aura */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-rose-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border border-rose-500/20">
                                Open Queue
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Unassigned Tickits</h1>
                        <p className="text-slate-400 text-lg max-w-2xl font-medium">Claim tickets from the public queue to assist users and manage your workload.</p>
                    </div>

                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search open tickets..."
                            className="w-full bg-[#111] border border-slate-800 outline-none pl-14 pr-6 py-4.5 rounded-[1.25rem] text-[13px] text-white focus:ring-1 ring-blue-500/30 transition-all font-medium placeholder:text-slate-700 shadow-2xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </header>

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
                                const raisedBy = attr.raisedBy?.data?.attributes?.username || attr.raisedBy?.username || "Guest";
                                const department = attr.department?.data?.attributes?.title || attr.department?.title || "General";
                                const docId = ticket.documentId || ticket.id;

                                return (
                                    <motion.div 
                                        key={ticket.id}
                                        variants={cardVariants}
                                        className="group bg-[#111]/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 hover:bg-[#151515] hover:border-slate-700 transition-all shadow-xl relative flex flex-col h-full overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/5 text-blue-400 border border-blue-500/10">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                New Issue
                                            </span>
                                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-700`}>
                                                {attr.severity}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-black text-white mb-4 leading-tight min-h-[56px] line-clamp-2">
                                            {attr.title}
                                        </h3>
                                        
                                        <p className="text-slate-500 text-sm mb-8 line-clamp-3 flex-grow font-medium leading-relaxed">
                                            {attr.description || "No description provided."}
                                        </p>

                                        <div className="grid grid-cols-2 gap-3 mb-8">
                                            <div className="bg-black/40 p-3 rounded-2xl border border-slate-800/50 flex flex-col gap-0.5">
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Requester</p>
                                                <span className="text-xs font-bold text-slate-300 truncate">{raisedBy}</span>
                                            </div>
                                            <div className="bg-black/40 p-3 rounded-2xl border border-slate-800/50 flex flex-col gap-0.5">
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Dept</p>
                                                <span className="text-xs font-bold text-slate-300 truncate">{department}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-6 border-t border-slate-800/60">
                                            <button 
                                                disabled={claimingTicketId === docId}
                                                onClick={() => handleClaim(ticket)}
                                                className="flex-1 flex items-center justify-center gap-2 text-[10px] font-black text-black bg-white hover:bg-slate-200 py-3.5 rounded-xl transition-all uppercase tracking-widest shadow-lg disabled:opacity-50"
                                            >
                                                {claimingTicketId === docId ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                                Claim
                                            </button>
                                            <Link 
                                                href={`/agent/tickit/details/${docId}`}
                                                className="px-5 py-3.5 rounded-xl bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700 shadow-lg"
                                            >
                                                View
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
                            className="bg-[#111]/50 border-2 border-slate-800 border-dashed rounded-[3rem] py-32 flex flex-col items-center text-center backdrop-blur-sm"
                        >
                            <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-10 shadow-2xl">
                                <HandMetal className="w-10 h-10 text-slate-700" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4">The Queue is Empty</h2>
                            <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed font-medium">
                                No unassigned tickets available right now. Great job team!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
