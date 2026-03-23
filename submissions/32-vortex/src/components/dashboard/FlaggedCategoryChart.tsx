"use client";

import useSWR from "swr";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ShieldAlert } from "lucide-react";
import { AnimatedReveal, AnimatedText, ANIMATION_EASING } from "@/components/ui/AnimatedReveal";
import { motion } from "framer-motion";

interface MerchantData {
  name: string;
  size: number;
  fill?: string;
}

// Define unique colors for the different categories
const colorMap: Record<string, string> = {
  'Crypto Exchange': '#F43F5E', // Rose
  'Electronics': '#F59E0B',     // Amber
  'Groceries': '#14B8A6',       // Teal
  'Dining': '#6366F1',          // Indigo
  'Retail': '#8B5CF6',          // Violet
  'Travel': '#EC4899',          // Pink
  'Luxury Goods': '#10B981',    // Emerald
  'Online Gambling': '#EF4444'  // Red
};

export function FlaggedCategoryChart() {
  const { data, isLoading } = useSWR("/api/merchant");

  if (isLoading || !data) {
    return <div className="bg-white rounded-3xl h-[400px] animate-pulse border border-slate-200/50 shadow-soft" />;
  }

  // Filter and map the actual flagged transactions
  const processedData = data
    .filter((d: any) => d.flagged > 0)
    .map((d: any) => ({
      name: d.name,
      size: d.flagged,
      fill: colorMap[d.name] || '#94A3B8'
    }))
    .sort((a: MerchantData, b: MerchantData) => b.size - a.size);

  const totalFlags = processedData.reduce((acc: number, curr: MerchantData) => acc + curr.size, 0);

  return (
    <AnimatedReveal delay={1.0}>
      <div className="bg-white rounded-3xl border border-rose-100 shadow-soft overflow-hidden h-[400px] flex flex-col relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-5 border-b border-rose-50 bg-gradient-to-r from-white to-rose-50/30 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="bg-gradient-to-br from-rose-500 to-pink-600 p-2.5 rounded-2xl text-white shadow-sm shadow-rose-200"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 1.1, 
                  duration: 0.6,
                  ease: ANIMATION_EASING
                }}
              >
                <ShieldAlert className="h-5 w-5" />
              </motion.div>
              <AnimatedText delay={1.15}>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Risk Vectors</h3>
                  <p className="text-xs text-slate-500 font-medium">Categories highly targeted by fraud</p>
                </div>
              </AnimatedText>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <motion.div 
          className="p-5 flex-1 min-h-0 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="45%"
                outerRadius={100}
                paddingAngle={2}
                dataKey="size"
                stroke="none"
                isAnimationActive={true}
                animationBegin={1300}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {processedData.map((entry: MerchantData, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill} 
                    className="hover:opacity-80 transition-all duration-300 cursor-pointer drop-shadow-sm"
                  />
                ))}
              </Pie>
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  padding: '12px 16px',
                  zIndex: 1000
                }}
                formatter={(value: any, name: any, props: any) => [`${value.toLocaleString()} flags`, props.payload.name]}
                itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </AnimatedReveal>
  );
}