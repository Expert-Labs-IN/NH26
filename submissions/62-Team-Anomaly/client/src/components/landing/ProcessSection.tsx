"use client";

import { motion } from "framer-motion";
import { MessageSquare, FileSearch, FileText, CheckCircle2 } from "lucide-react";

const STEPS = [
    {
        title: "Conversational Chat",
        desc: "Users report issues naturally via a smart AI assistant.",
        icon: MessageSquare,
        color: "bg-blue-50 text-blue-600"
    },
    {
        title: "AI Deep Analysis",
        desc: "Neural engine extracts entities, severity, and context.",
        icon: FileSearch,
        color: "bg-purple-50 text-purple-600"
    },
    {
        title: "Automatic Draft",
        desc: "A ready-to-send support ticket is drafted for review.",
        icon: FileText,
        color: "bg-amber-50 text-amber-600"
    },
    {
        title: "Agent Resolution",
        desc: "Agents approve and resolve with one click.",
        icon: CheckCircle2,
        color: "bg-[#10B981]/10 text-[#10B981]"
    }
];

export default function ProcessSection() {
    return (
        <section id="how-it-works" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20 flex flex-col items-center">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0052FF] mb-4 bg-[#0052FF]/5 px-4 py-1.5 rounded-full inline-block">The Workflow</h2>
                    <h3 className="text-4xl md:text-5xl font-heading font-black text-[#121212] tracking-tight mb-6">Chat to resolution in seconds.</h3>
                    <p className="text-gray-500 max-w-2xl font-medium leading-relaxed">
                        We've optimized the entire support lifecycle to prioritize internal autonomy.
                        Deflect Level 1 queries and empower agents to focus on complex cases.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-50 hidden lg:block -translate-y-12 z-0" />

                    {STEPS.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all group z-10 relative"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500`}>
                                <step.icon className="w-7 h-7" />
                            </div>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-2">Step {i + 1}</span>
                            <h4 className="text-xl font-heading font-black text-[#121212] tracking-tight mb-3">{step.title}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
