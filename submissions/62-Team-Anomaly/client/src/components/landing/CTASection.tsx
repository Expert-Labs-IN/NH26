"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
    return (
        <section className="py-32 bg-white relative overflow-hidden text-center">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[100%] bg-[#0052FF]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[80%] bg-[#10B981]/5 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center gap-8"
                >
                    <div className="w-16 h-16 rounded-[24px] bg-[#0052FF] flex items-center justify-center shadow-2xl shadow-[#0052FF]/40 mb-4">
                        <Zap className="w-8 h-8 text-white fill-current" />
                    </div>

                    <h2 className="text-5xl md:text-8xl font-heading font-black text-black tracking-tighter leading-[0.9] mb-4 text-shadow-sm">
                        Ready to sync your <br />
                        <span className="text-[#0052FF] text-glow-blue">workplace?</span>
                    </h2>

                    <p className="text-xl text-gray-500 font-medium max-w-lg leading-relaxed">
                        Join the next generation of enterprise support.
                        Reduce load, improve speed, and maintain total privacy.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                        <Link href="/portal/assistant">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0, 82, 255, 0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-[#0052FF] text-white px-10 py-5 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center gap-3 ring-1 ring-white/20"
                            >
                                Start Using WorkSync AI <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </Link>
                        <Link href="/tickets">
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.05)" }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white text-black border-2 border-black/10 px-10 py-5 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all"
                            >
                                View Demo
                            </motion.button>
                        </Link>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Free for your first 5 agents
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
