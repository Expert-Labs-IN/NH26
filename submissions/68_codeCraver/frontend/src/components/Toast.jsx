import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export default function Toast({ toast }) {
    return (
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50, transition: { duration: 0.2 } }}
                    className={`fixed bottom-6 right-6 z-[999] px-5 py-3 rounded-xl text-[13px] font-semibold text-white shadow-lg flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-text'
                        }`}
                >
                    {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                    {toast.msg}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
