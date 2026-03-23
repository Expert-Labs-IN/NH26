"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from "lucide-react";

export default function StatsSection() {
    return (
        <section id="analytics" className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-8"
                    >
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0052FF]">Intelligence & Analytics</h2>
                        <h3 className="text-4xl md:text-5xl font-heading font-black text-[#121212] tracking-tight">Detect hotspots before they become fires.</h3>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed">
                            WorkSync automatically categorizes every ticket and identifies systemic recurring issues across departments.
                            Get real-time visibility into your organization's support health.
                        </p>

                        <div className="grid grid-cols-2 gap-6 mt-4">
                            {[
                                { label: "Departmental Load", icon: BarChart3 },
                                { label: "Resolution Velocity", icon: TrendingUp },
                                { label: "Severity Split", icon: PieChartIcon },
                                { label: "Agent Efficiency", icon: Activity }
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col gap-3 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <stat.icon className="w-6 h-6 text-[#0052FF]" />
                                    <span className="text-sm font-bold text-[#121212]">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-[#0052FF]/10 blur-[80px] rounded-full scale-90" />
                        <div className="relative glass-panel bg-white p-4 border-white/50 shadow-2xl rounded-3xl overflow-hidden">
                            <Image
                                src="/analytics-mockup.png"
                                alt="WorkSync Analytics View"
                                width={1200}
                                height={800}
                                className="rounded-2xl"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
