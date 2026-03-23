"use client";

import useSWR from "swr";
import { Plane, UserX, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { AnimatedReveal, AnimatedText, ANIMATION_EASING } from "@/components/ui/AnimatedReveal";
import { motion } from "framer-motion";


export function ImpossibleTravelFeed() {
  const { data, isLoading } = useSWR("/api/travel");

  if (isLoading || !data) {
    return <div className="bg-white rounded-3xl h-[400px] animate-pulse border border-stone-200/50 shadow-soft" />;
  }

  return (
    <AnimatedReveal delay={0.85}>
      <div className="bg-white rounded-3xl border border-stone-200/50 shadow-soft overflow-hidden h-[400px] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 rounded-2xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.95, 
                  duration: 0.6,
                  ease: ANIMATION_EASING
                }}
              >
                <Plane className="h-5 w-5 text-white" />
              </motion.div>
              <AnimatedText delay={1.0}>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Impossible Travel</h3>
                  <p className="text-xs text-stone-500">Velocity anomalies (&lt;60 min between cities)</p>
                </div>
              </AnimatedText>
            </div>
            <AnimatedText delay={1.05}>
              <div className="bg-violet-50 text-violet-700 px-3 py-1.5 rounded-full text-xs font-bold border border-violet-200">
                {data.length} Cases
              </div>
            </AnimatedText>
          </div>
        </div>

        {/* List */}
        <motion.div 
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          {data.filter((c: any) => c?.tx1 && c?.tx2).slice(0, 10).map((caseData: any, i: number) => (
            <motion.div 
              key={i} 
              className="p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 1.15 + (i * 0.03),
                duration: 0.5,
                ease: ANIMATION_EASING
              }}
            >
            <div className="flex items-start gap-3">
              <div className="bg-violet-100 p-2 rounded-xl">
                <AlertTriangle className="h-4 w-4 text-violet-600" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-stone-900 text-sm">{caseData.userId}</span>
                  <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-[10px] font-bold">
                    {caseData.timeDiffMinutes} min gap
                  </span>
                </div>

                {/* Journey visualization */}
                <div className="flex items-center gap-2 bg-stone-50 rounded-xl p-3">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-stone-700">{caseData.tx1.city}</div>
                    <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(caseData.tx1.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-violet-500">
                    <div className="h-px w-4 bg-violet-300" />
                    <ArrowRight className="h-4 w-4" />
                    <div className="h-px w-4 bg-violet-300" />
                  </div>
                  
                  <div className="flex-1 text-right">
                    <div className="text-xs font-bold text-stone-700">{caseData.tx2.city}</div>
                    <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5 justify-end">
                      <Clock className="h-3 w-3" />
                      {new Date(caseData.tx2.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
    </AnimatedReveal>
  );
}

export function RepeatOffendersList() {
  const { data, isLoading } = useSWR("/api/offenders");

  if (isLoading || !data) {
    return <div className="bg-white rounded-3xl h-[300px] animate-pulse border border-stone-200/50 shadow-soft" />;
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/50 shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-rose-500 to-coral-500 p-2.5 rounded-2xl">
              <UserX className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">High-Velocity Offenders</h3>
              <p className="text-xs text-slate-400 font-medium">Multiple flags within a 1-hour window</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Rank</th>
              <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Identity</th>
              <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Engagement</th>
              <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Exposure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.slice(0, 10).map((user: any, i: number) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors group">
                <td className="px-3 py-2 text-center">
                  <div className={`
                    mx-auto h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black
                    ${i < 3 ? 'bg-primary-600 text-white shadow-glow-primary' : 'bg-slate-100 text-slate-400'}
                  `}>
                    {i + 1}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="font-bold text-slate-900 text-xs tracking-tight">{user.userId}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 opacity-60 truncate max-w-[150px]">{user.txCount} transactions</div>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border border-red-100 whitespace-nowrap">
                    {user.flags} FLAGS
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="font-bold text-slate-900 text-xs">
                    ${user.totalAmount?.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 opacity-60">High Risk</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
