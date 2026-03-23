"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, ShieldAlert, Sparkles, User, Headset, 
  FileText, Shield, Menu, X 
} from "lucide-react";

export function NavBar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const renderDashboardLink = () => {
    const userType = (session as any)?.userType;
    if (!userType) return null;

    switch (userType) {
      case "admin":
        return (
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <Shield className="w-4 h-4 text-blue-400" />
            Admin Dashboard
          </Link>
        );
      case "agent":
        return (
          <>
          {/* <Link href="/agent" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <Headset className="w-4 h-4" />
            Agent Dashboard
          </Link> */}
          <Link href="/agent/assined-tickits" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
            Assigned
          </Link>
          <Link href="/agent/all-tickits" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <Shield className="w-4 h-4" />
            All
          </Link>
          <Link href="/agent/unassined-tickets" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <ShieldAlert className="w-4 h-4" />
            Unassigned
          </Link>
          </>
        );
      case "customer":
      case "user":
      default:
        return (
          <>
          <Link href="/user/raise-tickit" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <User className="w-4 h-4" />
            Raise Ticket
          </Link>
          <Link href="/user/my-tickets" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <User className="w-4 h-4" />
            My Tickets
          </Link>
          </>
        );
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-[100] w-full border-b border-slate-800/80 bg-[#0a0a0a]/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 relative z-[110]">
          <div className="bg-white text-black p-2 rounded-xl shadow-lg ring-1 ring-white/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xl font-black tracking-tight text-white uppercase italic">Sarathi</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {status === "loading" ? (
            <div className="w-24 h-9 bg-slate-900 animate-pulse rounded-xl border border-slate-800" />
          ) : session ? (
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-6">
                {renderDashboardLink()}
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 text-sm font-bold text-rose-500 hover:text-rose-400 transition-all hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-sm font-bold text-slate-400 hover:text-white transition-all"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-white text-black text-sm font-black rounded-xl hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative z-[110] p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-800 bg-[#0c0c0c] overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-8">
              {status === "loading" ? (
                <div className="space-y-4">
                  <div className="w-full h-10 bg-slate-900 animate-pulse rounded-xl" />
                  <div className="w-full h-10 bg-slate-900 animate-pulse rounded-xl" />
                </div>
              ) : session ? (
                <>
                  <div className="flex flex-col gap-6">
                    {renderDashboardLink()}
                  </div>
                  <div className="h-px w-full bg-slate-800" />
                  <button
                    onClick={() => {
                        setIsOpen(false);
                        signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-3 text-lg font-bold text-rose-500"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 text-center text-lg font-bold text-slate-300 border border-slate-800 rounded-2xl"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 text-center text-lg font-black bg-white text-black rounded-2xl"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
