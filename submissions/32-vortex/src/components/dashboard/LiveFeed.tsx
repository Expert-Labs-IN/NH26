"use client";

import useSWR from "swr";
import { useState } from "react";
import { Clock, ShieldAlert, MapPin, Store, UserX } from "lucide-react";
import { AnimatedReveal, AnimatedText, ANIMATION_EASING } from "@/components/ui/AnimatedReveal";
import { motion } from "framer-motion";


interface Alert {
  transactionId: string;
  userId: string;
  amount: number;
  category: string;
  city: string;
  timestamp: string;
}

export function LiveFeed() {
  const { data, isLoading } = useSWR<Alert[]>("/api/feed");
  const [frozenUsers, setFrozenUsers] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (isLoading || !data) {
    return <div className="bg-white rounded-2xl h-full min-h-[600px] animate-pulse border border-slate-200 shadow-soft" />;
  }

  const handleFreeze = (userId: string) => {
    setFrozenUsers(prev => new Set(prev).add(userId));
  };

  const handleDismiss = (txId: string) => {
    setDismissed(prev => new Set(prev).add(txId));
  };

  const visibleData = data.filter((tx) => !dismissed.has(tx.transactionId));

  return (
    <AnimatedReveal delay={1.1}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div 
                  className="bg-slate-100 p-2 rounded-xl text-primary-600"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 1.2, 
                    duration: 0.6,
                    ease: ANIMATION_EASING
                  }}
                >
                  <ShieldAlert className="h-5 w-5" />
                </motion.div>
              </div>
              <AnimatedText delay={1.25}>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Live Alerts</h3>
                  <p className="text-xs text-slate-400 font-medium">Real-time risk monitoring</p>
                </div>
              </AnimatedText>
            </div>
            
            <AnimatedText delay={1.3}>
              <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 uppercase tracking-widest">
                {visibleData.length} ACTIVE
              </div>
            </AnimatedText>
          </div>
        </div>

        {/* Feed List */}
        <motion.div 
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35, duration: 0.5 }}
        >
          {visibleData.slice(0, 15).map((tx, i) => {
            const isFrozen = frozenUsers.has(tx.userId);
            
            return (
              <motion.div 
                key={tx.transactionId || i}
                className={`
                  p-4 border-b last:border-b-0 border-slate-50 transition-all group
                  ${isFrozen ? 'bg-primary-50/30 font-medium' : 'hover:bg-slate-50'}
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 1.4 + (i * 0.03),
                  duration: 0.5,
                  ease: ANIMATION_EASING
                }}
              >
              <div className="flex items-start gap-4">
                {/* Status Indicator */}
                <div className="mt-1 flex flex-col items-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${isFrozen ? 'bg-primary-600' : 'bg-primary-400'} shadow-sm`} />
                  <div className="w-[1px] h-full bg-slate-100 mt-2" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm tracking-tight">{tx.userId}</span>
                        {isFrozen && (
                          <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest">
                            FROZEN
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 opacity-60">Transaction: {tx.transactionId}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`font-bold text-base ${isFrozen ? 'text-slate-400 line-through opacity-50' : 'text-slate-900'}`}>
                        ${tx.amount?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest">
                      <Store className="h-3 w-3" />
                      {tx.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest">
                      <MapPin className="h-3 w-3" />
                      {tx.city}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest">
                      <Clock className="h-3 w-3" />
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isFrozen && (
                      <button
                        onClick={() => handleFreeze(tx.userId)}
                        className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                      >
                        <UserX className="h-3 w-3" />
                        Freeze
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(tx.transactionId)}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      Safe
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
    </AnimatedReveal>
  );
}
