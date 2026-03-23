"use client";

import useSWR from "swr";
import { Activity } from "lucide-react";
import { AnimatedReveal, AnimatedText, ANIMATION_EASING } from "@/components/ui/AnimatedReveal";
import { motion } from "framer-motion";


const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HeatmapChart() {
  const { data, isLoading } = useSWR("/api/heatmap");

  if (isLoading || !data || !Array.isArray(data)) {
    return (
      <div className="bg-white rounded-3xl h-[380px] animate-pulse border border-stone-200/50 shadow-soft" />
    );
  }

  let maxVal = 0;
  
  // Transform the flat array of objects into the 2D array format expected by the component
  // API returns: [{day: "Mon", hour: 0, count: 5}, ...]
  // We need: [[day0hour0, day0hour1...], [day1hour0, day1hour1...]]
  const heatmapData = Array(7).fill(0).map(() => Array(24).fill(0));
  
  if (data && Array.isArray(data) && data.length > 0) {
    if (typeof data[0] === 'object' && data[0].day !== undefined) {
      data.forEach(item => {
        const dayIdx = DAYS.indexOf(item.day);
        if (dayIdx !== -1 && item.hour >= 0 && item.hour < 24) {
          heatmapData[dayIdx][item.hour] = item.count;
          if (item.count > maxVal) maxVal = item.count;
        }
      });
    } else {
      // Fallback for old format
      data.forEach((dayRow: number[]) => {
        if (Array.isArray(dayRow)) {
          dayRow.forEach((val: number) => {
            if (val > maxVal) maxVal = val;
          });
        }
      });
    }
  }

  const getColor = (val: number) => {
    if (val === 0) return "bg-slate-100";
    const intensity = val / maxVal;
    if (intensity < 0.2) return "bg-primary-100";
    if (intensity < 0.4) return "bg-primary-200";
    if (intensity < 0.6) return "bg-primary-300";
    if (intensity < 0.8) return "bg-primary-400";
    return "bg-primary-600 shadow-glow-primary";
  };

  return (
    <AnimatedReveal delay={0.5}>
      <div data-chart="heatmap" className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden h-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <motion.div 
                className="bg-slate-100 p-2 rounded-xl text-primary-600"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.6, 
                  duration: 0.6,
                  ease: ANIMATION_EASING
                }}
              >
                <Activity className="h-5 w-5" />
              </motion.div>
              <AnimatedText delay={0.65}>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Fraud Heatmap</h3>
                  <p className="text-xs text-slate-400 font-medium">7-day × 24-hour incident density</p>
                </div>
              </AnimatedText>
            </div>
            
            {/* Legend */}
            <AnimatedReveal delay={0.7}>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span className="text-xs font-bold text-slate-500 tracking-wider">LOW</span>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-3 h-3 rounded-sm ${i === 0 ? 'bg-slate-200' : i === 1 ? 'bg-primary-200' : i === 2 ? 'bg-primary-400' : 'bg-primary-600'}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.75 + (i * 0.05),
                        duration: 0.4,
                        ease: ANIMATION_EASING
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-500 tracking-wider">HIGH</span>
              </div>
            </AnimatedReveal>
          </div>
        </div>

        {/* Heatmap Grid */}
        <motion.div 
          className="p-6 overflow-x-auto overflow-y-hidden flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="min-w-[800px]">
            {/* Hour Labels - Aligned with the 24 columns */}
            <div className="flex mb-4 pl-12">
              <div className="flex-1 flex justify-between">
                {[0, 6, 12, 18, 23].map((h) => (
                  <div key={h} className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center" style={{ width: `${(1/24)*100}%`, marginLeft: h === 0 ? 0 : `${(h - [0, 6, 12, 18, 23][[0, 6, 12, 18, 23].indexOf(h)-1] - 1)/24 * 100}%` }}>
                    {h === 0 ? '12am' : h === 12 ? '12pm' : h > 12 ? `${h-12}pm` : `${h}am`}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Rows */}
            <div className="flex flex-col gap-2">
              {DAYS.map((day, dIdx) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-8 text-xs font-bold text-slate-600 text-right uppercase tracking-wider">{day}</div>
                  <div className="flex-1 flex gap-1.5">
                    {heatmapData[dIdx].map((val: number, hIdx: number) => (
                      <motion.div
                        key={hIdx}
                        title={`${day} ${hIdx}:00 — ${val} flagged`}
                        className={`
                          flex-1 h-6 sm:h-8 rounded-sm transition-all duration-200
                          hover:scale-110 hover:z-10 cursor-pointer
                          ${getColor(val)}
                        `}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.85 + (dIdx * 0.05) + (hIdx * 0.002),
                          duration: 0.4,
                          ease: ANIMATION_EASING
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedReveal>
  );
}
