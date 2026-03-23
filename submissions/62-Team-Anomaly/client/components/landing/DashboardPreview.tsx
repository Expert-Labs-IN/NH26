"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardPreview() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="bg-[#121212] rounded-[48px] p-8 md:p-20 relative overflow-hidden flex flex-col items-center text-center">
                    {/* Background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#0052FF]/20 blur-[150px] rounded-full pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative z-10 max-w-2xl mb-16"
                    >
                        <h2 className="text-white text-4xl md:text-6xl font-heading font-black tracking-tight mb-8">
                            Built for <span className="text-[#0052FF] text-glow-blue">high-velocity</span> teams.
                        </h2>
                        <div className="flex flex-wrap justify-center gap-6">
                            {[
                                "Real-time updates",
                                "Neural auto-summary",
                                "1-click resolutions"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-white/60 text-sm font-bold uppercase tracking-widest">
                                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10"
                    >
                        <Image
                            src="/hero-mockup.png"
                            alt="Dashboard Detailed Preview"
                            width={1600}
                            height={1000}
                            className="w-full h-auto"
                        />
                    </motion.div>

                    <div className="mt-20 relative z-10 flex flex-col items-center gap-6">
                        <Link href="/tickets">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 82, 255, 0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-[#0052FF] text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl"
                            >
                                <Zap className="w-5 h-5 fill-current text-white" /> Launch Full Interactive Demo
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
