"use client";

import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { useEffect, useState } from "react";

function AnimatedNumber({ value, suffix = "", isString = false, textValue = "" }: { value: number, suffix?: string, isString?: boolean, textValue?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isString) return;
    let start = 0;
    const end = value;
    const duration = 1500;
    const increment = end / (duration / 16);
    
    const animate = () => {
      start += increment;
      if (start < end) {
        setDisplayValue(Math.ceil(start));
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };
    animate();
  }, [value, isString]);

  if (isString) return <span style={{ fontFamily: 'var(--font-space-grotesk)' }}>{textValue}</span>;

  return (
    <span style={{ fontFamily: 'var(--font-space-grotesk)' }}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

export function KPIGrid({ stats, prevStats }: { stats: any, prevStats?: any }) {
  const kpis = [
    { title: "Total Transactions", value: stats.totalTransactions, insight: "Volume steady" },
    { title: "Flagged Transactions", value: stats.flaggedTransactions, insight: "Needs review", color: "text-rose-600" },
    { title: "Impossible Travel", value: stats.impossibleTravel, insight: "High alert", color: "text-orange-600" },
    { title: "Velocity Spike Users", value: stats.velocitySpikeUsers, insight: "Active bots", color: "text-amber-600" },
    { title: "Fraud Rate", value: stats.fraudRate, suffix: "%", insight: "Above threshold", color: "text-rose-600" },
    { title: "Highest Risk", value: 0, textValue: stats.highestRiskCategory, isString: true, insight: "Trending category", color: "text-indigo-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className="relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-slate-900/10 to-transparent translate-y-full group-hover:translate-y-0 transition-transform" />
          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
            {kpi.title}
          </h3>
          <div className={`text-3xl font-bold tracking-tight mb-2 ${kpi.color || "text-slate-900"}`}>
            <AnimatedNumber value={kpi.value} suffix={kpi.suffix} isString={kpi.isString} textValue={kpi.textValue} />
          </div>
          <div className="inline-block mt-2 px-2 py-0.5 bg-slate-50 rounded-full border border-slate-200">
            <span className="text-[10px] uppercase text-slate-600 font-medium" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              {kpi.insight}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
