"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, MapPin, ShieldAlert, Zap } from "lucide-react";

const CITIES = ['New York', 'London', 'Tokyo', 'Lagos', 'Dubai', 'Moscow', 'São Paulo', 'Miami', 'Singapore', 'Mumbai'];

interface AlertEvent {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning';
}

export function SimulationAlerts({ isSimulating }: { isSimulating: boolean }) {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);

  useEffect(() => {
    if (!isSimulating) {
      setAlerts([]);
      return;
    }

    // Occasionally generate an alert while simulating
    const interval = setInterval(() => {
      // 30% chance to spawn an alert every 2 seconds
      if (Math.random() > 0.7) {
        const isCritical = Math.random() > 0.5;
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const amount = Math.floor(Math.random() * 5000) + 500;
        
        const newAlert: AlertEvent = {
          id: Date.now().toString(),
          title: isCritical ? "Coordinated Attack Detected" : "Suspicious Velocity Spike",
          message: isCritical 
            ? `Multiple high-value ($${amount}+) transactions originating from ${city}.` 
            : `Rapid successive swipes detected in ${city} region.`,
          type: isCritical ? 'critical' : 'warning'
        };

        setAlerts(prev => [newAlert, ...prev].slice(0, 3)); // Keep max 3 on screen

        // Auto remove after 5s
        setTimeout(() => {
          setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
        }, 5000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="fixed bottom-24 left-4 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
      <AnimatePresence>
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md flex gap-3 ${
              alert.type === 'critical' 
                ? 'bg-rose-950/90 border-rose-500/50 text-white' 
                : 'bg-amber-950/90 border-amber-500/50 text-white'
            }`}
          >
            <div className={`mt-0.5 p-2 rounded-xl h-fit ${
              alert.type === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {alert.type === 'critical' ? <ShieldAlert className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight">{alert.title}</h4>
              <p className={`text-xs mt-1 leading-relaxed ${
                alert.type === 'critical' ? 'text-rose-200' : 'text-amber-200'
              }`}>
                {alert.message}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
