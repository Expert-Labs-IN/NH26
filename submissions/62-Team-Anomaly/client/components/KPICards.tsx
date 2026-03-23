"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Clock, ListTodo, Activity, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function KPICards() {
    const [counts, setCounts] = useState({
        total: 0,
        open: 0,
        resolved: 0,
        highPriority: 0,
        avgRes: "1.4h",
        slaBreaches: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchCounts = async () => {
        setLoading(true);

        const { count: totalCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true });
        const { count: openCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'Open');
        const { count: resolvedCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'Resolved');
        const { count: highCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).neq('status', 'Resolved').in('priority', ['High', 'Critical']);

        // Simulating SLA breaches based on Critical priority + Open status for demo
        const { count: slaCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('priority', 'Critical').neq('status', 'Resolved');

        const avgValue = resolvedCount && resolvedCount > 0 ? (Math.random() * 0.5 + 0.8).toFixed(1) : "0.0";

        setCounts({
            total: totalCount || 0,
            open: openCount || 0,
            resolved: resolvedCount || 0,
            highPriority: highCount || 0,
            avgRes: `${avgValue}h`,
            slaBreaches: slaCount || 0
        });
        setLoading(false);
    };

    useEffect(() => {
        fetchCounts();
        const channel = supabase.channel('metrics').on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
            fetchCounts();
        }).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const metrics = [
        { title: "Total Tickets", value: counts.total.toString(), icon: ListTodo, color: "text-white/40", glow: "" },
        { title: "Open Complaints", value: counts.open.toString(), icon: Activity, color: "text-[#F4C430]", glow: "glow-yellow" },
        { title: "Resolved Caseload", value: counts.resolved.toString(), icon: CheckCircle2, color: "text-[#4CAF9A]", glow: "" },
        { title: "SLA Breaches", value: counts.slaBreaches.toString(), icon: AlertCircle, color: "text-red-500", glow: "" },
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2">
            {metrics.map((m) => (
                <div key={m.title} className="glow-behind">
                    <div className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden group min-h-[140px]">
                        {/* Liquid glass specular highlight overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                        <div className="flex items-center justify-between z-10 relative">
                            <span className="text-xs uppercase tracking-widest font-semibold text-white/50">{m.title}</span>
                            <m.icon className={`w-5 h-5 ${m.color} opacity-80`} />
                        </div>

                        <div className="flex items-end justify-between z-10 relative mt-auto">
                            <span className={`text-4xl font-heading font-bold text-white tracking-tight ${m.glow}`}>
                                {m.value}
                            </span>
                            <div className="w-16 h-8 opacity-20">
                                {/* Minimalist sparkline approximation */}
                                <svg viewBox="0 0 100 40" className="w-full h-full stroke-current fill-none">
                                    <path d="M0,30 Q25,10 50,25 T100,5" strokeWidth="3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
