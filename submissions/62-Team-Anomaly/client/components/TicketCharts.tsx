"use client";

import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";



export function DonutChartOverview() {
    const [data, setData] = useState([
        { name: "Technical", value: 0, color: "#4F7CFF" },
        { name: "Billing", value: 0, color: "#F4C430" },
        { name: "Account", value: 0, color: "#4CAF9A" },
        { name: "Facilities", value: 0, color: "#FF7C4F" },
        { name: "Other", value: 0, color: "rgba(255,255,255,0.2)" },
    ]);
    const [efficiency, setEfficiency] = useState(0);

    const fetchData = async () => {
        const { data: tickets } = await supabase.from('tickets').select('ai_summary, status');
        if (tickets) {
            const counts: any = {
                Technical: 0,
                Billing: 0,
                Account: 0,
                Facilities: 0,
                Other: 0
            };

            tickets.forEach(t => {
                const summary = t.ai_summary || "";
                if (summary.includes('[Category: IT]')) counts.Technical++;
                else if (summary.includes('[Category: HR]')) counts.Account++;
                else if (summary.includes('[Category: Finance]')) counts.Billing++;
                else if (summary.includes('[Category: Facilities]')) counts.Facilities++;
                else counts.Other++;
            });

            setData(prev => prev.map(d => ({
                ...d,
                value: counts[d.name] || 0
            })));

            const total = tickets.length;
            const resolved = tickets.filter(t => t.status === 'Resolved').length;
            setEfficiency(total > 0 ? Math.round((resolved / total) * 100) : 0);
        }
    };

    useEffect(() => {
        fetchData();
        const channel = supabase.channel('chart-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
            fetchData();
        }).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    return (
        <div className="glow-behind h-full">
            <div className="glass-panel p-8 h-full flex flex-col items-center justify-center bg-white/[0.01]">
                <h3 className="w-full text-left font-heading font-bold text-white text-lg tracking-tight mb-6 uppercase tracking-[0.1em] opacity-80">Ticket Segmentation</h3>
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 10px ${entry.color}44)` }} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(14, 14, 16, 0.9)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "12px",
                                    color: "#fff",
                                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                                }}
                                itemStyle={{ color: "#fff", fontWeight: "bold" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center value overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-white">{efficiency}%</span>
                        <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Efficiency</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 w-full px-4">
                    {data.map((d) => (
                        <div key={d.name} className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}` }} />
                            <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">{d.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ResolutionGraph() {
    const [data, setData] = useState([
        { time: "08:00", active: 0, resolved: 0 },
        { time: "10:00", active: 0, resolved: 0 },
        { time: "12:00", active: 0, resolved: 0 },
        { time: "14:00", active: 0, resolved: 0 },
        { time: "16:00", active: 0, resolved: 0 },
        { time: "18:00", active: 0, resolved: 0 },
    ]);

    const fetchData = async () => {
        const { data: tickets } = await supabase
            .from('tickets')
            .select('created_at, status');

        if (tickets) {
            const buckets: any = {
                "08": { active: 0, resolved: 0 },
                "10": { active: 0, resolved: 0 },
                "12": { active: 0, resolved: 0 },
                "14": { active: 0, resolved: 0 },
                "16": { active: 0, resolved: 0 },
                "18": { active: 0, resolved: 0 },
            };

            tickets.forEach(t => {
                const hour = new Date(t.created_at).getHours();
                const bucket = hour <= 8 ? "08" : hour <= 10 ? "10" : hour <= 12 ? "12" : hour <= 14 ? "14" : hour <= 16 ? "16" : "18";
                if (t.status === 'Resolved') buckets[bucket].resolved++;
                else buckets[bucket].active++;
            });

            setData(Object.keys(buckets).map(k => ({
                time: `${k}:00`,
                active: buckets[k].active,
                resolved: buckets[k].resolved
            })));
        }
    };

    useEffect(() => {
        fetchData();
        const channel = supabase.channel('graph-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
            fetchData();
        }).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    return (
        <div className="glow-behind h-full">
            <div className="glass-panel p-8 h-full bg-white/[0.01]">
                <h3 className="font-heading font-bold text-white text-lg tracking-tight mb-8 uppercase tracking-[0.1em] opacity-80">Resolution Velocity</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis
                                dataKey="time"
                                stroke="rgba(255,255,255,0.15)"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.15)"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(14, 14, 16, 0.9)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "12px",
                                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="active"
                                stroke="#F4C430"
                                strokeWidth={4}
                                dot={false}
                                activeDot={{ r: 6, fill: '#F4C430', stroke: '#0E0E10', strokeWidth: 3 }}
                                style={{ filter: 'drop-shadow(0 0 12px rgba(244, 196, 48, 0.4))' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="resolved"
                                stroke="#4F7CFF"
                                strokeWidth={4}
                                dot={false}
                                style={{ filter: 'drop-shadow(0 0 12px rgba(79, 124, 255, 0.4))' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

