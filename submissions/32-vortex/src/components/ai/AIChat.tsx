"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, FileText, ChevronDown, Sparkles, MessageCircle } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewAlert, setHasNewAlert] = useState(true);
  const { data: insights, isLoading } = useSWR("/api/insight", fetcher, { 
    refreshInterval: 60000,
    errorRetryCount: 3
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (insights && !isOpen) {
      const timer = setTimeout(() => setHasNewAlert(true), 100);
      return () => clearTimeout(timer);
    }
  }, [insights, isOpen]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, insights]);

  return (
    <>
      {/* Floating Button & Toast */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Toast */}
        <AnimatePresence>
          {hasNewAlert && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute bottom-0 right-20 bg-white p-3 rounded-xl shadow-soft-lg border border-slate-200 w-64 cursor-pointer"
              onClick={() => { setIsOpen(true); setHasNewAlert(false); }}
            >
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-primary-500 to-pink-500 p-2 rounded-xl flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-900">AI Insights Ready</p>
                  <p className="text-xs text-stone-500 mt-0.5">New fraud patterns detected. Tap to view.</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setHasNewAlert(false); }}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsOpen(!isOpen); setHasNewAlert(false); }}
          className="relative gradient-bg p-4 rounded-2xl shadow-glow-primary text-white"
        >
          {isOpen ? <ChevronDown className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          {hasNewAlert && !isOpen && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-coral-500 border-2 border-white" />
          )}
        </motion.button>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[380px] h-[550px] bg-white rounded-3xl shadow-soft-lg border border-stone-200 z-40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-bg p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">AI Co-Pilot</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-teal-400"></span>
                    Analyzing patterns
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 bg-stone-50 space-y-4">
              {/* Welcome Message */}
              <div className="flex gap-3">
                <div className="bg-primary-100 p-2 rounded-xl h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-700" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-soft border border-stone-100 text-sm text-stone-700 leading-relaxed">
                  Hello! I&apos;m your fraud detection assistant. Here are my latest insights from the transaction data:
                </div>
              </div>

              {/* Insights */}
              {isLoading ? (
                <div className="flex gap-3">
                  <div className="bg-primary-100 p-2 rounded-xl h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-700" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-soft border border-stone-100 flex items-center gap-2">
                    <span className="animate-bounce h-2 w-2 bg-primary-400 rounded-full" style={{ animationDelay: '0ms' }}></span>
                    <span className="animate-bounce h-2 w-2 bg-primary-400 rounded-full" style={{ animationDelay: '150ms' }}></span>
                    <span className="animate-bounce h-2 w-2 bg-primary-400 rounded-full" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              ) : insights?.insight ? (
                <div className="flex gap-3">
                  <div className="bg-primary-100 p-2 rounded-xl h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-700" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-soft border border-stone-100 text-sm text-stone-700 whitespace-pre-wrap leading-relaxed italic">
                    {insights.insight}
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="bg-primary-100 p-2 rounded-xl h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-700" />
                  </div>
                  <div className="bg-coral-50 p-4 rounded-2xl rounded-tl-md border border-coral-200 text-sm text-coral-700">
                    Unable to generate insights. API may be unavailable.
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-white border-t border-stone-100">
              <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-3">Quick Actions</p>
              <a
                href="/api/onepager"
                target="_blank"
                className="flex items-center justify-center gap-2 w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                <FileText className="h-4 w-4" />
                Generate Executive Summary
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
