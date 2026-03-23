"use client";

import { useState, useRef } from "react";
import useSWR, { SWRConfig } from "swr";
import { exportDashboardToPDF } from "@/components/pdf/exportPDF";
import { KPICards } from "@/components/dashboard/KPICards";
import { HeatmapChart } from "@/components/dashboard/HeatmapChart";
import { VelocityChart } from "@/components/dashboard/VelocityChart";
import { MerchantChart } from "@/components/dashboard/MerchantChart";
import { CityChart } from "@/components/dashboard/CityChart";
import { FalsePositiveChart } from "@/components/dashboard/FalsePositiveChart";
import { LiveFeed } from "@/components/dashboard/LiveFeed";
import { ImpossibleTravelFeed } from "@/components/dashboard/Feeds";
import { FlaggedCategoryChart } from "@/components/dashboard/FlaggedCategoryChart";
import { ThreatRadarChart } from "@/components/dashboard/ThreatRadarChart";
import { SimulationAlerts } from "@/components/dashboard/SimulationAlerts";
import { AIChat } from "@/components/ai/AIChat";
import { Shield, Sparkles, TrendingUp, Zap, Play, Square, RotateCcw, Download } from "lucide-react";
import { AnimatedText } from "@/components/ui/AnimatedReveal";

export default function Dashboard() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { data: stats } = useSWR("/api/stats");
  const { data: cityStats } = useSWR("/api/cities");
  const { data: merchantStats } = useSWR("/api/merchant");
  const dashboardRef = useRef<HTMLDivElement>(null);

  const toggleSimulation = async () => {
    const newState = !isSimulating;
    setIsSimulating(newState);
    await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: newState ? "start" : "stop" })
    });
  };

  const resetData = async () => {
    if (isSimulating) {
      await toggleSimulation(); // stop it first
    }
    await fetch("/api/simulate/reset", { method: "POST" });
    window.location.reload(); // Hard refresh to reset all UI states instantly
  };

  const exportPDF = async () => {
    if (!stats) return;
    try {
      setIsExporting(true);
      
      // Give it a tiny moment to ensure any pending renders settle
      await new Promise(r => setTimeout(r, 100));

      await exportDashboardToPDF(stats, cityStats, merchantStats, {
        includeCharts: true,
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SWRConfig value={{ 
      refreshInterval: isSimulating ? 1500 : 0,
      fetcher: (url: string) => fetch(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`).then(res => res.json())
    }}>
      <div className="min-h-screen bg-slate-100 relative pb-20" ref={dashboardRef}>
        {/* Subtle Grid Pattern */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000004_1px,transparent_1px),linear-gradient(to_bottom,#00000004_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Main Content */}
        <div className="relative z-10 font-outfit">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="mx-auto px-4 py-3 items-center">
              <div className="flex items-center justify-between">
                {/* Page Title */}
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                      Overview
                    </h1>
                  </div>
                </div>

                {/* Quick Stats Pills */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    <Zap className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-700">
                      {stats?.totalTransactions?.toLocaleString() || '---'} Transactions
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    <TrendingUp className="h-3.5 w-3.5 text-primary-600" />
                    <span className="text-xs font-bold text-slate-700">
                      {stats?.fraudRate || '---'}% Fraud
                    </span>
                  </div>
                  
                  {/* Simulation Toggle Button */}
                  <button 
                    onClick={toggleSimulation}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm ${
                      isSimulating 
                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200 animate-pulse' 
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'
                    }`}
                  >
                    {isSimulating ? (
                      <>
                        <Square className="h-3.5 w-3.5 fill-current" />
                        Stop Simulation
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Live Attack Sim
                      </>
                    )}
                  </button>

                  <button 
                    onClick={resetData}
                    title="Reset to Original CSV Data"
                    className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-lg border border-slate-200 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>

                  <button 
                    onClick={exportPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg text-white font-semibold text-xs hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {isExporting ? 'Exporting...' : 'Export PDF'}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Grid */}
          <main className="mx-auto px-4 py-4 max-w-[1600px]">
            {/* Hero KPI Section */}
            <section id="overview" className="mb-4 scroll-mt-24">
              <AnimatedText delay={0.05}>
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Core Analytics</h2>
              </AnimatedText>
              <KPICards />
            </section>

            {/* Dashboard Layout */}
            <div className="flex flex-col xl:flex-row gap-4">
              {/* Left Column (Main Content) */}
              <div className="flex-1 flex flex-col gap-4 min-w-0">
                <section id="velocity" className="scroll-mt-24">
                  <VelocityChart />
                </section>
                
                <section id="heatmap" className="scroll-mt-24">
                  <HeatmapChart />
                </section>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MerchantChart />
                  <CityChart />
                </div>

                {/* Risk Section */}
                <section id="risk" className="mt-2 scroll-mt-24 flex flex-col gap-4">
                  <AnimatedText delay={0.75}>
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Risk & Threat Intelligence</h2>
                  </AnimatedText>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FalsePositiveChart />
                    <ImpossibleTravelFeed />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ThreatRadarChart />
                    <FlaggedCategoryChart />
                  </div>
                </section>
              </div>

              {/* Right Column (Sidebar) */}
              <div className="w-full xl:w-[380px] shrink-0">
                <section id="alerts" className="sticky top-[80px] h-[calc(100vh-100px)] scroll-mt-24">
                  <LiveFeed />
                </section>
              </div>
            </div>
          </main>
        </div>

        {/* Floating Components */}
        <SimulationAlerts isSimulating={isSimulating} />
        <AIChat />
      </div>
    </SWRConfig>
  );
}
