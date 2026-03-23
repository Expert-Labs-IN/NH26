"use client";

import { motion } from "framer-motion";
import { Bot, ShieldAlert, Copy, Layout, PenTool, BarChart } from "lucide-react";

const FEATURES = [
    {
        title: "Conversational AI Intake",
        desc: "Natural language reporting that eliminates complex forms and reduces user friction.",
        icon: Bot,
        color: "text-blue-500"
    },
    {
        title: "Severity & Priority Triage",
        desc: "Autonomous scoring of incoming issues based on intent, impact, and urgency.",
        icon: ShieldAlert,
        color: "text-red-500"
    },
    {
        title: "Duplicate Detection",
        desc: "Neural pattern matching to identify and merge repetitive tickets automatically.",
        icon: Copy,
        color: "text-amber-500"
    },
    {
        title: "Agent Dashboard",
        desc: "A high-velocity resolution environment for human agents to manage the AI stream.",
        icon: Layout,
        color: "text-[#10B981]"
    },
    {
        title: "AI Drafted Replies",
        desc: "Ready-made response drafts for agents to review and send with one click.",
        icon: PenTool,
        color: "text-purple-500"
    },
    {
        title: "Hotspot Detection",
        desc: "Real-time analytics to identify recurring organizational pain points and systemic issues.",
        icon: BarChart,
        color: "text-blue-600"
    }
];

export default function FeaturesGrid() {
    return (
        <section id="features" className="py-24 bg-gray-50/30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="max-w-xl">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0052FF] mb-4">Core Capabilities</h2>
                        <h3 className="text-4xl md:text-5xl font-heading font-black text-black tracking-tighter leading-[0.9]">Everything you need to <br />automate internal support.</h3>
                    </div>
                    <p className="text-gray-500 max-w-sm font-medium leading-relaxed">
                        Precision engineering meets human-centered AI. Designed for enterprises that value speed and privacy.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all group overflow-hidden relative"
                        >
                            <f.icon className={`w-10 h-10 ${f.color} mb-8 transition-transform group-hover:scale-110 duration-500`} />
                            <h4 className="text-2xl font-heading font-black text-[#121212] tracking-tight mb-4">{f.title}</h4>
                            <p className="text-gray-500 leading-relaxed font-medium">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
