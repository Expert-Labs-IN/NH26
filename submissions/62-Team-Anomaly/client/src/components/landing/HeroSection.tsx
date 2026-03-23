"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Shield, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section id="product" className="relative pt-32 pb-20 overflow-hidden bg-[#FFFFFF]">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-[#0052FF]/5 blur-[120px] rounded-full opacity-50" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[50%] bg-[#10B981]/3 blur-[100px] rounded-full opacity-30" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="flex flex-col gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052FF]/5 border border-[#0052FF]/10 text-[#0052FF] text-[10px] font-black uppercase tracking-widest w-fit"
                        >
                            <Zap className="w-3 h-3 fill-current" /> AI-first workplace resolution engine
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-6xl md:text-8xl font-heading font-black text-black tracking-tighter leading-[0.9] mb-4 text-shadow-sm"
                        >
                            Deflection first. <br />
                            <span className="text-[#0052FF] text-glow-blue">Action second.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-gray-600 font-medium leading-relaxed max-w-lg mb-4"
                        >
                            WorkSync AI transforms how your enterprise handles internal support.
                            From conversational intake to automated triage, we reduce support load by 40% in week one.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-wrap items-center gap-4"
                        >
                            <Link href="/portal/assistant">
                                <button className="bg-[#0052FF] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-[#000000] transition-all shadow-2xl shadow-[#0052FF]/40 flex items-center gap-2 group ring-1 ring-white/20">
                                    Try WorkSync AI <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <a href="#how-it-works">
                                <button className="bg-white text-[#121212] border border-gray-200 px-8 py-4 rounded-2xl text-base font-black uppercase tracking-widest hover:border-gray-300 transition-all flex items-center gap-2 group">
                                    <Play className="w-4 h-4 fill-current" /> See how it works
                                </button>
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="flex items-center gap-8 mt-4 pt-8 border-t border-gray-100"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="text-2xl font-black text-[#121212]">40%</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Less Triage Time</span>
                            </div>
                            <div className="flex flex-col gap-1 border-l border-gray-100 pl-8">
                                <span className="text-2xl font-black text-[#121212]">2m</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg. Setup Time</span>
                            </div>
                            <div className="flex flex-col gap-1 border-l border-gray-100 pl-8">
                                <span className="text-2xl font-black text-[#121212]">ISO 27001</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enterprise Ready</span>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="relative hidden lg:block"
                    >
                        <div className="absolute inset-0 bg-[#0052FF]/10 blur-[100px] rounded-full scale-75 animate-pulse" />
                        <div className="relative glass-panel bg-white p-2 border-white/50 shadow-2xl rounded-3xl overflow-hidden scale-100 transition-transform hover:scale-[1.02]">
                            <Image
                                src="/hero-mockup.png"
                                alt="WorkSync Dashboard Preview"
                                width={1200}
                                height={800}
                                className="rounded-2xl"
                            />
                            {/* Floating Card: AI analysis */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-1/4 -left-8 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">AI Analysis</span>
                                    <span className="text-xs font-bold text-[#121212]">Severity: Normal</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
