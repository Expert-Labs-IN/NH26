"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Globe, Cpu, Lock } from "lucide-react";

const BENEFITS = [
    { icon: ShieldCheck, text: "Private by Design" },
    { icon: Zap, text: "AI-Powered Triage" },
    { icon: Globe, text: "Smart Routing" },
    { icon: Cpu, text: "Agent Approval Workflow" },
    { icon: Lock, text: "Analytics-Ready" },
];

export default function ValueStrip() {
    return (
        <div className="bg-gray-50/50 border-y border-gray-100 py-8 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-wrap items-center justify-center md:justify-between gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    {BENEFITS.map((b, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                            <b.icon className="w-5 h-5 text-[#121212]" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#121212] whitespace-nowrap">{b.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
