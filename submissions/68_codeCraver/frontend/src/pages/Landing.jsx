import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Zap, ShieldCheck, BarChart3, Layers, ArrowRight, Check, Fingerprint, Brain, RefreshCw } from 'lucide-react'

const fadeIn = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5 }
})

const stats = [
    { value: '98%', label: 'AI Originality Score', sub: 'Every output is unique' },
    { value: '3', label: 'Platforms', sub: 'SEO · Instagram · LinkedIn' },
    { value: '<5s', label: 'Generation Time', sub: 'Specs to copy instantly' },
    { value: '0%', label: 'Template Usage', sub: 'Never template-based' },
]

const features = [
    {
        Icon: Fingerprint,
        title: 'Truly Original Copy',
        desc: 'Every piece of marketing copy is generated from scratch using your exact product specs. No recycled templates, no generic filler — just fresh, unique content every time.',
        color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100'
    },
    {
        Icon: Brain,
        title: 'Context-Aware AI',
        desc: 'Our AI understands product categories, materials, price points, and target audiences to craft copy that resonates with your specific market segment.',
        color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100'
    },
    {
        Icon: Layers,
        title: 'Multi-Platform Ready',
        desc: 'Get SEO descriptions, Instagram captions, and LinkedIn posts — each optimised for its platform\'s unique tone, length, and audience expectations.',
        color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100'
    },
    {
        Icon: RefreshCw,
        title: 'Regenerate Anytime',
        desc: 'Not happy with the output? Tweak your specs and regenerate. Each generation produces completely different copy — never the same result twice.',
        color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100'
    },
]

const comparisons = [
    { feature: 'Originality Score', us: '98% unique', them: '~40% recycled' },
    { feature: 'Generation Method', us: 'AI from scratch', them: 'Template fill-in' },
    { feature: 'Platform Optimisation', us: '3 platforms, tailored', them: 'One-size-fits-all' },
    { feature: 'Vision Analysis', us: 'Upload product images', them: 'Text only' },
    { feature: 'Speed', us: 'Under 5 seconds', them: '10-30 minutes manually' },
]

export default function Landing() {
    return (
        <div className="overflow-hidden">

            <section className="relative pt-20 pb-24 px-6 text-center bg-gradient-to-b from-bg2 to-bg border-b border-border overflow-hidden">
                <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

                <motion.div {...fadeIn(0)} className="relative z-10">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-accent bg-accentLight px-4 py-1.5 rounded-full tracking-wide mb-6 border border-accent/10">
                        <Sparkles size={14} className="fill-current" /> AI-POWERED COPY GENERATION
                    </div>
                </motion.div>

                <motion.h1 {...fadeIn(0.1)} className="relative z-10 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5 max-w-3xl mx-auto">
                    Generate <span className="text-accent">98% unique</span> marketing copy in seconds
                </motion.h1>

                <motion.p {...fadeIn(0.2)} className="relative z-10 text-base sm:text-lg text-text2 max-w-xl mx-auto mb-8 leading-relaxed">
                    From product specs to scroll-stopping copy — powered by AI that creates fresh, original content. Never template-based.
                </motion.p>

                <motion.div {...fadeIn(0.3)} className="relative z-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Link to="/register" className="group bg-accent hover:bg-blue-700 text-white px-7 py-3 rounded-xl text-sm font-bold no-underline transition-all shadow-lg shadow-accent/20 flex items-center gap-2">
                        Start Generating Free <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link to="/login" className="text-sm font-semibold text-text2 hover:text-text no-underline transition-colors px-5 py-3 rounded-xl border border-border hover:bg-bg2">
                        Already have an account?
                    </Link>
                </motion.div>

                <motion.div {...fadeIn(0.5)} className="relative z-10 mt-14 inline-flex flex-col items-center">
                    <div className="bg-bg2 border border-border rounded-2xl px-8 py-5 shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck size={24} className="text-emerald-500" />
                            <span className="text-2xl font-extrabold tracking-tight">AI Originality Score: <span className="text-emerald-500">98%</span></span>
                        </div>
                        <div className="text-sm text-text3 flex items-center gap-4">
                            <span className="flex items-center gap-1"><Check size={14} className="text-emerald-500" /> Generated fresh</span>
                            <span className="flex items-center gap-1"><Check size={14} className="text-emerald-500" /> Not template-based</span>
                            <span className="flex items-center gap-1"><Check size={14} className="text-emerald-500" /> Unique every time</span>
                        </div>
                    </div>
                </motion.div>
            </section>

            <section className="py-16 px-6 bg-bg2 border-b border-border">
                <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="text-center p-5 rounded-xl bg-bg border border-border"
                        >
                            <div className="text-3xl font-extrabold text-accent tracking-tight">{s.value}</div>
                            <div className="text-sm font-bold text-text mt-1">{s.label}</div>
                            <div className="text-xs text-text3 mt-0.5">{s.sub}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="py-20 px-6 bg-bg">
                <div className="max-w-5xl mx-auto">
                    <motion.div {...fadeIn()} className="text-center mb-14">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent bg-accentLight px-3 py-1 rounded-full tracking-wide mb-4">
                            <Zap size={12} className="fill-current" /> WHY COPYFORGE
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                            Built for originality, not shortcuts
                        </h2>
                        <p className="text-text2 max-w-lg mx-auto">
                            Every feature is designed to produce marketing copy that's uniquely yours.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 gap-5">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className={`p-6 rounded-2xl border bg-bg2 ${f.border} hover:shadow-lg transition-shadow`}
                            >
                                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                                    <f.Icon size={20} className={f.color} />
                                </div>
                                <h3 className="text-base font-bold mb-1.5">{f.title}</h3>
                                <p className="text-sm text-text2 leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-bg2 border-t border-border">
                <div className="max-w-2xl mx-auto">
                    <motion.div {...fadeIn()} className="text-center mb-10">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent bg-accentLight px-3 py-1 rounded-full tracking-wide mb-4">
                            <BarChart3 size={12} /> COMPARISON
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                            CopyForge vs. Traditional Tools
                        </h2>
                    </motion.div>

                    <div className="bg-bg rounded-2xl border border-border overflow-hidden shadow-sm">
                        <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wide text-text3 border-b border-border">
                            <div className="p-4">Feature</div>
                            <div className="p-4 text-center text-accent bg-accentLight">CopyForge</div>
                            <div className="p-4 text-center">Others</div>
                        </div>
                        {comparisons.map((c, i) => (
                            <div key={c.feature} className={`grid grid-cols-3 text-sm ${i < comparisons.length - 1 ? 'border-b border-border' : ''}`}>
                                <div className="p-4 font-semibold text-text">{c.feature}</div>
                                <div className="p-4 text-center font-semibold text-emerald-600 bg-emerald-50/50 flex items-center justify-center gap-1.5">
                                    <Check size={14} /> {c.us}
                                </div>
                                <div className="p-4 text-center text-text3">{c.them}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-bg text-center border-t border-border">
                <motion.div {...fadeIn()} className="max-w-lg mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                        <Sparkles size={32} className="text-accent" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                        Ready to generate original copy?
                    </h2>
                    <p className="text-text2 mb-8">
                        Join CopyForge and start creating 98% unique marketing copy — for free.
                    </p>
                    <Link to="/register" className="group inline-flex items-center gap-2 bg-accent hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-sm font-bold no-underline transition-all shadow-lg shadow-accent/20">
                        Get Started Free <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </motion.div>
            </section>

            <footer className="py-8 px-6 bg-bg2 border-t border-border text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap size={16} className="text-accent fill-current" />
                    <span className="font-extrabold text-sm">CopyForge</span>
                    <span className="text-[10px] font-bold bg-accentLight text-accent px-2 py-0.5 rounded-full">AI</span>
                </div>
                <div className="text-xs text-text3">Gen-AI Product Copy Generator · IBM ThinkFest 2026</div>
            </footer>
        </div>
    )
}
