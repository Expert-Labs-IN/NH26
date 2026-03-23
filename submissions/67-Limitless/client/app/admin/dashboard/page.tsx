"use client";

import { motion } from "framer-motion";
import { 
    Users, Ticket, CheckCircle2, Clock, 
    ArrowUpRight, UserPlus, Send, ShieldCheck,
    BarChart3, Settings, Search, Building2
} from "lucide-react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import Link from "next/link";

export default function AdminDashboardPage() {
    // Fetch all users (we'll filter agents)
    const { data: usersResponse, isLoading: loadingUsers } = useStrapi("users");
    // Fetch all tickets
    const { data: ticketsResponse, isLoading: loadingTickets } = useStrapi("tickets", { populate: "*" });

    const tickets = ticketsResponse?.data || [];
    const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse as any)?.data || [];
    const agents = users.filter((u: any) => u.type === 'agent');

    const stats = [
        { label: "Active Agents", count: agents.length, color: "blue", icon: <Users className="w-5 h-5" /> },
        { label: "Total Tickets", count: tickets.length, color: "emerald", icon: <Ticket className="w-5 h-5" /> },
        { label: "Pending Resolve", count: tickets.filter((t: any) => !(t.attributes || t).aiResolved).length, color: "orange", icon: <Clock className="w-5 h-5" /> },
        { label: "Success Rate", count: tickets.length ? Math.round((tickets.filter((t: any) => (t.attributes || t).aiResolved).length / tickets.length) * 100) + "%" : "0%", color: "purple", icon: <BarChart3 className="w-5 h-5" /> },
    ];

    if (loadingUsers || loadingTickets) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 py-12 px-6 font-sans relative">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-white/10">
                                Administrative Panel
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">Global Control</h1>
                        <p className="text-slate-500 text-lg font-medium">Monitoring system performance and expert distribution.</p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Link 
                            href="/admin/agents/create"
                            className="bg-white text-black font-black px-8 py-4 rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-3 shadow-2xl"
                        >
                            <UserPlus className="w-5 h-5" />
                            Onboard Agent
                        </Link>
                        <Link 
                            href="/admin/departments"
                            className="bg-[#111] text-white font-black px-8 py-4 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all flex items-center gap-3"
                        >
                            <Building2 className="w-5 h-5" />
                            Departments
                        </Link>
                        <Link 
                            href="/admin/tickets"
                            className="bg-[#111] text-white font-black px-8 py-4 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all flex items-center gap-3"
                        >
                            <Ticket className="w-5 h-5" />
                            All Tickets
                        </Link>
                        <Link 
                            href="/admin/tickets/assign"
                            className="bg-[#111] text-white font-black px-8 py-4 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all flex items-center gap-3"
                        >
                            <Send className="w-5 h-5" />
                            Manual Assign
                        </Link>
                    </div>
                </header>

                {/* Dashboard Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#111] border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-xl"
                        >
                            <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 w-fit mb-6 shadow-inner`}>
                                {stat.icon}
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3">{stat.label}</p>
                            <p className="text-5xl font-black text-white">{stat.count}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-10">
                    {/* Agents Overview */}
                    <section className="bg-[#111] border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <Users className="w-6 h-6 text-blue-500" />
                                Expert Roster
                            </h2>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{agents.length} Total</span>
                        </div>

                        <div className="space-y-4">
                             {agents.slice(0, 5).map((agent: any) => (
                                <Link 
                                    key={agent.id} 
                                    href={`/admin/agents/details/${agent.id}`}
                                    className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-slate-800/50 group hover:border-slate-700 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center font-black text-lg">
                                            {agent.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white leading-none mb-1.5 group-hover:text-blue-400 transition-colors">
                                                {agent.username}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                                                <Building2 className="w-3 h-3 text-slate-700" />
                                                Support Team
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-400 mb-1">Active</p>
                                        <p className="text-[10px] text-emerald-500/80 font-black uppercase tracking-widest">Verified</p>
                                    </div>
                                </Link>
                            ))}
                            <button className="w-full py-4 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">View All Experts</button>
                        </div>
                    </section>

                    {/* Pending Escalations */}
                    <section className="bg-[#111] border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-orange-500" />
                                Pending Escalations
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {tickets.filter((t: any) => !(t.attributes || t).aiResolved).slice(0, 5).map((ticket: any) => {
                                const attr = ticket.attributes || ticket;
                                return (
                                    <div key={ticket.id} className="p-6 bg-black/40 rounded-3xl border border-slate-800/50 hover:bg-black/60 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-800 text-slate-500`}>
                                                {attr.severity} Priority
                                            </span>
                                            <span className="text-[10px] font-black text-slate-600">{new Date(attr.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-bold text-white mb-4 truncate">{attr.title}</h3>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                <Users className="w-3.5 h-3.5" />
                                                {attr.assignedTo?.data?.attributes?.username || "AWAITING"}
                                            </div>
                                            <Link 
                                                href={`/agent/tickit/details/${ticket.documentId || ticket.id}`}
                                                className="p-2 text-slate-500 hover:text-white transition-colors"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
