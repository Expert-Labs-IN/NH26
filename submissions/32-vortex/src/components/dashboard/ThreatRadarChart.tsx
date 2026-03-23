
"use client";

import useSWR from "swr";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Crosshair, ShieldAlert, Zap, CheckCircle2 } from "lucide-react";
import { AnimatedReveal, AnimatedText, ANIMATION_EASING } from "@/components/ui/AnimatedReveal";
import { motion } from "framer-motion";


export function ThreatRadarChart() {
  const { data, isLoading } = useSWR("/api/radar");

  if (isLoading || !data) {
    return <div className="bg-slate-900 rounded-3xl h-[400px] animate-pulse border border-slate-800 shadow-soft" />;
  }

  // Calculate overall threat level (average of the vectors)
  const avgScore = Math.round(data.reduce((acc: number, cur: any) => acc + cur.score, 0) / data.length);
  let threatStatus = "MODERATE";
  let statusColor = "text-amber-400";
  let statusBg = "bg-amber-400/10";
  
  if (avgScore > 65) {
    threatStatus = "CRITICAL";
    statusColor = "text-rose-500";
    statusBg = "bg-rose-500/10";
  } else if (avgScore < 30) {
    threatStatus = "LOW";
    statusColor = "text-emerald-400";
    statusBg = "bg-emerald-400/10";
  }


  return (
    <AnimatedReveal delay={0.9}>
      <div data-chart="threat-radar" className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden h-[400px] flex flex-col relative group">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none transition-opacity duration-700 group-hover:bg-indigo-500/10" />

        {/* Header */}
        <div className="p-5 border-b border-slate-100 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 1.0, 
                  duration: 0.6,
                  ease: ANIMATION_EASING
                }}
              >
                <Crosshair className="h-5 w-5" />
              </motion.div>
              <AnimatedText delay={1.05}>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Attack Signature</h3>
                  <p className="text-xs text-slate-500 font-medium">Real-time threat vectors</p>
                </div>
              </AnimatedText>
            </div>
            <AnimatedText delay={1.1}>
              <div className={`px-3 py-1.5 rounded-full text-xs font-black tracking-widest border ${statusColor} ${statusBg} border-current/20 flex items-center gap-1.5`}>
                <ShieldAlert className="h-3.5 w-3.5" />
                {threatStatus}
              </div>
            </AnimatedText>
          </div>
        </div>

        {/* Chart Area */}
        <motion.div 
          className="flex-1 p-2 relative z-10 min-h-0 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.5 }}
        >
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={false} 
                  axisLine={false} 
                />
                <Radar
                  name="Threat Vector"
                  dataKey="score"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="#6366F1"
                  fillOpacity={0.2}
                  isAnimationActive={true}
                  animationBegin={1200}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
                <Tooltip 
                  cursor={false}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px', 
                    color: '#0F172A',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                  formatter={(value: any) => [`${value}/100`, 'Severity']}
                  itemStyle={{ fontSize: '13px', fontWeight: 700, color: '#4F46E5' }}
                  labelStyle={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Mitigation Action Bar */}
        </motion.div>
      </div>
    </AnimatedReveal>
  );
}
