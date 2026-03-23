"use client";

import useSWR from "swr";
import { Activity, AlertTriangle, Plane, TrendingUp, Clock, CalendarDays } from "lucide-react";
import { AnimatedReveal, AnimatedNumber, AnimatedText, ANIMATION_EASING } from "@/components/ui/AnimatedReveal";
import { motion } from "framer-motion";


export function KPICards() {
  const { data, isLoading } = useSWR("/api/stats");

  if (isLoading || !data) return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white/60 backdrop-blur rounded-2xl h-[120px] animate-pulse border border-stone-200/50" />
      ))}
    </div>
  );

  const kpis = [
    {
      title: "Total Transactions",
      value: data.totalTransactions?.toLocaleString() || "0",
      icon: Activity,
      subtitle: "All processed",
      accent: "bg-primary-500",
      bgClass: "bg-white hover:bg-slate-50",
      iconBg: "bg-primary-50 text-primary-600 border-primary-100",
    },
    {
      title: "Flagged Fraud",
      value: data.flaggedTransactions?.toLocaleString() || "0",
      icon: AlertTriangle,
      subtitle: `${data.fraudRate || 0}% rate`,
      accent: "bg-rose-500",
      bgClass: "bg-white hover:bg-slate-50",
      iconBg: "bg-rose-50 text-rose-600 border-rose-100",
      highlight: true,
    },
    {
      title: "Impossible Travel",
      value: data.impossibleTravel?.toLocaleString() || "0",
      icon: Plane,
      subtitle: "Velocity alerts",
      accent: "bg-rose-500",
      bgClass: "bg-white hover:bg-slate-50",
      iconBg: "bg-rose-50 text-rose-600 border-rose-100",
      highlight: true,
    },
    {
      title: "Top Risk Category",
      value: data.highestRiskCategory ? data.highestRiskCategory.split(' (')[0] : "N/A",
      icon: TrendingUp,
      subtitle: data.highestRiskCategory && data.highestRiskCategory.includes('(') 
        ? `${data.highestRiskCategory.split(' (')[1].replace(')', '')} fraud rate` 
        : "By percentage",
      accent: "bg-primary-500",
      bgClass: "bg-white hover:bg-slate-50",
      iconBg: "bg-primary-50 text-primary-600 border-primary-100",
    },
    {
      title: "Velocity Spike Users",
      value: data.velocitySpikeUsers?.toLocaleString() || "0",
      icon: Clock,
      subtitle: "UTC window",
      accent: "bg-rose-500",
      bgClass: "bg-white hover:bg-slate-50",
      iconBg: "bg-rose-50 text-rose-600 border-rose-100",
      highlight: true,
    },
    {
      title: "Fraud Rate",
      value: `${data.fraudRate || 0}%`,
      icon: CalendarDays,
      subtitle: "Weekly incidents",
      accent: "bg-primary-500",
      bgClass: "bg-white hover:bg-slate-50 text-slate-900",
      iconBg: "bg-primary-50 text-primary-600 border-primary-100",
      darkTheme: false,
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 text-slate-900">
      {kpis.map((kpi, i) => (
        <AnimatedReveal key={i} delay={0.1 + (i * 0.05)} className="h-full">
          <div 
            className={`relative rounded-2xl p-5 border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden h-full flex flex-col justify-between ${kpi.bgClass || 'bg-white border-slate-200'}`}
          >
            {/* Subtle Accent Glow */}
            {!kpi.darkTheme && (
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 ${kpi.accent} pointer-events-none`} />
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                className={`${kpi.iconBg} p-2.5 rounded-xl border group-hover:scale-110 transition-transform duration-300 shrink-0`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.15 + (i * 0.05), 
                  duration: 0.6,
                  ease: ANIMATION_EASING
                }}
              >
                <kpi.icon className="h-4 w-4" />
              </motion.div>
              <AnimatedText delay={0.2 + (i * 0.05)} className="min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${kpi.darkTheme ? 'text-primary-200' : 'text-slate-500'} leading-tight`}>
                  {kpi.title}
                </p>
              </AnimatedText>
            </div>
            
            <div className="space-y-1 relative z-10">
              <AnimatedText delay={0.25 + (i * 0.05)}>
                <p 
                  className={`${String(kpi.value).length > 12 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'} font-black tracking-tight line-clamp-2 leading-tight ${kpi.highlight ? 'text-rose-600' : kpi.darkTheme ? 'text-white' : 'text-slate-900'}`}
                  title={String(kpi.value)}
                >
                  {kpi.value}
                </p>
              </AnimatedText>
              <AnimatedText delay={0.3 + (i * 0.05)}>
                <p className={`text-[11px] font-bold uppercase tracking-wider truncate ${kpi.darkTheme ? 'text-primary-300' : 'text-slate-400'}`}>
                  {kpi.subtitle}
                </p>
              </AnimatedText>
            </div>
          </div>
        </AnimatedReveal>
      ))}
    </div>
  );
}
