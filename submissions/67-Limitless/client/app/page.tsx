"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ArrowRight, Bot, ShieldCheck, Ticket, Sparkles, 
  Brain, Cpu, Zap, Activity, Globe, Layout, Send
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRef } from "react";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const { data: session, status } = useSession();

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] } 
    },
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Autonomous Intelligence",
      description: "AI analyzes intent, sentiment, and urgency to classify tickets with 99.4% accuracy without human input.",
      gradient: "from-blue-600/20 to-indigo-600/20"
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "Smart Routing",
      description: "Automatically redirects issues to the right department and agent based on technical complexity and specialization.",
      gradient: "from-emerald-600/20 to-cyan-600/20"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Resolution",
      description: "Our AI Chatbot resolves generic queries instantly using your helpdesk knowledge base before escalation.",
      gradient: "from-amber-600/20 to-orange-600/20"
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] flex flex-col font-sans selection:bg-white selection:text-black scroll-smooth">
      {/* Dynamic Background */}
      <motion.div 
        style={{ y: backgroundY }}
        className="fixed inset-0 pointer-events-none -z-10"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full animate-pulse" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </motion.div>

      <main className="flex-1 flex flex-col relative">
        {/* Hero Section */}
        <section className="relative pt-32 pb-40 overflow-hidden">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto px-6 text-center"
          >
            {/* <motion.div variants={itemVariants} className="flex justify-center mb-8">
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-bold tracking-widest uppercase flex items-center gap-3 shadow-2xl backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                The Future of Support is Agentless
              </span>
            </motion.div> */}
{/* @ts-ignore */}

            <motion.h1 variants={itemVariants} className="text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none mb-8">
              SARATHI <br />
              {/* <span className="bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
                INTELLIGENCE
              </span> */}
            </motion.h1>
{/* @ts-ignore */}

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              A high-performance autonomous helpdesk that analyzes, categorizes, and routes technical support tickets with zero configuration. Empowering enterprises with AI-first resolution.
            </motion.p>
{/* @ts-ignore */}
         { session?.userType === "user" &&   <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="/user/raise-tickit" 
                className="group w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-black font-black text-lg hover:bg-slate-200 transition-all shadow-[0_0_50px_-12px_rgba(255,255,255,0.4)] flex items-center justify-center gap-3"
              >
                Raise Ticket
                <Bot className="w-5 h-5 transition-transform group-hover:rotate-12" />
              </Link>
              {/* <Link 
                href="/user/raise-tickit/create" 
                className="group w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 text-white font-black text-lg hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-xl"
              >
                Manual Ticket
                <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link> */}
            </motion.div>}
          </motion.div>
        </section>

        {/* Feature Cards Showcase */}
        <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
                  Engineered for <br />
                  Hyper-Scale Support
                </h2>
                <p className="text-slate-400 font-medium">
                  We've built the world's most intuitive interface for managing complex support ecosystems using advanced LLM routing logic.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-blue-400 shadow-xl backdrop-blur-md">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-emerald-400 shadow-xl backdrop-blur-md">
                  <Globe className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className={`group relative overflow-hidden bg-[#0d0d0d] border border-white/5 p-10 rounded-[2.5rem] hover:border-white/20 transition-all shadow-2xl`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  
                  <div className="relative z-10">
                    <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 w-fit text-white group-hover:scale-110 transition-transform duration-500 shadow-inner">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 group-hover:translate-x-1 transition-transform">{feature.title}</h3>
                    <p className="text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Stats Mockup Section */}
        <section className="py-40 border-t border-white/5 bg-gradient-to-b from-transparent to-blue-900/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" />
                  Performance First
                </div> */}
                <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.1]">
                  Designed for the <br /> 
                  Premium Agent
                </h2>
                <div className="space-y-8">
                  <div className="flex gap-6 items-start">
                    <div className="shrink-0 w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-blue-400">
                      <Layout className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">Unified Command Center</h4>
                      <p className="text-slate-500 font-medium">One dashboard to rule them all. Manage AI resolutions and human escalations in a single cohesive flow.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="shrink-0 w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-purple-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">Secure Integrity</h4>
                      <p className="text-slate-500 font-medium">Enterprise-grade encryption for every support interaction, ensuring user privacy and data security.</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6">
                    <Link href="/register" className="inline-flex items-center gap-3 text-white font-black uppercase tracking-[0.2em] text-xs hover:gap-5 transition-all group">
                        Get Started with Sarathi
                        <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1" />
                    </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-10 bg-blue-500/20 blur-[80px] rounded-full opacity-30 animate-pulse" />
                <div className="relative bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col group">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                             <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                             <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                        </div>
                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-500">
                            v2.0.4 stable
                        </div>
                    </div>
                    
                    <div className="space-y-6 flex-1">
                        <div className="w-full h-8 bg-white/5 rounded-lg animate-pulse" />
                        <div className="grid grid-cols-2 gap-6">
                             <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-4">
                                <div className="text-[10px] font-black text-slate-600 uppercase mb-2">Efficiency</div>
                                <div className="text-3xl font-black text-white">+84%</div>
                             </div>
                             <div className="h-24 bg-indigo-500/10 rounded-xl border border-indigo-500/20 p-4">
                                <div className="text-[10px] font-black text-indigo-500 uppercase mb-2">Intent Detection</div>
                                <div className="text-3xl font-black text-indigo-400">99.8%</div>
                             </div>
                        </div>
                        <div className="w-2/3 h-4 bg-white/5 rounded-lg" />
                        <div className="w-full h-20 bg-gradient-to-r from-blue-500/10 to-transparent rounded-xl border border-blue-500/20 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">AI Routing Active</div>
                                    <div className="text-slate-500 text-xs font-medium">Autonomous Classification</div>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-blue-500/20 rounded-full flex items-center px-1">
                                <motion.div 
                                    animate={{ x: 24 }}
                                    transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                                    className="w-4 h-4 bg-blue-500 rounded-full" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-40 bg-[#050505] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                  Sarathi<br /><br />An AI-Powered Ticketing System
                </h2>
               
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-white text-black p-1.5 rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tight text-white uppercase italic">Sarathi</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">© 2026 Sarathi AI Platforms. All rights reserved.</p>
          <div className="flex gap-8">
             <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Privacy</a>
             <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}