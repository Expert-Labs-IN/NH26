"use client";

import { motion } from "framer-motion";
import { 
    ArrowLeft, Ticket, ShieldAlert, CheckCircle2, 
    Clock, Users, Building2, MessageSquare, 
    Cpu, AlertTriangle, ExternalLink, Calendar,
    UserCircle, Sparkles, Send
} from "lucide-react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import { strapi } from "@/lib/sdk/sdk";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function AdminTicketDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();

    const { data: ticketResponse, isLoading, mutate } = useStrapi(`tickets/${id}`, { 
        populate: "*" 
    });

    const ticket = ticketResponse?.data || ticketResponse;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/5 border-t-white rounded-full animate-spin shadow-3xl shadow-white/10" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mb-8 border border-rose-500/20 shadow-2xl shadow-rose-500/10">
                    <ShieldAlert className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-white mb-4">Registry Fault</h1>
                <p className="text-slate-500 max-w-sm mb-10 text-lg">The specified ticket could not be located in the central database.</p>
                <Link href="/admin/tickets" className="bg-white text-black font-bold px-10 py-4 rounded-2xl hover:bg-slate-200 transition-all shadow-3xl">Return to Repository</Link>
            </div>
        );
    }

    const attr = (ticket as any).attributes || ticket;
    const isResolved = !!attr.aiResolved;
    const docId = (ticket as any).documentId || (ticket as any).id;

    const handleResolve = async () => {
        try {
            await strapi.update("tickets", docId, {
                aiResolved: true
            });
            toast.success("Ticket resolution acknowledged.");
            mutate();
        } catch (error) {
            toast.error("Failed to commit resolution.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-200 pb-20 px-6 font-sans relative">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none -z-10" />
            
            <div className="max-w-7xl mx-auto pt-16 space-y-12">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="space-y-6">
                        <Link 
                            href="/admin/tickets" 
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                            Global Repository Index
                        </Link>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-inner ${
                                    isResolved 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                }`}>
                                    {isResolved ? 'Confirmed Resolved' : 'Escalation Node: Active'}
                                </div>
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Logged: {new Date(attr.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">{attr.title}</h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {!isResolved && (
                            <button 
                                onClick={handleResolve}
                                className="bg-emerald-500 text-black font-black px-10 py-5 rounded-2xl hover:bg-emerald-400 transition-all flex items-center gap-3 shadow-3xl shadow-emerald-500/20 active:scale-95"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Close Audit
                            </button>
                        )}
                        <Link 
                            href="/admin/tickets/assign"
                            className="bg-[#111] text-white font-black px-10 py-5 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all flex items-center gap-3 active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                            Override Assignment
                        </Link>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Primary Content */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Audit Details */}
                        <section className="bg-[#111]/80 backdrop-blur-3xl border border-slate-800 rounded-[3.5rem] p-12 space-y-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] pointer-events-none" />
                            
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-6 h-6 text-blue-500" />
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Audit Overview</h2>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Infrastructure Incident Report</h3>
                                    <p className="text-slate-300 text-xl leading-relaxed font-medium">
                                        {attr.description || "The reporter failed to provide specific incident details."}
                                    </p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-10 pt-8 border-t border-slate-800/50">
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                                            Severity Impact
                                        </h3>
                                        <div className="p-6 bg-black/40 rounded-3xl border border-slate-800/50">
                                            <p className="text-2xl font-black text-white uppercase tracking-widest">
                                                {attr.severity}
                                            </p>
                                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">Classification Rank</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                                            Functional Area
                                        </h3>
                                        <div className="p-6 bg-black/40 rounded-3xl border border-slate-800/50">
                                            <p className="text-2xl font-black text-white uppercase tracking-widest">
                                                {attr.category || "General"}
                                            </p>
                                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">Audit Category</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Intelligence Data */}
                        <section className="bg-[#111]/40 border border-slate-800/50 rounded-[3.5rem] p-12 space-y-8 shadow-xl">
                            <div className="flex items-center gap-3">
                                <Cpu className="w-6 h-6 text-emerald-500" />
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Cortex Context</h2>
                            </div>
                            
                            <div className="p-8 bg-black/50 border border-slate-800/80 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <Sparkles className="w-6 h-6 text-emerald-400" />
                                </div>
                                <p className="text-slate-400 text-lg italic leading-relaxed font-sans">
                                    &quot;{attr.aiContext || "No artificial intelligence context was indexed for this node."}&quot;
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Metadata Sidebar */}
                    <div className="space-y-10">
                        {/* Network Entities */}
                        <section className="bg-[#111] border border-slate-800 rounded-[3rem] p-10 space-y-10 shadow-2xl">
                            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Network Entities</h2>
                            
                            <div className="space-y-8">
                                {/* Requester */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Incident Requester</p>
                                    <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-slate-800/50">
                                        <div className="w-12 h-12 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center font-black">
                                            {(attr.raisedBy?.data?.attributes?.username || attr.raisedBy?.username || "A")?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{attr.raisedBy?.data?.attributes?.username || attr.raisedBy?.username || "Anonymous Node"}</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">End-User Domain</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Expert Node */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Assigned Expert Node</p>
                                    <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-slate-800/50">
                                        <div className="w-12 h-12 bg-emerald-600/10 text-emerald-400 rounded-xl flex items-center justify-center font-black">
                                            {(attr.assignedTo?.data?.attributes?.username || attr.assignedTo?.username || "?")?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{attr.assignedTo?.data?.attributes?.username || attr.assignedTo?.username || "Awaiting Assignment"}</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Expert Infrastructure</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Hosting Department */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Routing Domain</p>
                                    <div className="flex items-center gap-5 p-4 bg-black/40 rounded-2xl border border-slate-800/50">
                                        <Building2 className="w-6 h-6 text-slate-600" />
                                        <div>
                                            <p className="font-bold text-white text-sm">{attr.department?.data?.attributes?.title || attr.department?.title || "Standard Support"}</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Assigned Sector</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* System Metadata */}
                        <section className="bg-black/40 border border-white/5 rounded-[3rem] p-10 space-y-6">
                            <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em] px-1">System Audit Logs</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-600">Object ID</span>
                                    <span className="text-slate-400 px-3 py-1 bg-white/5 rounded-lg border border-white/5">{ticket.id}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-600">Doc ID</span>
                                    <span className="text-slate-400 px-3 py-1 bg-white/5 rounded-lg border border-white/5">{docId}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-600">Intelligence Sync</span>
                                    <span className="text-emerald-500/80">Verified</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
