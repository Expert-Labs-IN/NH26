"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  LineChart, 
  Settings,
  Menu,
  Shield,
  Radar,
  Globe
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "#overview" },
  { icon: LineChart, label: "Velocity & Volume", href: "#velocity" },
  { icon: Globe, label: "Global Heatmap", href: "#heatmap" },
  { icon: Radar, label: "Risk & Threat Intel", href: "#risk" },
  { icon: ShieldAlert, label: "Live Alerts", href: "#alerts", badge: "Live" },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("#overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );

    navItems.forEach((item) => {
      const id = item.href.substring(1);
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setActiveSection(href);
    const element = document.querySelector(href);
    if (element) {
      // In this layout, window is the scroll container because it's set up differently
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="relative h-screen bg-white border-r border-slate-200 flex flex-col z-50 shrink-0 shadow-[2px_0_12px_rgba(0,0,0,0.02)] transition-all duration-300 font-outfit"
    >
      {/* Header with Hamburger */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
            >
              <div className="bg-primary-600 p-1.5 rounded-lg shadow-sm shrink-0 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight shrink-0">
                Fraud<span className="text-primary-600">Shield</span>
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto overflow-x-hidden no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeSection === item.href;
          
          return (
            <a 
              key={item.href} 
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative outline-none cursor-pointer
                ${isActive 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }
              `}
            >
              <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
              
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap text-sm font-semibold tracking-wide"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Badge */}
              {!isCollapsed && item.badge && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider
                    ${isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'}
                  `}
                >
                  {item.badge}
                </motion.div>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-16 bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl flex items-center gap-2">
                  {item.label}
                  {item.badge && <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                </div>
              )}
            </a>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-slate-100 flex flex-col gap-2">
        <button className={`flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors group relative ${isCollapsed ? 'justify-center' : ''}`}>
          <Settings className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-900 transition-colors" />
          {!isCollapsed && (
            <span className="whitespace-nowrap text-sm font-semibold tracking-wide">
              Settings
            </span>
          )}
          {isCollapsed && (
            <div className="absolute left-16 bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
              Settings
            </div>
          )}
        </button>

        <div className={`mt-2 pt-4 border-t border-slate-100 flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
          <div className="relative group cursor-pointer shrink-0">
            <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0" alt="User" className="h-full w-full object-cover" />
            </div>
            {isCollapsed && (
              <div className="absolute left-14 bottom-0 bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                Admin Profile
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="text-sm font-black text-slate-900 truncate tracking-tight">Admin User</span>
              <span className="text-[11px] font-semibold text-slate-400 truncate">Security Ops</span>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}