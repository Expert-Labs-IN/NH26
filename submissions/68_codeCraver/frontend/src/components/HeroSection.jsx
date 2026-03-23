import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Search, Instagram, Linkedin } from 'lucide-react'

export default function HeroSection() {
    return (
        <div className="text-center pt-12 pb-8 px-10 border-b border-border bg-bg2">
            <motion.div
                initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-accent bg-accentLight px-3 py-1 rounded-full mb-4 tracking-wide"
            >
                <Sparkles size={14} className="fill-current" /> POWERED BY GROQ AI
            </motion.div>
            <motion.h1
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                className="text-4xl sm:text-[38px] font-extrabold tracking-tight mb-3 leading-[1.1]"
            >
                From specs to scroll-stopping<br />copy in seconds
            </motion.h1>
            <motion.p
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-[15px] text-text2 max-w-[480px] mx-auto"
            >
                Upload a product image or enter specs — get SEO descriptions, Instagram captions, and LinkedIn posts instantly.
            </motion.p>

            <motion.div
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="flex justify-center flex-wrap gap-2.5 mt-5"
            >
                {[
                    { label: 'SEO Description', text: 'text-[#059669]', bg: 'bg-[#f0fdf4]', Icon: Search },
                    { label: 'Instagram Caption', text: 'text-[#e1306c]', bg: 'bg-[#fff0f6]', Icon: Instagram },
                    { label: 'LinkedIn Post', text: 'text-[#0077b5]', bg: 'bg-[#eff8ff]', Icon: Linkedin },
                ].map(b => (
                    <span key={b.label} className={`text-xs font-bold px-3.5 py-1.5 rounded-full ${b.bg} ${b.text} flex items-center gap-1.5`}>
                        <b.Icon size={13} /> {b.label}
                    </span>
                ))}
            </motion.div>
        </div>
    )
}
