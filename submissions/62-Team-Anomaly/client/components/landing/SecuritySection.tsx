"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, EyeOff, FileKey } from "lucide-react";

const PILLARS = [
    {
        title: "Private by Design",
        desc: "Neural models process data within your secure enclave. No training on your intellectual property.",
        icon: ShieldCheck
    },
    {
        title: "RBAC Controls",
        desc: "Granular role-based access to ensure sensitive support data only reaches authorized agents.",
        icon: Lock
    },
    {
        title: "Local Processing",
        desc: "Optimized for secure local cloud environments, ensuring zero data leakage to external models.",
        icon: EyeOff
    },
    {
        title: "Audit Ready",
        desc: "Full transparency with an immutable activity log for every AI decision and human action.",
        icon: FileKey
    }
];

export default function SecuritySection() {
    return (
        <section id="security" className="py-24 bg-[#121212] overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `radial-gradient(#FFFFFF 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20 flex flex-col items-center">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0052FF] mb-4 bg-white/5 px-4 py-1.5 rounded-full inline-block font-heading">Security First</h2>
                    <h3 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight mb-6">Enterprise-grade <br />privacy as a standard.</h3>
                    <p className="text-gray-400 max-w-2xl font-medium leading-relaxed">
                        We understand that internal support involves sensitive company data.
                        WorkSync is built with a security-first architecture that prioritizes your data's integrity.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {PILLARS.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-[#0052FF]/20 flex items-center justify-center mb-6 text-[#0052FF] group-hover:scale-110 transition-transform duration-500">
                                <p.icon className="w-6 h-6 outline-none" />
                            </div>
                            <h4 className="text-xl font-heading font-black text-white tracking-tight mb-3">{p.title}</h4>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">{p.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
