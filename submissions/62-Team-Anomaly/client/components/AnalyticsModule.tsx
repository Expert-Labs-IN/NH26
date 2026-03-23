"use client";

import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";
import {
    TrendingUp, Users, AlertCircle, Clock, Zap,
    ShieldCheck, FileWarning, Layers, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import clsx from "clsx";

const deptData = [
    { name: "IT", value: 42, color: "#4F7CFF" },
    { name: "HR", value: 28, color: "#F4C430" },
    { name: "Finance", value: 18, color: "#4CAF9A" },
    { name: "Facilities", value: 35, color: "#ff7043" },
    { name: "Admin", value: 12, color: "#9575cd" },
];

const severityData = [
    { name: "Critical", value: 4, color: "#ef4444" },
    { name: "High", value: 15, color: "#f97316" },
    { name: "Medium", value: 35, color: "#F4C430" },
    { name: "Low", value: 46, color: "#4CAF9A" },
];

const trendData = [
    { day: "Mon", volume: 45, resolution: 38 },
    { day: "Tue", volume: 52, resolution: 42 },
    { day: "Wed", volume: 48, resolution: 50 },
    { day: "Thu", volume: 61, resolution: 45 },
    { day: "Fri", volume: 55, resolution: 58 },
    { day: "Sat", volume: 20, resolution: 25 },
    { day: "Sun", volume: 15, resolution: 12 },
];

function KPICard({ title, value, change, icon: Icon, color, glow }: any) {
    const isPositive = change > 0;
    return (
        <div className="glow-behind">
            <div className="glass-panel p-6 flex flex-col gap-2 min-h-[120px]">
                <div className="flex items-center justify-between text-white/40">
                    <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
                    <Icon className={clsx("w-4 h-4", color)} />
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                    <span className={clsx("text-3xl font-heading font-black text-white", glow)}>{value}</span>
                    <span className={clsx("text-[10px] font-bold flex items-center gap-0.5", isPositive ? "text-[#4CAF9A]" : "text-red-500")}>
                        {isPositive ? <ArrowUpRight className="w-2 h-2" /> : <ArrowDownRight className="w-2 h-2" />}
                        {Math.abs(change)}%
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function AnalyticsModule() {
    return (
        <div className="flex flex-col gap-10 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">Operations Analytics</h1>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-1">Global Neural Node Performance View</p>
                </div>
                <div className="flex gap-4">
                    <div className="glass-panel px-4 py-2 flex items-center gap-3 text-[10px] font-black text-white/50 uppercase tracking-widest cursor-pointer">
                        Last 7 Days <Users className="w-3 h-3" />
                    </div>
                    <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
                        Export PDF
                    </button>
                </div>
            </header>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Total Traffic" value="1,248" change={12} icon={TrendingUp} color="text-[#4F7CFF]" />
                <KPICard title="AI Deflection" value="84.2%" change={5.4} icon={Zap} color="text-[#F4C430]" glow="glow-yellow" />
                <KPICard title="SLA Compliance" value="96.8%" change={-2.1} icon={ShieldCheck} color="text-[#4CAF9A]" />
                <KPICard title="Critical Alerts" value="04" change={-15} icon={AlertCircle} color="text-red-500" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Main Trend Chart */}
                <div className="xl:col-span-2 glow-behind">
                    <div className="glass-panel p-8 min-h-[450px] bg-white/[0.01]">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/60 mb-10 flex items-center gap-3">
                            <Layers className="w-4 h-4 text-[#F4C430]" />
                            Volume vs Resolution Velocity
                        </h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F4C430" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#F4C430" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F7CFF" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4F7CFF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.1)" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis stroke="rgba(255,255,255,0.1)" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0E0E10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="volume" stroke="#F4C430" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                                    <Area type="monotone" dataKey="resolution" stroke="#4F7CFF" strokeWidth={3} fillOpacity={1} fill="url(#colorRes)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* AI Insight Sidebar */}
                <div className="flex flex-col gap-6">
                    <div className="glass-panel p-6 bg-white/[0.02] border-[#F4C430]/20">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#F4C430] mb-4 flex items-center gap-2">
                            <Zap className="w-3 h-3" /> Predictive Insight
                        </h4>
                        <p className="text-sm text-white/80 leading-relaxed">
                            “Facilities tickets are increasing by 28% in the <span className="text-[#F4C430] font-bold">Udaipur branch</span>. High correlation detected with regional AC maintenance schedule.”
                        </p>
                    </div>

                    <div className="glass-panel p-6 bg-white/[0.02] border-[#4CAF9A]/20">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4CAF9A] mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Compliance Check
                        </h4>
                        <p className="text-sm text-white/80 leading-relaxed">
                            “HR queries are mostly low severity (82%) and being autonomously resolved by <span className="text-[#4CAF9A] font-bold">Neural Drafts</span>. Deflection efficiency up 4%.”
                        </p>
                    </div>

                    <div className="glass-panel p-6 bg-white/[0.02] border-red-500/20">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                            <FileWarning className="w-3 h-3" /> Bottleneck Alert
                        </h4>
                        <p className="text-sm text-white/80 leading-relaxed">
                            “Finance has the <span className="text-red-500 font-bold">highest unresolved volume</span> this week. Average wait time for Payroll queries has exceeded 6 hours.”
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="glass-panel p-8 bg-white/[0.01]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-8">Segmentation by Core Node</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: '#0E0E10', border: 'none', borderRadius: '8px' }} />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                                    {deptData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-8 bg-white/[0.01]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-8">Severity Distribution</h3>
                    <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={severityData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                                    {severityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-2 ml-10">
                            {severityData.map(s => (
                                <div key={s.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-[10px] uppercase font-bold text-white/40">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
