"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function StatusPill({ status }: { status: string }) {
    let colorClass = "";
    if (status === "Resolved") colorClass = "bg-[#4CAF9A]/10 text-[#4CAF9A] border-[#4CAF9A]/20 shadow-[0_0_10px_rgba(74,175,154,0.1)]";
    else if (status === "In Progress") colorClass = "bg-[#4F7CFF]/10 text-[#4F7CFF] border-[#4F7CFF]/20 shadow-[0_0_10px_rgba(79,124,255,0.1)]";
    else colorClass = "bg-[#F4C430]/10 text-[#F4C430] border-[#F4C430]/20 shadow-[0_0_10px_rgba(244,196,48,0.1)]";

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 cursor-default ${colorClass}`}>
            {status}
        </span>
    );
}

function PriorityPill({ priority }: { priority: string }) {
    let colorClass = "";
    if (priority === "High" || priority === "Critical") colorClass = "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
    else if (priority === "Medium") colorClass = "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]";
    else colorClass = "bg-white/5 text-white/40 border-white/10";

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 cursor-default ${colorClass}`}>
            {priority}
        </span>
    );
}

export default function RecentTickets() {
    const [tickets, setTickets] = useState<any[]>([]);

    const fetchTickets = async () => {
        const { data } = await supabase
            .from("tickets")
            .select("*")
            .order("id", { ascending: false })
            .limit(6);
        if (data) setTickets(data);
    };

    useEffect(() => {
        fetchTickets();
        const channel = supabase.channel('activity-stream').on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
            fetchTickets();
        }).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    return (
        <div className="glow-behind h-full">
            <div className="glass-panel p-8 h-full flex flex-col bg-white/[0.01]">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-heading font-bold text-white text-lg tracking-tight uppercase tracking-[0.1em] opacity-80">Live Activity Feed</h3>
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#4F7CFF] hover:text-white transition-colors border-b border-transparent hover:border-[#4F7CFF] pb-1">View Archives</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">
                                <th className="pb-2 px-4">UUID</th>
                                <th className="pb-2 px-4">Case Logic</th>
                                <th className="pb-2 px-4">State</th>
                                <th className="pb-2 px-4">Weight</th>
                                <th className="pb-2 px-4">Node</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {tickets.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-white/20 font-bold uppercase tracking-widest text-xs italic">
                                        Waiting for incoming neural streams...
                                    </td>
                                </tr>
                            )}
                            {tickets.map((t: any) => (
                                <tr key={t.id} className="group cursor-pointer transition-all">
                                    <td className="py-4 px-4 bg-white/[0.02] group-hover:bg-white/[0.05] border-y border-l border-white/5 rounded-l-2xl text-white/30 font-mono text-[10px] transition-colors">T-{t.id}</td>
                                    <td className="py-4 px-4 bg-white/[0.02] group-hover:bg-white/[0.05] border-y border-white/5 text-white/90 font-bold tracking-tight transition-colors">
                                        <div className="flex items-center gap-2">
                                            {t.title || t.issue}
                                            {t.is_duplicate && <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 uppercase">DUPE</span>}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 bg-white/[0.02] group-hover:bg-white/[0.05] border-y border-white/5 transition-colors"><StatusPill status={t.status || "Open"} /></td>
                                    <td className="py-4 px-4 bg-white/[0.02] group-hover:bg-white/[0.05] border-y border-white/5 transition-colors"><PriorityPill priority={t.priority || "Medium"} /></td>
                                    <td className="py-4 px-4 bg-white/[0.02] group-hover:bg-white/[0.05] border-y border-r border-white/5 rounded-r-2xl text-white/50 font-medium transition-colors">{t.agent || "Unassigned"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
