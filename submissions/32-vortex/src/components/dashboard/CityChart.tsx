"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Globe, AlertTriangle } from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { AnimatedReveal, AnimatedText, ANIMATION_EASING } from "@/components/ui/AnimatedReveal";
import { motion } from "framer-motion";


interface CityData {
  city: string;
  fraudAmount: number;
  transactions: number;
  flagged: number;
  rate: number;
  trend: number;
}

const cityCoordinates: Record<string, [number, number]> = {
  Dubai: [55.2708, 25.2048],
  London: [-0.1276, 51.5074],
  "New York": [-74.006, 40.7128],
  Sydney: [151.2093, -33.8688],
  Tokyo: [139.6917, 35.6895],
  Paris: [2.3522, 48.8566],
  Toronto: [-79.3832, 43.6532],
  Mumbai: [72.8777, 19.076],
};

const geoUrl = "/features.json";

export function CityChart() {
  const { data, isLoading } = useSWR<CityData[]>("/api/cities");
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);

  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-3xl h-[420px] animate-pulse border border-slate-200 shadow-soft">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100" />
            <div className="space-y-2">
              <div className="w-32 h-3 bg-slate-100 rounded" />
              <div className="w-24 h-2 bg-slate-50 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.fraudAmount - a.fraudAmount);
  const totalExposure = sortedData.reduce((sum, d) => sum + d.fraudAmount, 0);

  return (
    <AnimatedReveal delay={0.7}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden h-full flex flex-col relative group">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2.5 rounded-xl shadow-sm shadow-indigo-200"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.8, 
                  duration: 0.6,
                  ease: ANIMATION_EASING
                }}
              >
                <Globe className="h-5 w-5 text-white" />
              </motion.div>
              <AnimatedText delay={0.85}>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Geographic Risk Map</h3>
                  <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Global exposure index</p>
                </div>
              </AnimatedText>
            </div>
            <AnimatedText delay={0.9}>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-900 leading-tight">${(totalExposure / 1000).toFixed(0)}K</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exposure</div>
              </div>
            </AnimatedText>
          </div>
        </div>

      {/* Map Container */}
      <motion.div 
        className="flex-1 bg-slate-50 pt-20 relative w-full h-[420px] min-h-[420px] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.95, duration: 0.6 }}
      >
        <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={400} className="w-full h-full scale-[1.15]">
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#e2e8f0"
                  stroke="#ffffff"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#cbd5e1", outline: "none" },
                    pressed: { fill: "#94a3b8", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {sortedData.map((cityData) => {
            const coords = cityCoordinates[cityData.city];
            if (!coords) return null;

            const baseRadius = 4;
            const extraRadius = (cityData.fraudAmount / (sortedData[0]?.fraudAmount || 1)) * 6;
            const radius = baseRadius + extraRadius;
            
            const isHovered = hoveredCity?.city === cityData.city;

            return (
              <Marker 
                key={cityData.city} 
                coordinates={coords}
                onMouseEnter={() => setHoveredCity(cityData)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                <circle r={radius * 2.5} fill="#ef4444" opacity={isHovered ? 0.5 : 0.2} className="animate-ping" style={{ animationDuration: '3s' }} />
                <circle r={radius * 1.5} fill="#ef4444" opacity={isHovered ? 0.7 : 0.4} />
                <circle r={radius} fill="#dc2626" stroke="#fff" strokeWidth={1.5} className="cursor-pointer transition-all duration-300 hover:scale-125" />
              </Marker>
            );
          })}
        </ComposableMap>

        {/* Hover Tooltip overlay */}
        {hoveredCity && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border border-slate-200/50 p-4 rounded-2xl shadow-xl shadow-slate-900/10 min-w-[200px] pointer-events-none transform transition-all animate-in fade-in slide-in-from-bottom-2 z-20">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <div className="text-sm font-bold text-slate-900">{hoveredCity.city}</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-6">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Flags</span>
                <span className="text-sm font-black text-rose-600">{hoveredCity.flagged}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Exposure</span>
                <span className="text-sm font-black text-slate-900">${(hoveredCity.fraudAmount / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rate</span>
                <span className="text-sm font-bold text-slate-600">{hoveredCity.rate}%</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
    </AnimatedReveal>
  );
}
