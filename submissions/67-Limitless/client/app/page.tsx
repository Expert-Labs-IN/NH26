"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, ShieldCheck, Ticket } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[-10px] w-full overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-900/20 mix-blend-screen filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-900/20 mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-1/2 w-96 h-96 bg-indigo-900/20 mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <main className="flex-1 flex flex-col pt-20">
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-6xl mx-auto px-6 pt-20 pb-32 text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 text-slate-300 font-medium text-sm mb-8 border border-slate-800">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
            </span>
            Introducing Smart Routing
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-8">
            The intelligent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">
              Helpdesk Engine
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sarathi resolves repetitive queries automatically and seamlessly escalates complex issues to your team with perfectly formatted summary tickets.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/user/raise-ticket" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-black font-medium hover:bg-slate-200 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2"
            >
              Raise A Ticket
              <ArrowRight className="w-4 h-4" />
            </Link>
            {/* <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent text-slate-300 font-medium hover:bg-slate-900 border border-slate-800 transition-all flex items-center justify-center gap-2"
            >
              View Documentation
            </Link> */}
          </motion.div>
        </motion.section>

        <section className="border-t border-slate-800/50 py-24 flex-1">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div 
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="grid md:grid-cols-3 gap-12"
            >
              <div className="group p-8 rounded-3xl bg-[#111] hover:bg-[#151515] transition-colors border border-slate-800/80">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-sm text-slate-300 mb-6 group-hover:scale-110 transition-transform">
                  <Bot className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">AI First Resolution</h3>
                <p className="text-slate-400 leading-relaxed">Instantly analyzes incoming messages, detects user intent, and resolves common issues without human intervention.</p>
              </div>

              <div className="group p-8 rounded-3xl bg-[#111] hover:bg-[#151515] transition-colors border border-slate-800/80">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-sm text-slate-300 mb-6 group-hover:scale-110 transition-transform">
                  <Ticket className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Smart Ticketing</h3>
                <p className="text-slate-400 leading-relaxed">Automatically generates rich contextual tickets with summaries and severity tracking when AI cannot fully resolve.</p>
              </div>

              <div className="group p-8 rounded-3xl bg-[#111] hover:bg-[#151515] transition-colors border border-slate-800/80">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-sm text-slate-300 mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Role-Based Dashboard</h3>
                <p className="text-slate-400 leading-relaxed">Equip your agents and admins with beautifully structured dashboards prioritizing high severity complaints.</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}