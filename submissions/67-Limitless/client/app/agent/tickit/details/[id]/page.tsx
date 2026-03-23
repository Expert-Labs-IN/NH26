"use client";

import { motion } from "framer-motion";
import { 
    Clock, CheckCircle2, AlertTriangle, ArrowLeft, 
    User, Building2, Tag, MessageSquare, Save, Loader2,
    Calendar, Mail, ShieldCheck, Activity, FileText
} from "lucide-react";
import { useState, useEffect, use } from "react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import { strapi } from "@/lib/sdk/sdk";
import Link from "next/link";

export default function AgentTicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: ticketId } = use(params);
    const [updating, setUpdating] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState("");

    const { data: fetchResponse, isLoading, mutate } = useStrapi(
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

    useEffect(() => {
        if (ticket) {
            const attr = ticket.attributes || ticket;
            setResolutionNotes(attr.agentResolutionDescription || "");
        }
    }, [ticket]);

    const handleUpdateTicket = async (isResolved = false) => {
        const docId = ticket?.documentId || ticketId;
        if (!docId) return;
        setUpdating(true);
        try {
            await strapi.update("tickets", docId, {
                agentResolutionDescription: resolutionNotes,
                aiResolved: isResolved || ticket?.aiResolved
            });
            mutate();
            alert("Ticket updated successfully!");
        } catch (error) {
            console.error("Error updating ticket:", error);
            alert("Failed to update ticket.");
        } finally {
            setUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Ticket Not Found</h1>
                <p className="text-slate-500 mb-8">The ticket you are looking for does not exist or has been removed.</p>
                <Link href="/agent/assined-tickits" className="px-8 py-3 bg-white text-black font-bold rounded-xl ">Back to Dashboard</Link>
            </div>
        );
    }

    const attr = ticket.attributes || ticket;
    const isResolved = attr.aiResolved;
    const chatHistory = attr.aiAgentChat || [];
    const raisedBy = attr.raisedBy?.data?.attributes?.username || attr.raisedBy?.username || "Guest User";
    const email = attr.raisedBy?.data?.attributes?.email || attr.raisedBy?.email || "No email provided";
    const department = attr.department?.data?.attributes?.title || attr.department?.title || "Support";

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 py-12 px-6 font-sans relative overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Navigation Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                        <Link 
                            href="/agent/assined-tickits" 
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Assigned Tickets
                        </Link>
                        <div className="flex flex-wrap items-center gap-4">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{attr.title}</h1>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current flex items-center gap-2 ${
                                isResolved ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                            }`}>
                                {isResolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                {isResolved ? "Resolved" : "Active"}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        {!isResolved && (
                            <button 
                                onClick={() => handleUpdateTicket(true)}
                                disabled={updating}
                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-emerald-500 text-black font-black px-8 py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50"
                            >
                                <ShieldCheck className="w-5 h-5" />
                                Resolve Ticket
                            </button>
                        )}
                        <button 
                            onClick={() => handleUpdateTicket(false)}
                            disabled={updating}
                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-[#111] border border-slate-800 text-white font-black px-8 py-4 rounded-xl hover:bg-[#151515] transition-all shadow-xl disabled:opacity-50"
                        >
                            {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save Notes
                        </button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Details & Chat */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary & Description */}
                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#111]/80 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl"
                        >
                            <div className="space-y-2">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Tag className="w-3.5 h-3.5" />
                                    Summary
                                </h3>
                                <p className="text-xl font-bold text-slate-100">{attr.summary || attr.title}</p>
                            </div>
                            
                            <hr className="border-slate-800/50" />
                            
                            <div className="space-y-3">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    Full Description
                                </h3>
                                <p className="text-slate-400 leading-relaxed text-lg">
                                    {attr.description || "No detailed description provided."}
                                </p>
                            </div>
                        </motion.section>

                        {/* AI Agent Chat Transcript */}
                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#111]/80 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl"
                        >
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" />
                                AI Agent Chat Transcript
                            </h3>
                            
                            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 no-scrollbar">
                                {chatHistory.length > 0 ? chatHistory.map((item: any, i: number) => (
                                    <div key={i} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-[1.5rem] p-5 shadow-lg ${
                                            item.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : 'bg-black/40 border border-slate-800 text-slate-200 rounded-bl-none'
                                        }`}>
                                            <p className="text-sm leading-relaxed">{item.content}</p>
                                            <p className="text-[10px] mt-2 opacity-40 font-bold uppercase tracking-widest">
                                                {item.role === 'user' ? raisedBy : 'AI Agent'}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 bg-black/20 rounded-2xl border border-dashed border-slate-800">
                                        <p className="text-slate-600 font-bold italic">No automated chat history available for this ticket.</p>
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    </div>

                    {/* Right Column: Sidebar info */}
                    <div className="space-y-8">
                        {/* Meta Info */}
                        <motion.aside 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#111]/80 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl"
                        >
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5" />
                                    Ticket Metadata
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className={`w-4 h-4 ${
                                                attr.severity === 'High' ? 'text-rose-500' :
                                                attr.severity === 'Medium' ? 'text-yellow-500' : 'text-emerald-500'
                                            }`} />
                                            <span className="text-xs font-bold text-slate-500">Severity</span>
                                        </div>
                                        <span className={`text-xs font-black uppercase text-${
                                            attr.severity === 'High' ? 'rose' :
                                            attr.severity === 'Medium' ? 'yellow' : 'emerald'
                                        }-500`}>
                                            {attr.severity}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-slate-800/50">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Building2 className="w-4 h-4 text-purple-400" />
                                            <span className="text-xs font-bold text-slate-500">Department</span>
                                        </div>
                                        <span className="text-xs font-black text-white">{department}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-slate-800/50">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Tag className="w-4 h-4 text-pink-400" />
                                            <span className="text-xs font-bold text-slate-500">Category</span>
                                        </div>
                                        <span className="text-xs font-black text-white">{attr.category || "General"}</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-800/50" />

                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" />
                                    Requester Info
                                </h3>
                                
                                <div className="space-y-3">
                                    <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center font-black text-lg">
                                            {raisedBy.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white leading-none mb-1">{raisedBy}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 justify-center">
                                        <Calendar className="w-3 h-3" />
                                        Created on {new Date(attr.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </motion.aside>

                        {/* Agent Workspace: Resolution Notes */}
                        <motion.aside 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#111]/80 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl"
                        >
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Resolution Workspace
                            </h3>
                            
                            <textarea
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="Enter resolution details or internal notes here..."
                                className="w-full bg-black/40 border border-slate-800 rounded-2xl p-5 text-sm outline-none focus:ring-1 ring-blue-500/50 transition-all placeholder:italic placeholder:text-slate-700 min-h-[150px] resize-none"
                            />
                            
                            <p className="text-[10px] text-slate-600 italic">
                                * These notes are stored with the ticket and used for internal auditing and client transparency.
                            </p>
                        </motion.aside>
                    </div>
                </div>
            </div>
        </div>
    );
}
