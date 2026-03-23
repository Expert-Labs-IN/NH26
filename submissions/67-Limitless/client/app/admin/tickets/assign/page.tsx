"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Send, Users, Ticket, CheckCircle2, Search, 
    ArrowLeft, Loader2, Sparkles, Building2, UserPlus,
    Tag, MoreVertical, CheckCircle, ShieldAlert
} from "lucide-react";
import { useState } from "react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import { strapi } from "@/lib/sdk/sdk";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AdminAssignTicketsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [selectedAgents, setSelectedAgents] = useState<Record<string, string>>({});

    // Fetch unassigned tickets
    const { data: ticketsResponse, isLoading: loadingTickets, mutate: mutateTickets } = useStrapi("tickets", {
        filters: { assignedTo: { id: { $null: true } } },
        populate: "*"
    });

    // Fetch all agents
    const { data: usersResponse, isLoading: loadingUsers } = useStrapi("users");
    
    const tickets = ticketsResponse?.data || [];
    const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse as any)?.data || [];
    const agents = users.filter((u: any) => u.type === 'agent');

    const filteredTickets = tickets.filter((ticket: any) => {
        const attr = ticket.attributes || ticket;
        return attr.title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleAssign = async (ticketId: string, docId: string) => {
        const agentId = selectedAgents[ticketId];
        if (!agentId) {
            toast.error("Please select an expert to assign this ticket to.");
            return;
        }

        setAssigningId(ticketId);
        try {
            await strapi.update("tickets", docId, {
                assignedTo: agentId
            });
            toast.success("Ticket assigned successfully!");
            mutateTickets(); // Refresh the list
        } catch (error) {
            console.error("Error assigning ticket:", error);
            toast.error("Failed to assign ticket.");
        } finally {
            setAssigningId(null);
        }
    };

    if (loadingTickets || loadingUsers) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600/10 border-t-white rounded-full animate-spin shadow-3xl shadow-blue-500/10" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] py-16 px-6 relative overflow-x-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <Link 
                            href="/admin/dashboard" 
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.2 transition-transform" />
                            Return to Dashboard
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Manual Ticket Routing</h1>
                        <p className="text-slate-500 text-lg font-medium">Distribute unassigned support requests to internal experts.</p>
                    </div>

                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input 
                            type="text" 
                            placeholder="Find tickets by title..."
                            className="w-full bg-[#111] border border-slate-800 outline-none pl-14 pr-6 py-4.5 rounded-[1.5rem] text-[13px] text-white focus:ring-1 ring-blue-500/30 transition-all font-medium placeholder:text-slate-700 shadow-2xl shadow-black/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {filteredTickets.length > 0 ? (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            {filteredTickets.map((ticket: any) => {
                                const attr = ticket.attributes || ticket;
                                const docId = ticket.documentId || ticket.id;
                                
                                return (
                                    <motion.div 
                                        key={ticket.id}
                                        layout
                                        className="bg-[#111]/80 backdrop-blur-3xl border border-slate-800/80 p-8 rounded-[2.5rem] flex flex-col xl:flex-row xl:items-center justify-between gap-8 group hover:border-slate-700 transition-all shadow-xl"
                                    >
                                        <div className="space-y-4 max-w-xl">
                                            <div className="flex items-center gap-4">
                                                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-800 text-slate-500 border border-slate-700/80`}>
                                                    {attr.severity} Priority
                                                </span>
                                                <span className="text-[11px] font-black text-slate-600 flex items-center gap-1.5">
                                                    <Tag className="w-3.5 h-3.5" />
                                                    {attr.category || "General Support"}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors leading-tight">{attr.title}</h3>
                                            <p className="text-slate-500 text-sm line-clamp-1 font-medium">{attr.description || "No problem detail provided."}</p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 min-w-[320px]">
                                            <div className="relative flex-1">
                                                <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                                <select 
                                                    className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-12 pr-8 py-4 outline-none focus:ring-1 ring-blue-500/40 text-sm transition-all font-black uppercase tracking-widest appearance-none text-white shadow-inner"
                                                    value={selectedAgents[ticket.id] || ""}
                                                    onChange={(e) => setSelectedAgents({...selectedAgents, [ticket.id]: e.target.value})}
                                                >
                                                    <option value="" disabled className="bg-slate-900">Select Expert</option>
                                                    {agents.map((agent: any) => (
                                                        <option key={agent.id} value={agent.id} className="bg-slate-900">
                                                            {agent.username}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button 
                                                disabled={assigningId === ticket.id}
                                                onClick={() => handleAssign(ticket.id, docId)}
                                                className="bg-white text-black font-black px-8 py-4 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50"
                                            >
                                                {assigningId === ticket.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                                                Assign
                                            </button>
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
                            className="bg-[#111] border border-slate-800 border-dashed rounded-[3rem] py-32 flex flex-col items-center text-center shadow-inner"
                        >
                            <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-10">
                                <ShieldAlert className="w-10 h-10 text-slate-700" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4">No tickets require routing</h2>
                            <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed font-medium">
                                All current tickets have been effectively distributed to the expert team.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
