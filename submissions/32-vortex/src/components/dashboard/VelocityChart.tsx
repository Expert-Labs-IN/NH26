"use client";

import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Zap } from "lucide-react";
import { AnimatedReveal, AnimatedText, ANIMATION_EASING } from "@/components/ui/AnimatedReveal";
import { motion } from "framer-motion";

export function VelocityChart() {
  const { data, isLoading } = useSWR("/api/velocity");

  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-2xl h-[360px] animate-pulse border border-slate-200 shadow-soft" />
    );
  }

  const chartData = data.map((d: { time: string, volume: number, spikes: number }) => ({
    time: d.time,
    legitimate: d.volume - d.spikes,
    fraudulent: d.spikes,
  }));

  return (
    <AnimatedReveal delay={0.2}>
      <div data-chart="velocity" className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden h-[360px] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <AnimatedText delay={0.3} className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: ANIMATION_EASING }}
            >
              <Zap className="h-5 w-5 text-indigo-500 fill-indigo-500" />
            </motion.div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Transaction Velocity</h3>
          </AnimatedText>
          
          <AnimatedText delay={0.4} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div 
                className="h-2 w-2 rounded-full bg-slate-300"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5, ease: ANIMATION_EASING }}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Legitimate</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div 
                className="h-2 w-2 rounded-full bg-indigo-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5, ease: ANIMATION_EASING }}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fraudulent</span>
            </div>
          </AnimatedText>
        </div>

        <motion.div 
          className="flex-1 p-6 pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <ResponsiveContainer width="100%" height="100%" minHeight={150}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
                tickFormatter={(val) => `${val}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6366F1', fontSize: 10, fontWeight: 600 }}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip 
                cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  border: 'none',
                  borderRadius: '12px', 
                  color: '#fff',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  padding: '12px 16px'
                }}
              />
              <Line
                yAxisId="left"
                type="linear"
                dataKey="legitimate"
                stroke="#CBD5E1"
                strokeWidth={2}
                dot={{ fill: '#94A3B8', r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={1000}
                animationBegin={500}
              />
              <Line
                yAxisId="right"
                type="linear"
                dataKey="fraudulent"
                stroke="#6366F1"
                strokeWidth={2}
                dot={{ fill: '#6366F1', r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={1000}
                animationBegin={700}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </AnimatedReveal>
  );
}
