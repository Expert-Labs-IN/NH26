"use client";

import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import clsx from "clsx";

const NOTIFICATIONS = [
    { id: 1, title: "Ticket Resolved", message: "Your software request for Figma has been fulfilled.", time: "2h ago", type: "success", unread: true },
    { id: 2, title: "Security Alert", message: "New login detected from Mumbai, India.", time: "5h ago", type: "warning", unread: false },
    { id: 3, title: "Bot Response", message: "AI Assistant has updated your ticket status with new findings.", time: "1d ago", type: "info", unread: false },
];

export default function NotificationsModule() {
    return (
        <div className="flex flex-col gap-10">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">Alert Stream</h1>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-1">Live updates from your support stream</p>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-[#4F7CFF] hover:text-white transition-colors">Mark all as read</button>
            </header>

            <div className="flex flex-col gap-3">
                {NOTIFICATIONS.map(n => (
                    <div key={n.id} className={clsx(
                        "glass-panel p-6 border-white/5 flex items-center justify-between group transition-all cursor-pointer",
                        n.unread ? "bg-white/[0.04] border-[#4F7CFF]/20" : "bg-white/[0.01]"
                    )}>
                        <div className="flex items-center gap-6">
                            <div className={clsx(
                                "w-10 h-10 rounded-xl flex items-center justify-center border",
                                n.type === 'success' ? 'bg-[#4CAF9A]/10 border-[#4CAF9A]/20 text-[#4CAF9A]' :
                                    n.type === 'warning' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                        'bg-[#4F7CFF]/10 border-[#4F7CFF]/20 text-[#4F7CFF]'
                            )}>
                                {n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                    n.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                                        <Bell className="w-5 h-5" />}
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">{n.title}</h3>
                                    {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#4F7CFF] shadow-[0_0_8px_#4F7CFF]" />}
                                </div>
                                <p className="text-xs text-white/40 leading-none">{n.message}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-bold uppercase text-white/20">{n.time}</span>
                            <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-[#4F7CFF] transition-all group-hover:translate-x-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
