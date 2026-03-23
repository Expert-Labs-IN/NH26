"use client";

import { Activity, Clock, CheckCircle2, User, ChevronRight, AlertTriangle } from "lucide-react";
import clsx from "clsx";

const STATUS_STEPS = [
    { title: "Ticket Created", date: "Mar 22, 10:30 AM", status: "complete", icon: Activity },
    { title: "Bot Triage", date: "Mar 22, 10:31 AM", status: "complete", icon: CheckCircle2 },
    { title: "Agent Assigned", date: "Mar 23, 09:15 AM", status: "complete", icon: User },
    { title: "In Progress", date: "Current Phase", status: "active", icon: Clock },
    { title: "Resolved", date: "Pending", status: "upcoming", icon: CheckCircle2 },
];

export default function TicketStatusModule() {
    return (
        <div className="flex flex-col gap-10">
            <header>
                <h1 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">Ticket Progress</h1>
                <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-1">Real-time status of Node #T-8821</p>
            </header>

            <div className="glass-panel p-10 bg-white/[0.01]">
                <div className="flex flex-col gap-8 max-w-xl mx-auto relative">
                    {/* Vertical line connector */}
                    <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-white/5" />

                    {STATUS_STEPS.map((step, idx) => (
                        <div key={idx} className="flex gap-8 relative z-10">
                            <div className={clsx(
                                "w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-700 shadow-lg",
                                step.status === 'complete' ? 'bg-[#4CAF9A]/10 border-[#4CAF9A]/30 text-[#4CAF9A]' :
                                    step.status === 'active' ? 'bg-[#4F7CFF]/10 border-[#4F7CFF] text-[#4F7CFF] animate-pulse shadow-[0_0_15px_rgba(79,124,255,0.4)]' :
                                        'bg-white/5 border-white/5 text-white/10'
                            )}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-1 py-1">
                                <h3 className={clsx(
                                    "text-sm font-black uppercase tracking-widest",
                                    step.status === 'upcoming' ? 'text-white/10' : 'text-white'
                                )}>{step.title}</h3>
                                <span className={clsx(
                                    "text-[10px] font-bold uppercase tracking-[0.1em]",
                                    step.status === 'active' ? 'text-[#4F7CFF]' : 'text-white/20'
                                )}>{step.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-panel p-6 bg-[#4CAF9A]/5 border-[#4CAF9A]/20 flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#4CAF9A]/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-[#4CAF9A]" />
                </div>
                <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Latest Update</h4>
                    <p className="text-sm text-white/60">"Agent <span className="text-white font-bold">Sarah Lee</span> is currently reproducing the VPN error on a test node."</p>
                </div>
            </div>
        </div>
    );
}
