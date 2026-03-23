"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { 
  Mail, 
  CheckCircle2, 
  ArrowRight, 
  LogIn, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  MessageSquare,
  ListChecks,
  Calendar as CalendarIcon,
  Bot,
  ChevronRight,
  BarChart3,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Inbox
} from "lucide-react";
import { SmoothCursor } from "@/components/SmoothCursor";
import { RefreshCcw as RefreshCcwIcon } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";

// ── Components ─────────────────────────────────────────────────────────────

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md px-6 py-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white">
          <Mail className="w-6 h-6" />
        </div>
        <span className="text-xl font-black text-[#211B34] tracking-tight">EmailAssist</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-sm font-bold text-[#211B34]/60 hover:text-[#7C3AED] transition-colors">Features</a>
        <a href="#autopilot" className="text-sm font-bold text-[#211B34]/60 hover:text-[#7C3AED] transition-colors">Autopilot</a>
        <a href="#how-it-works" className="text-sm font-bold text-[#211B34]/60 hover:text-[#7C3AED] transition-colors">Workflow</a>
      </div>
      <button 
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="flex items-center gap-2 px-6 py-2.5 bg-[#211B34] text-white rounded-lg text-sm font-bold hover:bg-[#2d2545] transition-all active:scale-95 shadow-lg shadow-gray-200"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </button>
    </div>
  </nav>
);

const AnimatedIllustration = ({ type, compact = false }) => {
  const containerClass = compact 
    ? "relative w-full h-full bg-transparent overflow-hidden flex flex-col justify-end p-4 gap-2"
    : "relative w-full h-48 bg-gray-50 rounded-xl overflow-hidden flex flex-col justify-center px-8 gap-3";

  if (type === "summary") {
    return (
      <div className={containerClass}>
        <div className={`space-y-2 ${compact ? 'scale-75 origin-bottom-right opacity-40' : ''}`}>
          {[0.8, 0.6, 0.9, 0.4].map((w, i) => (
            <div key={i} className="h-2 bg-[#211B34]/10 rounded-full relative overflow-hidden" style={{ width: `${w * 100}%` }}>
              <div className={`absolute inset-0 bg-[#7C3AED]/40 animate-scan`} style={{ animationDelay: `${i * 0.5}s` }} />
            </div>
          ))}
        </div>
        {!compact && <div className="absolute top-0 left-0 w-full h-1 bg-[#7C3AED]/20 animate-beam" />}
        <style jsx>{`
          @keyframes scan {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes beam {
            0% { transform: translateY(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(192px); opacity: 0; }
          }
          .animate-scan { animation: scan 2s linear infinite; }
          .animate-beam { animation: beam 3s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }
  
  if (type === "reply") {
    return (
      <div className={containerClass}>
        <div className={`space-y-4 ${compact ? 'scale-[0.6] origin-bottom-right translate-x-4' : ''}`}>
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 max-w-[80%] animate-bounce-subtle">
               <div className="w-2 h-2 rounded-full bg-gray-200" />
               <div className="h-2 w-20 bg-gray-100 rounded-full" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-[#7C3AED] p-3 rounded-2xl rounded-tr-none shadow-lg shadow-[#7C3AED]/20 flex items-center gap-2 max-w-[80%] animate-fade-in-right">
               <div className="h-2 w-24 bg-white/30 rounded-full" />
               <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes fade-in-right {
            0% { opacity: 0; transform: translateX(20px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
          .animate-fade-in-right { animation: fade-in-right 1.5s ease-out forwards; animation-delay: 1s; }
        `}</style>
      </div>
    );
  }

  if (type === "tasks") {
    return (
      <div className={containerClass}>
        <div className={`space-y-4 ${compact ? 'scale-75 origin-bottom-right' : 'px-12'}`}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-5 h-5 rounded border-2 border-[#7C3AED]/20 flex items-center justify-center transition-all ${i === 0 ? 'bg-[#7C3AED] border-[#7C3AED] scale-110' : ''}`} style={{ transitionDelay: `${i * 0.8}s` }}>
                {i === 0 && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <div className={`h-2 bg-[#211B34]/10 rounded-full transition-all`} style={{ width: i === 0 ? '60%' : '40%', transitionDelay: `${i * 0.8}s`, opacity: i === 0 ? 1 : 0.4 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "calendar") {
    return (
      <div className={containerClass}>
        <div className={`w-full ${compact ? 'scale-50 origin-bottom-right translate-y-8 translate-x-4' : 'p-8'} flex flex-col`}>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-1 bg-gray-200 rounded-full" />)}
          </div>
          <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-2 min-h-[100px]">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`rounded-md transition-all duration-1000 ${i === 5 ? 'bg-[#7C3AED]/20 scale-100' : 'bg-white border border-gray-100'}`} />
            ))}
            <div className="absolute top-[45%] left-1/4 right-1/4 h-12 bg-[#7C3AED] rounded-lg shadow-lg shadow-[#7C3AED]/20 flex items-center px-4 gap-2 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              <div className="h-1.5 w-16 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "priority") {
    return (
      <div className={containerClass}>
        <div className={`flex items-center justify-center gap-3 ${compact ? 'scale-75 origin-bottom-right translate-x-4 translate-y-4' : ''}`}>
          <div className="px-4 py-2 rounded-lg bg-red-500 text-white text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-red-500/20 animate-pulse">Urgent</div>
          <div className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-[10px] font-black uppercase tracking-tighter opacity-70">Action Required</div>
          <div className="px-4 py-2 rounded-lg bg-gray-400 text-white text-[10px] font-black uppercase tracking-tighter opacity-40">FYI</div>
        </div>
      </div>
    );
  }

  return null;
};

const FeatureSection = ({ title, subtitle, description, type, reverse, details = [] }) => (
  <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24 py-20`}>
    <div className="flex-1 space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-[10px] font-black uppercase tracking-widest">
        <Zap className="w-3 h-3" />
        {subtitle}
      </div>
      <h2 className="text-4xl font-black text-[#211B34] tracking-tight leading-tight">{title}</h2>
      <p className="text-lg text-[#211B34]/60 leading-relaxed font-medium">
        {description}
      </p>
      {details.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          {details.map((detail, i) => (
            <li key={i} className="flex items-center gap-2 text-sm font-bold text-[#211B34]/80">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {detail}
            </li>
          ))}
        </ul>
      )}
    </div>
    <div className="flex-1 w-full max-w-md">
      <div className="bg-white p-4 rounded-3xl shadow-2xl shadow-gray-200 ring-1 ring-gray-100">
        <AnimatedIllustration type={type} />
      </div>
    </div>
  </div>
);

// ── Main Controller ────────────────────────────────────────────────────────

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#7C3AED] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#211B34] selection:bg-[#7C3AED]/10 selection:text-[#7C3AED]">
      <SmoothCursor />
      <Navbar />

      <main className="pt-20 overflow-x-hidden">
        {/* ── Hero Section ── */}
        <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto text-center overflow-hidden">
          {/* Animated background effects */}
          <div className="absolute inset-0 -z-10">
            {/* Large gradient orb */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#7C3AED]/5 rounded-full blur-[100px] animate-pulse" />

            {/* Floating circles - more of them */}
            <div className="absolute top-20 left-[10%] w-32 h-32 bg-[#7C3AED]/10 rounded-full blur-2xl animate-float" />
            <div className="absolute top-40 right-[15%] w-40 h-40 bg-[#B185FF]/10 rounded-full blur-2xl animate-float-delayed" />
            <div className="absolute bottom-20 left-[20%] w-24 h-24 bg-[#7C3AED]/10 rounded-full blur-2xl animate-float-slow" />
            <div className="absolute top-60 right-[25%] w-28 h-28 bg-[#7C3AED]/8 rounded-full blur-2xl animate-float-reverse" />
            <div className="absolute bottom-40 right-[10%] w-36 h-36 bg-[#B185FF]/8 rounded-full blur-3xl animate-float-slow-delayed" />

            {/* Moving gradient mesh */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#7C3AED]/5 via-transparent to-[#B185FF]/5 animate-gradient" />
            </div>

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(#7C3AED 1px, transparent 1px), linear-gradient(90deg, #7C3AED 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }} />
            </div>

            {/* Animated lines */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
                  <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="line-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#B185FF" stopOpacity="0" />
                  <stop offset="50%" stopColor="#B185FF" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#B185FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,100 Q250,50 500,100 T1000,100" stroke="url(#line-gradient)" strokeWidth="2" fill="none" className="animate-draw" />
              <path d="M0,200 Q300,150 600,200 T1200,200" stroke="url(#line-gradient)" strokeWidth="2" fill="none" className="animate-draw-delayed" />
              <path d="M1200,150 Q900,100 600,150 T0,150" stroke="url(#line-gradient-2)" strokeWidth="2" fill="none" className="animate-draw-reverse" />
            </svg>

            {/* Particle dots */}
            <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-[#7C3AED]/20 rounded-full animate-particle-1" />
            <div className="absolute top-[40%] right-[20%] w-1.5 h-1.5 bg-[#B185FF]/20 rounded-full animate-particle-2" />
            <div className="absolute bottom-[30%] left-[25%] w-2 h-2 bg-[#7C3AED]/15 rounded-full animate-particle-3" />
            <div className="absolute top-[60%] right-[30%] w-1 h-1 bg-[#B185FF]/25 rounded-full animate-particle-4" />
          </div>

          <style jsx>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) translateX(0px); }
              50% { transform: translateY(-20px) translateX(10px); }
            }
            @keyframes float-delayed {
              0%, 100% { transform: translateY(0px) translateX(0px); }
              50% { transform: translateY(-30px) translateX(-15px); }
            }
            @keyframes float-slow {
              0%, 100% { transform: translateY(0px) translateX(0px); }
              50% { transform: translateY(-15px) translateX(20px); }
            }
            @keyframes float-reverse {
              0%, 100% { transform: translateY(0px) translateX(0px); }
              50% { transform: translateY(25px) translateX(-20px); }
            }
            @keyframes float-slow-delayed {
              0%, 100% { transform: translateY(0px) translateX(0px); }
              50% { transform: translateY(-25px) translateX(15px); }
            }
            @keyframes gradient {
              0%, 100% { transform: rotate(0deg) scale(1); }
              50% { transform: rotate(180deg) scale(1.1); }
            }
            @keyframes draw {
              0% { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
              100% { stroke-dasharray: 1000; stroke-dashoffset: 0; }
            }
            @keyframes draw-reverse {
              0% { stroke-dasharray: 1000; stroke-dashoffset: 0; }
              100% { stroke-dasharray: 1000; stroke-dashoffset: -1000; }
            }
            @keyframes particle-1 {
              0%, 100% { transform: translate(0, 0); opacity: 0.2; }
              50% { transform: translate(30px, -40px); opacity: 0.8; }
            }
            @keyframes particle-2 {
              0%, 100% { transform: translate(0, 0); opacity: 0.3; }
              50% { transform: translate(-40px, 30px); opacity: 0.7; }
            }
            @keyframes particle-3 {
              0%, 100% { transform: translate(0, 0); opacity: 0.25; }
              50% { transform: translate(20px, 35px); opacity: 0.6; }
            }
            @keyframes particle-4 {
              0%, 100% { transform: translate(0, 0); opacity: 0.2; }
              50% { transform: translate(-25px, -30px); opacity: 0.75; }
            }
            .animate-float { animation: float 8s ease-in-out infinite; }
            .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
            .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
            .animate-float-reverse { animation: float-reverse 9s ease-in-out infinite; }
            .animate-float-slow-delayed { animation: float-slow-delayed 11s ease-in-out infinite; }
            .animate-gradient { animation: gradient 20s ease-in-out infinite; }
            .animate-draw { animation: draw 3s ease-in-out infinite; }
            .animate-draw-delayed { animation: draw 3s ease-in-out infinite 1.5s; }
            .animate-draw-reverse { animation: draw-reverse 4s ease-in-out infinite; }
            .animate-particle-1 { animation: particle-1 6s ease-in-out infinite; }
            .animate-particle-2 { animation: particle-2 7s ease-in-out infinite 1s; }
            .animate-particle-3 { animation: particle-3 8s ease-in-out infinite 2s; }
            .animate-particle-4 { animation: particle-4 5s ease-in-out infinite 0.5s; }
          `}</style>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 text-[#211B34]/60 text-xs font-bold mb-8 transition-all hover:bg-gray-100 cursor-default ring-1 ring-gray-100">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            v1.0 is now live — Experience the future of email
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-[#211B34] tracking-tighter leading-[0.9] mb-8">
            Automate your inbox<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#B185FF]">with Agentic AI.</span>
          </h1>

          <p className="text-lg md:text-xl text-[#211B34]/60 max-w-xl mx-auto mb-12 font-medium leading-relaxed">
            EmailAssist transforms your chaotic inbox into a structured, autonomous workspace. AI that doesn't just suggest, but actually acts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="group flex items-center gap-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black py-4 px-8 rounded-xl transition-all duration-300 active:scale-[0.95] shadow-xl shadow-[#7C3AED]/30 text-lg"
            >
              <LogIn className="w-5 h-5" />
              Connect with Google
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex -space-x-3 opacity-40 grayscale hover:grayscale-0 transition-all">
               <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center font-bold text-[10px]">A</div>
               <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center font-bold text-[10px]">B</div>
               <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center font-bold text-[10px]">C</div>
            </div>
          </div>
          <p className="mt-6 text-[10px] font-black text-[#211B34]/30 uppercase tracking-[0.2em]">Trusted by modern teams</p>
        </section>

        {/* ── Feature Grid Section ── */}
        <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-[#211B34] tracking-tight">Everything you need <br/><span className="text-[#7C3AED]">to dominate your inbox.</span></h2>
            <p className="text-[#211B34]/60 font-medium max-w-2xl mx-auto">Seven core AI capabilities designed to give you hours of your life back every week.</p>
          </div>

          <BentoGrid className="lg:grid-rows-3">
            <BentoCard
              name="Smart Summaries"
              className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3"
              Icon={Zap}
              description="Extract sentiment and key entities instantly."
              href="#features"
              cta="Learn more"
              background={<AnimatedIllustration type="summary" compact={true} />}
            />
            <BentoCard
              name="Priority Engine"
              className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2"
              Icon={ShieldCheck}
              description="AI that labels what actually matters."
              href="#features"
              cta="Learn more"
              background={<AnimatedIllustration type="priority" compact={true} />}
            />
            <BentoCard
              name="Voice-Styled Replies"
              className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2"
              Icon={Sparkles}
              description="Context-aware drafts in your unique tone."
              href="#features"
              cta="Learn more"
              background={<AnimatedIllustration type="reply" compact={true} />}
            />
            <BentoCard
              name="Task Extraction"
              className="lg:col-start-2 lg:col-end-4 lg:row-start-2 lg:row-end-3"
              Icon={ListChecks}
              description="Turn messy bodies into organized checklists."
              href="#features"
              cta="Learn more"
              background={<AnimatedIllustration type="tasks" compact={true} />}
            />
            <BentoCard
              name="Calendar Sync"
              className="lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4"
              Icon={CalendarIcon}
              description="Native Google Calendar integration."
              href="#features"
              cta="Learn more"
              background={<AnimatedIllustration type="calendar" compact={true} />}
            />
            <BentoCard
              name="Unified Dashboard"
              className="lg:col-start-2 lg:col-end-3 lg:row-start-3 lg:row-end-4"
              Icon={BarChart3}
              description="One central hub for all actions."
              href="#features"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                  <BarChart3 className="w-20 h-20 text-[#7C3AED]/10" />
                </div>
              }
            />
             <BentoCard
              name="AI Autopilot"
              className="lg:col-start-3 lg:col-end-4 lg:row-start-3 lg:row-end-4"
              Icon={Bot}
              description="Autonomous rule-based productivity."
              href="#autopilot"
              cta="View Autopilot"
              background={
                <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                   <div className="w-24 h-24 rounded-full bg-[#7C3AED]/5 animate-pulse flex items-center justify-center">
                     <Bot className="w-12 h-12 text-[#7C3AED]/20" />
                   </div>
                </div>
              }
            />
          </BentoGrid>
        </section>

        {/* ── Dashboard Showcase ── */}
        <section className="bg-white py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-16">
             <div className="space-y-6">
                <div className="w-12 h-1 bg-[#7C3AED] rounded-full" />
                <h2 className="text-4xl font-black text-[#211B34] tracking-tight">One central hub for <br/> all your actions.</h2>
                <p className="text-lg text-[#211B34]/60 font-medium leading-relaxed">
                   The EmailAssist Dashboard provides a unified view of every processed email. Filter by priority, refresh in real-time, and take action without ever leaving the app.
                </p>
                <ul className="space-y-3 pt-4">
                   {[
                     { icon: Inbox, text: "Centralized Email Feed" },
                     { icon: Layers, text: "Priority Filtering" },
                     { icon: RefreshCcwIcon, text: "Real-time AI Processing" }
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-3 text-[#211B34] font-bold text-sm">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                           <item.icon className="w-4 h-4 text-[#7C3AED]" />
                        </div>
                        {item.text}
                     </li>
                   ))}
                </ul>
             </div>
             <div className="relative">
                <div className="bg-[#211B34] p-6 rounded-[2rem] shadow-2xl shadow-gray-200 skew-x-1 -rotate-2 scale-100">
                   {/* Mock dashboard card */}
                   <div className="space-y-3">
                      <div className="flex items-center justify-between mb-6">
                         <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                         </div>
                         <div className="h-3 w-24 bg-white/10 rounded-full" />
                      </div>
                      <div className="h-16 w-full bg-white/5 rounded-xl p-3 flex gap-3">
                         <div className="w-10 h-10 rounded-lg bg-[#7C3AED] shrink-0" />
                         <div className="space-y-1.5 flex-1">
                            <div className="h-2.5 w-[80%] bg-white/20 rounded-full" />
                            <div className="h-1.5 w-[40%] bg-white/10 rounded-full" />
                         </div>
                      </div>
                      <div className="h-16 w-full bg-white/5 rounded-xl p-3 flex gap-3 opacity-40">
                         <div className="w-10 h-10 rounded-lg bg-gray-600 shrink-0" />
                         <div className="space-y-1.5 flex-1">
                            <div className="h-2.5 w-[60%] bg-white/20 rounded-full" />
                            <div className="h-1.5 w-[30%] bg-white/10 rounded-full" />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* ── Autopilot Section ── */}
        <section id="autopilot" className="bg-[#211B34] py-32 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7C3AED]/10 rounded-full blur-[140px] translate-x-1/2 -translate-y-1/2" />
          
          <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-white mx-auto shadow-xl shadow-[#7C3AED]/30 animate-pulse">
              <Bot className="w-10 h-10" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white">The Autopilot Experience.</h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed">
              Define natural language rules like <span className="text-[#7C3AED]">"Draft formal invites for all faculty members"</span> and let the system handle the rest. Autonomous productivity.
            </p>
            <div className="grid md:grid-cols-3 gap-8 pt-16">
              {[
                { icon: Clock, title: "Time Reclaimed", desc: "Automate hours of repetitive busywork every single week." },
                { icon: ShieldCheck, title: "Zero Setup", desc: "Connect your Google account and you're ready in seconds." },
                { icon: ShieldAlert, title: "Privacy First", desc: "Your data is strictly encrypted and resides in secure clusters." }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 p-8 rounded-[1.5rem] text-left border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-[#7C3AED]" />
                  </div>
                  <h4 className="text-lg font-black text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-white/50 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Workflow / How it Works ── */}
        <section id="how-it-works" className="bg-white py-24 px-6">
           <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20 space-y-3">
                 <h3 className="text-[10px] font-black text-[#7C3AED] uppercase tracking-[0.4em]">Simple Workflow</h3>
                 <h2 className="text-4xl font-black text-[#211B34]">How EmailAssist works.</h2>
              </div>
              <div className="grid md:grid-cols-4 gap-10 relative">
                 <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-gray-100 -z-0" />
                 {[
                   { step: "01", icon: LogIn, title: "Connect", desc: "Link your Google account with one click." },
                   { step: "02", icon: RefreshCcwIcon, title: "Process", desc: "AI analyzes your inbox in real-time." },
                   { step: "03", icon: Sparkles, title: "Augment", desc: "Review summaries, tasks, and draft replies." },
                   { step: "04", icon: ArrowUpRight, title: "Optimize", desc: "Set autopilot rules for hands-free action." }
                 ].map((item, i) => (
                   <div key={i} className="relative z-10 text-center space-y-5 group">
                      <div className="w-20 h-20 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center mx-auto shadow-lg group-hover:border-[#7C3AED] transition-colors relative">
                         <item.icon className="w-8 h-8 text-[#7C3AED]" />
                      </div>
                      <div className="text-4xl font-black text-gray-50 absolute -top-3 left-1/2 -translate-x-1/2 -z-10">{item.step}</div>
                      <h4 className="text-lg font-black text-[#211B34]">{item.title}</h4>
                      <p className="text-xs text-[#211B34]/60 font-medium">{item.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── CTA Footer Section ── */}
        <section className="px-6 py-32 max-w-4xl mx-auto text-center space-y-10">
          <div className="inline-block p-3 rounded-2xl bg-[#7C3AED]/5 mb-2">
             <Bot className="w-10 h-10 text-[#7C3AED]" />
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#211B34] tracking-tighter leading-none">Ready to reclaim your time?</h2>
          <p className="text-lg text-[#211B34]/60 font-medium max-w-md mx-auto leading-relaxed">
            Join hundreds of professionals using EmailAssist to stay ahead. Experience agentic AI today.
          </p>
          <div className="flex flex-col items-center gap-5">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="group flex items-center gap-3 bg-[#211B34] hover:bg-[#2d2545] text-white font-black py-4 px-10 rounded-xl transition-all duration-300 active:scale-[0.95] shadow-xl shadow-gray-200 text-lg"
            >
              <LogIn className="w-5 h-5" />
              Connect Your Account
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[10px] font-bold text-[#211B34]/30 uppercase tracking-widest">Connect in seconds. Cancel any time.</p>
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 bg-white border-t border-gray-50">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[#211B34] flex items-center justify-center text-white">
                   <Mail className="w-5 h-5" />
                </div>
                <span className="text-xl font-black text-[#211B34] tracking-tight">EmailAssist</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8 text-[11px] font-black text-[#211B34]/40 uppercase tracking-widest">
                <a href="#features" className="hover:text-[#7C3AED] transition-colors">Features</a>
                <a href="#autopilot" className="hover:text-[#7C3AED] transition-colors">Autopilot</a>
                <a href="#how-it-works" className="hover:text-[#7C3AED] transition-colors">Workflow</a>
                <a href="#" className="hover:text-[#7C3AED] transition-colors">Privacy</a>
              </div>
           </div>
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[#211B34]/20 text-[10px] font-bold uppercase tracking-widest border-t border-gray-50 pt-10">
             <p>© 2026 AURO Uni Hackathon - Auro-Strawhats</p>
             <p>Built with Next.js, AI, and Coffee</p>
           </div>
        </div>
      </footer>
    </div>
  );
}
