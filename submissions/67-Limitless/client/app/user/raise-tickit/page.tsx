"use client";

import { motion } from "framer-motion";
import { MessageSquare, Bot, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RaiseTicketPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 py-20 px-6 font-sans flex flex-col items-center">
            
            {/* Background Effects */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl w-full"
            >
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-6 shadow-2xl">
                        <MessageSquare className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                        How can we help you today?
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Describe your issue to Sarathi, our AI agent. It can instantly resolve common problems or automatically create a structured ticket for human escalation.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <motion.div variants={itemVariants} className="bg-[#111] p-6 rounded-2xl border border-slate-800/80 hover:bg-[#151515] transition-colors shadow-lg">
                        <Bot className="w-8 h-8 text-white mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Instant Response</h3>
                        <p className="text-sm text-slate-400">Our AI analyzes your issue instantly and provides immediate solutions without wait times.</p>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="bg-[#111] p-6 rounded-2xl border border-slate-800/80 hover:bg-[#151515] transition-colors shadow-lg">
                        <Zap className="w-8 h-8 text-white mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Smart Ticketing</h3>
                        <p className="text-sm text-slate-400">If unresolved, an intelligent ticket is constructed automatically with full context.</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-[#111] p-6 rounded-2xl border border-slate-800/80 hover:bg-[#151515] transition-colors shadow-lg">
                        <ShieldCheck className="w-8 h-8 text-white mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Seamless Escalation</h3>
                        <p className="text-sm text-slate-400">High priority or complex issues are immediately flagged and escalated to our human experts.</p>
                    </motion.div>
                </div>

                <motion.div variants={itemVariants} className="flex justify-center">
                    <Link 
                        href="/user/raise-tickit/chat"
                        className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold text-lg rounded-xl overflow-hidden transition-all hover:scale-[1.02] shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)]"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Start Chat With Agent
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-slate-200 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}