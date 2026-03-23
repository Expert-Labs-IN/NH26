"use client";

import { Card } from './ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function FraudTimeHeatmap({ data }: { data: any[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getRate = (day: string, hour: number) => {
    const item = data.find(d => d.day === day && d.hour === hour);
    return item ? item.rate : 0;
  };

  const getColor = (rate: number) => {
    if (rate === 0) return 'bg-slate-100';
    if (rate < 0.5) return 'bg-indigo-100';
    if (rate < 1) return 'bg-indigo-300';
    if (rate < 2) return 'bg-rose-400';
    return 'bg-rose-600';
  };

  return (
    <Card className="flex flex-col h-80">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Fraud Time Heatmap</h2>
      <div className="flex-1 w-full flex flex-col min-h-0 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
        <div className="flex text-[9px] text-slate-500 mb-1 ml-8" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
          {hours.map(h => <div key={h} className="flex-1 text-center">{h}</div>)}
        </div>
        {days.map(day => (
          <div key={day} className="flex flex-1 items-center gap-1 mb-1">
            <div className="w-8 text-[10px] text-slate-500 text-right pr-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{day}</div>
            <div className="flex flex-1 gap-1 h-full">
              {hours.map(hour => {
                const rate = getRate(day, hour);
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`flex-1 rounded-sm transition-colors hover:border hover:border-slate-400/50 ${getColor(rate)}`}
                    title={`${day} ${hour}:00 - Rate: ${rate.toFixed(2)}`}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-rose-400 mt-2 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>Insight: Fraud concentrated on weekends and late hours.</p>
    </Card>
  );
}

export function ThresholdIndicator() {
  return (
    <Card className="flex flex-col h-80 justify-center">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Threshold Indicator</h2>
      <div className="flex-1 flex flex-col justify-center min-h-0 gap-6">
        <div className="relative pt-8 pb-4">
          <div className="flex items-center w-full h-8 cursor-default">
            <div className="h-full bg-emerald-100 border border-emerald-300 rounded-l-md group relative" style={{ width: '80%' }}>
              <div className="absolute -top-6 left-2 text-[10px] text-emerald-600 font-bold tracking-widest uppercase">Safe Zone</div>
              <div className="h-full flex items-center pl-2 text-xs font-bold text-emerald-700">185,002</div>
            </div>
            <div className="h-full bg-rose-100 border border-rose-300 flex-1 rounded-r-md group relative">
              <div className="absolute -top-6 right-2 text-[10px] text-rose-600 font-bold tracking-widest uppercase">Danger Zone ($500+)</div>
              <div className="h-full flex items-center justify-end pr-2 text-xs font-bold text-rose-700">14,617 (669 FLAG)</div>
            </div>
            <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)] z-10" />
            <div className="absolute top-14 left-[80%] -translate-x-1/2 text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded border border-yellow-300">
              THRESHOLD ($500)
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-yellow-500 mt-2 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>Insight: A single threshold rule captures all fraud cases.</p>
    </Card>
  );
}

export function FalsePositiveDonut() {
  const data = [
    { name: 'Safe (Approved)', value: 185002, color: '#059669' },
    { name: 'Flagged (Review)', value: 669, color: '#e11d48' },
    { name: 'False Positives', value: 120, color: '#d97706' }
  ];

  return (
    <Card className="flex flex-col h-80">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>False Positive Ratio</h2>
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', fontFamily: 'var(--font-jetbrains-mono)' }}
              itemStyle={{ color: '#0f172a' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
          <span className="text-2xl font-bold text-slate-900 tracking-tighter" style={{ fontFamily: 'var(--font-space-grotesk)' }}>0.34%</span>
          <span className="text-[9px] uppercase tracking-widest text-slate-500 mt-1" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Fraud Rate</span>
        </div>
      </div>
      <p className="text-xs text-emerald-400 mt-2 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>Insight: Majority is safe; small % requires attention.</p>
    </Card>
  );
}

export function AIInsightPanel({ data }: { data: any }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const fullText = `CRITICAL: ${data?.critical || "..."}\nPATTERN: ${data?.pattern || "..."}\nRECOMMEND: ${data?.recommend || "..."}`;

  useEffect(() => {
    if (!data) return;
    let i = 0;
    setDisplayedText("");
    const intervalId = setInterval(() => {
      setDisplayedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(intervalId);
      }
    }, 20);
    return () => clearInterval(intervalId);
  }, [data, fullText]);

  return (
    <Card className="flex flex-col h-full border-indigo-200">
      <div className="flex justify-between items-center mb-4 border-b border-indigo-100 pb-2">
        <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          AI Insight Narrator
        </h2>
      </div>
      <div className="flex-1 min-h-0 relative">
        <pre className="text-sm text-indigo-900 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
          {displayedText}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-2 h-4 bg-indigo-400 ml-1 align-middle"
          />
        </pre>
      </div>
    </Card>
  );
}
