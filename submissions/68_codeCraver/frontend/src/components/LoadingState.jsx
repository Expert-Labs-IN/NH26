import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, Cpu } from 'lucide-react'

export default function LoadingState() {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-bg2 rounded-[var(--radius)] border border-border p-10 text-center min-h-[400px] flex flex-col items-center justify-center"
        >
            <Loader2 size={36} className="text-accent animate-spin mb-4" />
            <div className="text-[15px] font-bold text-text2 mb-1 flex items-center gap-2">
                <Cpu size={16} className="text-accent" /> AI is writing your copy…
            </div>
            <div className="text-xs text-text3">Analysing specs and generating 3 platform variants</div>
            <div className="flex flex-col gap-2 mt-6 w-full max-w-[200px]">
                {[120, 80, 100].map((w, i) => (
                    <motion.div
                        key={i}
                        className="h-3.5 mx-auto bg-gradient-to-r from-bg3 via-border to-bg3 rounded-md animate-[shimmer_1.4s_infinite]"
                        style={{ width: w, backgroundSize: '400px 100%' }}
                    />
                ))}
            </div>
        </motion.div>
    )
}
