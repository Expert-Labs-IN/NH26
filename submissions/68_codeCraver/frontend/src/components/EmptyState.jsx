import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-bg2 rounded-[var(--radius)] border-2 border-dashed border-border py-16 px-10 text-center text-text3 flex flex-col items-center justify-center min-h-[400px]"
        >
            <Sparkles size={48} className="mb-4 text-border2" />
            <div className="text-base font-semibold text-text2 mb-1.5">
                Your generated copy will appear here
            </div>
            <div className="text-[13px]">Fill in product details or upload an image and click Generate</div>
        </motion.div>
    )
}
