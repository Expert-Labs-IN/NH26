"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  Bot, Zap, Calendar, CheckSquare, MessageSquare, ShieldCheck,
  ArrowRight, Mail, Layers, Lock, Clock, RefreshCw, Inbox,
  AlertCircle, Send, Edit3, ThumbsUp, ThumbsDown,
  ChevronDown, Sparkles, Brain, Filter, Users, Star,
  TrendingUp, Database
} from 'lucide-react';

const C = '#7C3AED'; // primary color (accent purple from dashboard)
const CL = '#f5f0f2'; // very light tint for backgrounds

/* ─── Floating animated email cards in hero ─── */
function FloatingEmail({ style, priority, subject, from, delay }) {
  const badges = {
    urgent: { bg: '#ef4444', text: 'white' },
    action: { bg: '#eab308', text: 'white' },
    fyi: { bg: '#9ca3af', text: 'white' },
  };
  const labels = { urgent: 'Urgent', action: 'Action', fyi: 'FYI' };

  return (
    <div
      className="absolute bg-white shadow-lg p-3 w-56 rounded-lg"
      style={{ ...style, animation: `floatY 6s ease-in-out ${delay} infinite alternate` }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] truncate text-gray-500">{from}</span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: badges[priority].bg, color: badges[priority].text }}
        >
          {labels[priority]}
        </span>
      </div>
      <p className="text-xs font-semibold truncate" style={{ color: C }}>{subject}</p>
      <div className="mt-2 space-y-1">
        <div className="h-1.5 rounded bg-gray-100" />
        <div className="h-1.5 rounded w-3/4 bg-gray-100" />
      </div>
    </div>
  );
}

/* ─── Animated pipeline node ─── */
function PipelineNode({ icon, label, shade, delay }) {
  return (
    <div className="flex flex-col items-center gap-2" style={{ animation: `fadeSlideUp 0.6s ease-out ${delay} both` }}>
      <div className="w-14 h-14 rounded-lg flex items-center justify-center shadow-md" style={{ background: shade }}>
        {icon}
      </div>
      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">{label}</span>
    </div>
  );
}

/* ─── Animated connector arrow ─── */
function PipelineArrow({ delay }) {
  return (
    <div className="hidden md:flex items-center" style={{ animation: `fadeIn 0.4s ease-out ${delay} both` }}>
      <div className="w-8 h-0.5 bg-gray-200" />
      <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-gray-300" />
    </div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({ icon, title, badge, description, flow }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative rounded-lg bg-white overflow-hidden transition-all duration-300"
      style={{ boxShadow: hovered ? `0 8px 32px ${C}15` : '0 2px 8px rgba(0,0,0,0.08)', transform: hovered ? 'translateY(-2px)' : 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="h-1 w-full transition-all duration-300" style={{ background: hovered ? C : '#f3f4f6' }} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-gray-50">
            {icon}
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider bg-gray-100" style={{ color: C }}>
            {badge}
          </span>
        </div>
        <h3 className="text-base font-bold mb-2 text-[#211B34]">{title}</h3>
        <p className="text-sm mb-5 leading-relaxed text-gray-600">{description}</p>
        <div className="space-y-2.5">
          {flow.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: C }}>
                <span className="text-white text-[9px] font-black">{i + 1}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#211B34]">{f.step}</span>
                <p className="text-xs text-gray-600">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Animated stat counter ─── */
function AnimatedStat({ value, label, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = value / 50;
        const timer = setInterval(() => {
          start += step;
          if (start >= value) { setCount(value); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black mb-1" style={{ color: C }}>
        {count}{suffix}
      </div>
      <div className="text-sm font-medium text-gray-600">{label}</div>
    </div>
  );
}

/* ─── Typewriter text ─── */
function Typewriter({ texts }) {
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx];
    const timeout = setTimeout(() => {
      if (!deleting && charIdx < current.length) {
        setCharIdx(c => c + 1);
      } else if (!deleting && charIdx === current.length) {
        setTimeout(() => setDeleting(true), 1800);
      } else if (deleting && charIdx > 0) {
        setCharIdx(c => c - 1);
      } else if (deleting && charIdx === 0) {
        setDeleting(false);
        setTextIdx(i => (i + 1) % texts.length);
      }
    }, deleting ? 40 : 70);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts]);

  return (
    <span className="font-semibold" style={{ color: C }}>
      {texts[textIdx].slice(0, charIdx)}
      <span className="animate-pulse">|</span>
    </span>
  );
}

/* ─── Scroll-reveal wrapper ─── */
function Reveal({ children, delay = '0s', className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}, transform 0.7s ease ${delay}`,
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════════ */
export function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden bg-white text-[#211B34]">
      <style>{`
        @keyframes floatY {
          from { transform: translateY(0px) rotate(-1deg); }
          to   { transform: translateY(-16px) rotate(1deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.4; }
          100% { transform: scale(2.0); opacity: 0; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-spin-slow { animation: spinSlow 20s linear infinite; }
        .animate-spin-slow-reverse { animation: spinSlow 14s linear infinite reverse; }
        .animate-pulse-ring { animation: pulse-ring 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>

      {/* ── Navigation ── */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="p-2 rounded-lg" style={{ background: C }}>
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white border-2" style={{ borderColor: C }} />
          </div>
          <span className="text-lg font-black text-[#211B34]">
            Email<span className="text-gray-500">Assist</span>
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#problem" className="hover:opacity-70 transition-opacity">Problem</a>
          <a href="#pipeline" className="hover:opacity-70 transition-opacity">Pipeline</a>
          <a href="#features" className="hover:opacity-70 transition-opacity">Features</a>
          <a href="#flow" className="hover:opacity-70 transition-opacity">Flow</a>
        </div>
        <button
          onClick={onStart}
          className="text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-opacity hover:opacity-90 flex items-center gap-2"
          style={{ background: C }}
        >
          <Zap className="w-4 h-4" /> Launch
        </button>
      </nav>

      {/* ══ HERO ══ */}
      <header className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-24 bg-gray-50">
        {/* Background dot grid */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle, ${C} 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Floating orbit rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full animate-spin-slow pointer-events-none border border-gray-200" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full animate-spin-slow-reverse pointer-events-none border border-gray-100" />

        {/* Floating email cards */}
        <div className="absolute inset-0 pointer-events-none">
          <FloatingEmail style={{ top: '18%', left: '4%' }} priority="urgent" subject="URGENT: Q3 Report Due Today" from="cfo@company.com" delay="0s" />
          <FloatingEmail style={{ top: '55%', left: '2%' }} priority="action" subject="Meeting Request: Product Review" from="pm@client.com" delay="1.2s" />
          <FloatingEmail style={{ top: '22%', right: '4%' }} priority="action" subject="Contract Approval Needed" from="legal@partner.com" delay="0.6s" />
          <FloatingEmail style={{ top: '58%', right: '3%' }} priority="fyi" subject="Weekly Newsletter: Tech Digest" from="news@techdigest.io" delay="1.8s" />
          <FloatingEmail style={{ top: '80%', left: '18%' }} priority="urgent" subject="Server Down — Immediate Action" from="alerts@devops.io" delay="2.4s" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase mb-10 bg-white shadow-sm"
            style={{ color: C, animation: 'fadeSlideUp 0.6s ease-out 0s both' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: C }} />
            </span>
            Action-Oriented Inbox System · AI-Powered
          </div>

          <h1
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05] text-[#211B34]"
            style={{ animation: 'fadeSlideUp 0.6s ease-out 0.15s both' }}
          >
            Agentic AI
            <br />
            <span className="text-gray-600">Email Assistant</span>
          </h1>

          <p
            className="text-xl md:text-2xl mb-4 font-light text-gray-600"
            style={{ animation: 'fadeSlideUp 0.6s ease-out 0.3s both' }}
          >
            Stop reading emails.{' '}
            <span className="font-semibold text-[#211B34]">Start executing actions.</span>
          </p>

          <div
            className="text-lg md:text-xl mb-12 h-8"
            style={{ animation: 'fadeSlideUp 0.6s ease-out 0.45s both' }}
          >
            <Typewriter texts={[
              'Auto-draft context-aware replies',
              'Extract tasks with deadlines',
              'Schedule meetings instantly',
              'Prioritize what truly matters',
              'Orchestrate multi-step actions',
            ]} />
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animation: 'fadeSlideUp 0.6s ease-out 0.6s both' }}
          >
            <button
              onClick={onStart}
              className="group px-8 py-4 text-white rounded-lg font-black text-lg transition-opacity hover:opacity-90 flex items-center gap-3 shadow-lg"
              style={{ background: C }}
            >
              <Zap className="w-5 h-5" />
              Try the Live Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#problem"
              className="px-8 py-4 bg-white rounded-lg font-bold text-lg transition-opacity hover:opacity-80 flex items-center gap-2 shadow-sm text-[#211B34]"
            >
              <ChevronDown className="w-5 h-5 animate-bounce-slow" /> Explore Features
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </header>

      {/* ══ STATS ══ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <AnimatedStat value={28} label="Hours saved per month" suffix="h" />
            <AnimatedStat value={6} label="Core AI features" />
            <AnimatedStat value={3} label="Action types per email" />
            <AnimatedStat value={100} label="Human control retained" suffix="%" />
          </div>
        </div>
      </section>

      {/* ══ PROBLEM & SOLUTION ══ */}
      <section id="problem" className="py-28 relative overflow-hidden bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <Reveal className="text-center mb-20">
            <span className="text-xs font-bold uppercase tracking-widest mb-3 block text-gray-500">Why This Exists</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#211B34]">Problem & Solution</h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Understanding the root cause and how this system addresses it comprehensively.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem */}
            <Reveal delay="0.1s">
              <div className="h-full rounded-lg bg-white p-8 shadow-sm">
                <div className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest mb-6 px-3 py-1.5 rounded-lg bg-gray-100" style={{ color: C }}>
                  <AlertCircle className="w-4 h-4" /> The Problem
                </div>
                <h3 className="text-2xl font-black mb-4 text-[#211B34]">Cognitive Overload & Wasted Time</h3>
                <p className="leading-relaxed mb-8 text-gray-600">
                  Modern professionals spend <strong className="text-[#211B34]">2–3 hours daily</strong> managing emails—reading long threads,
                  identifying required actions, replying, scheduling meetings, and tracking tasks.
                  Existing solutions provide basic categorization or summarization, but{' '}
                  <strong className="text-[#211B34]">they never take initiative or prepare executable outcomes.</strong>
                </p>

                <div className="space-y-3">
                  {[
                    { icon: <Brain className="w-4 h-4" />, title: 'Cognitive Overload', desc: 'Too much unstructured information to process manually every day.' },
                    { icon: <Clock className="w-4 h-4" />, title: 'Repetitive Decisions', desc: 'Time wasted composing standard replies and scheduling routine meetings.' },
                    { icon: <AlertCircle className="w-4 h-4" />, title: 'Missed Critical Actions', desc: 'Important tasks buried deep inside long email threads go unnoticed.' },
                    { icon: <Filter className="w-4 h-4" />, title: 'No Intelligent Filtering', desc: 'Important emails sit alongside newsletters and promotional clutter.' },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg text-white shrink-0" style={{ background: C }}>{p.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-[#211B34]">{p.title}</p>
                        <p className="text-xs mt-0.5 text-gray-600">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Solution */}
            <Reveal delay="0.2s">
              <div className="h-full rounded-lg bg-white p-8 shadow-sm">
                <div className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest mb-6 px-3 py-1.5 rounded-lg text-white" style={{ background: C }}>
                  <Sparkles className="w-4 h-4" /> The Solution
                </div>
                <h3 className="text-2xl font-black mb-4 text-[#211B34]">Action-Oriented AI Workflow</h3>
                <p className="leading-relaxed mb-8 text-gray-600">
                  A web-based AI-powered email assistant that transforms incoming emails into{' '}
                  <strong className="text-[#211B34]">structured, actionable workflows</strong>—generating replies, calendar events,
                  and tasks, then presenting them for user approval and execution.
                </p>

                <div className="relative space-y-0">
                  {[
                    { icon: <Mail className="w-4 h-4" />, title: 'Read & Understand', desc: 'AI parses email content, thread context, and sender intent.' },
                    { icon: <Brain className="w-4 h-4" />, title: 'Extract & Analyze', desc: 'Identify priority, deadlines, participants, and required actions.' },
                    { icon: <Layers className="w-4 h-4" />, title: 'Generate Action Objects', desc: 'Create reply drafts, calendar events, and task lists automatically.' },
                    { icon: <CheckSquare className="w-4 h-4" />, title: 'User Approves & Executes', desc: 'One-click approval with full edit control before execution.' },
                  ].map((s, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 z-10" style={{ background: C }}>
                          {s.icon}
                        </div>
                        {i < 3 && <div className="w-0.5 h-full mt-1 bg-gray-200" />}
                      </div>
                      <div className="pb-6">
                        <p className="text-sm font-bold mb-0.5 text-[#211B34]">{s.title}</p>
                        <p className="text-xs text-gray-600">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ PIPELINE ══ */}
      <section id="pipeline" className="py-24 bg-white relative overflow-hidden">
        {/* Animated rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full animate-spin-slow pointer-events-none border border-gray-100" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full animate-spin-slow-reverse pointer-events-none border border-gray-50" />

        <div className="container mx-auto px-6 relative z-10">
          <Reveal className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest mb-3 block text-gray-500">Core Architecture</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#211B34]">The Unified Pipeline</h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Every email flows through a deterministic AI pipeline that transforms raw content into executable outcomes.
            </p>
          </Reveal>

          {/* Pipeline nodes */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-2 max-w-5xl mx-auto mb-16">
            <PipelineNode icon={<Inbox className="w-6 h-6 text-white" />} label="Email In" shade="#9ca3af" delay="0.1s" />
            <PipelineArrow delay="0.2s" />
            <PipelineNode icon={<Filter className="w-6 h-6 text-white" />} label="Filter" shade="#6b7280" delay="0.3s" />
            <PipelineArrow delay="0.4s" />
            <PipelineNode icon={<Brain className="w-6 h-6 text-white" />} label="AI Analyze" shade={C} delay="0.5s" />
            <PipelineArrow delay="0.6s" />
            <PipelineNode icon={<Layers className="w-6 h-6 text-white" />} label="Actions" shade="#6d28d9" delay="0.7s" />
            <PipelineArrow delay="0.8s" />
            <PipelineNode icon={<ShieldCheck className="w-6 h-6 text-white" />} label="Approval" shade="#8b5cf6" delay="0.9s" />
            <PipelineArrow delay="1.0s" />
            <PipelineNode icon={<Zap className="w-6 h-6 text-white" />} label="Execute" shade="#5b21b6" delay="1.1s" />
          </div>
        </div>
      </section>

      {/* ══ PROCESSING STRATEGY ══ */}
      <section id="process" className="py-28 relative overflow-hidden bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <Reveal className="text-center mb-20">
            <span className="text-xs font-bold uppercase tracking-widest mb-3 block text-gray-500">Under the Hood</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#211B34]">Email Processing Strategy</h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Smart decisions about <em>which</em> emails to process and <em>how</em> to do it efficiently at scale.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Filter className="w-6 h-6" style={{ color: C }} />,
                title: 'Relevance Filtering',
                points: [
                  'Process only recent emails (last 24 hours)',
                  'Focus on unread and starred messages',
                  'Automatically skip promotions & social tabs',
                  'Filter newsletters, auto-replies, and CC spam',
                ],
              },
              {
                icon: <Database className="w-6 h-6" style={{ color: C }} />,
                title: 'Batch Processing',
                points: [
                  'Process 5–10 emails per API batch call',
                  'Reduces LLM token usage by ~60%',
                  'Parallel processing for faster results',
                  'Queue management for large inboxes',
                ],
              },
              {
                icon: <RefreshCw className="w-6 h-6" style={{ color: C }} />,
                title: 'Smart Caching',
                points: [
                  'Track processed email IDs in MongoDB',
                  'Never reprocess an already-analyzed email',
                  'Cache AI results for 24-hour sessions',
                  'Incremental sync: fetch only new emails',
                ],
              },
            ].map((s, i) => (
              <Reveal key={i} delay={`${0.1 * i}s`}>
                <div className="h-full rounded-lg bg-white p-7 shadow-sm">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-5 bg-gray-50">{s.icon}</div>
                  <h3 className="text-lg font-black mb-4 text-[#211B34]">{s.title}</h3>
                  <ul className="space-y-2.5">
                    {s.points.map((p, pi) => (
                      <li key={pi} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="py-28 relative overflow-hidden bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <Reveal className="text-center mb-20">
            <span className="text-xs font-bold uppercase tracking-widest mb-3 block text-gray-500">Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#211B34]">Key Features</h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Six deeply integrated features that transform passive email reading into active workflow execution.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Reveal delay="0.1s">
              <FeatureCard
                icon={<MessageSquare className="w-6 h-6" style={{ color: C }} />}
                title="Intelligent Reply Drafting"
                badge="Core"
                description="Automatically generates context-aware, professional replies by analyzing email thread history, sender relationship, and urgency level."
                flow={[
                  { step: 'Context Extraction', detail: 'Reads the full thread and identifies the key ask or question.' },
                  { step: 'Tone Selection', detail: 'Picks Formal, Friendly, or Assertive based on sender & content.' },
                  { step: 'Draft Generation', detail: 'LLM produces a complete, ready-to-send reply draft.' },
                  { step: 'User Refinement', detail: 'Edit, regenerate, or change tone before one-click send.' },
                ]}
              />
            </Reveal>

            <Reveal delay="0.15s">
              <FeatureCard
                icon={<ShieldCheck className="w-6 h-6" style={{ color: C }} />}
                title="Priority Detection"
                badge="Trust"
                description="Classifies every email with a priority level and provides human-readable reasoning — building transparency and user trust in AI decisions."
                flow={[
                  { step: 'Signal Detection', detail: 'Scans for keywords, deadlines, sender VIP status, and tone.' },
                  { step: 'Priority Assignment', detail: 'Labels as Urgent, Action Required, or FYI.' },
                  { step: 'Reason Generation', detail: 'Explains why: "Deadline detected", "Client email", "Negative tone".' },
                  { step: 'Visual Indicators', detail: 'Color-coded badges give instant visual clarity in the inbox.' },
                ]}
              />
            </Reveal>

            <Reveal delay="0.2s">
              <FeatureCard
                icon={<Calendar className="w-6 h-6" style={{ color: C }} />}
                title="Calendar Event Automation"
                badge="Integration"
                description="Detects meeting requests inside emails and extracts all required details to create a ready-to-confirm calendar event."
                flow={[
                  { step: 'Meeting Detection', detail: 'Identifies scheduling-intent phrases and temporal references.' },
                  { step: 'Entity Extraction', detail: 'Pulls date, time, duration, location, and attendees.' },
                  { step: 'Event Draft', detail: 'Pre-fills a calendar event ready for review and editing.' },
                  { step: 'Google Calendar Sync', detail: 'One-click creation in Google Calendar upon approval.' },
                ]}
              />
            </Reveal>

            <Reveal delay="0.25s">
              <FeatureCard
                icon={<CheckSquare className="w-6 h-6" style={{ color: C }} />}
                title="Task List Extraction"
                badge="Productivity"
                description="Identifies every actionable item buried in an email thread and surfaces them as structured tasks with deadlines."
                flow={[
                  { step: 'Action Item Detection', detail: 'Finds requests, deliverables, and commitments in the body.' },
                  { step: 'Deadline Inference', detail: 'Links temporal phrases to specific due dates.' },
                  { step: 'Task Structuring', detail: 'Creates a checklist with title, description, and deadline.' },
                  { step: 'Daily Dashboard', detail: 'All tasks appear in a centralized view, grouped by priority.' },
                ]}
              />
            </Reveal>

            <Reveal delay="0.3s">
              <FeatureCard
                icon={<Layers className="w-6 h-6" style={{ color: C }} />}
                title="Multi-Action Orchestration"
                badge="Agentic"
                description="A single email can trigger multiple simultaneous actions that the user reviews and approves in one unified panel."
                flow={[
                  { step: 'Parallel Analysis', detail: 'AI simultaneously generates all relevant action objects.' },
                  { step: 'Action Bundling', detail: 'Reply + Calendar + Tasks shown in one side panel.' },
                  { step: 'Individual Control', detail: 'Approve, edit, or reject each action independently.' },
                  { step: 'Batch Execution', detail: 'Approve all actions at once for maximum efficiency.' },
                ]}
              />
            </Reveal>

            <Reveal delay="0.35s">
              <FeatureCard
                icon={<Lock className="w-6 h-6" style={{ color: C }} />}
                title="Human-in-the-Loop"
                badge="Safety"
                description="All AI-generated actions are gated behind human review. The system suggests and prepares — the human decides."
                flow={[
                  { step: 'Action Preview', detail: 'All outputs are shown before any action is taken.' },
                  { step: 'Inline Editing', detail: 'Modify any AI-generated content directly in the panel.' },
                  { step: 'Explicit Approval', detail: 'Each action requires a conscious "Approve" click to execute.' },
                  { step: 'Rejection & Feedback', detail: 'Reject actions; system learns from user preferences over time.' },
                ]}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-28 relative overflow-hidden" style={{ background: C }}>
        {/* Animated rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {[300, 450, 600].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size, height: size,
                top: -size / 2, left: -size / 2,
                border: '1px solid rgba(255,255,255,0.08)',
                animation: `pulse-ring ${3 + i}s cubic-bezier(0.215, 0.61, 0.355, 1) ${i * 0.8}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest mb-8 bg-white/10 text-white">
              <Star className="w-3.5 h-3.5 fill-white text-white" /> Live Interactive Demo
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Experience It<br />
              <span className="text-white/70">Firsthand</span>
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-white/80">
              The live demo simulates the complete agentic pipeline — real AI outputs, real approval flows,
              real inbox structure. No signup required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStart}
                className="group px-10 py-5 bg-white rounded-lg font-black text-xl transition-opacity hover:opacity-90 flex items-center gap-3 shadow-xl"
                style={{ color: C }}
              >
                <Zap className="w-6 h-6" />
                Launch Interactive Demo
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="mt-10 flex items-center justify-center gap-8 text-sm text-white/70">
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /> No login required</div>
              <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Full control</div>
              <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> All features accessible</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg" style={{ background: C }}>
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-[#211B34]">Email<span className="text-gray-500">Assist</span></span>
          </div>
          <p className="text-sm text-gray-500">© 2026 EmailAssist · AI-Powered Email Management</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <span className="hover:opacity-70 cursor-pointer transition-opacity">Documentation</span>
            <span className="hover:opacity-70 cursor-pointer transition-opacity">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
