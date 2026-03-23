"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut, ShieldAlert, Sparkles, User, Headset } from "lucide-react";

export function NavBar() {
  const { data: session, status } = useSession();

  const renderDashboardLink = () => {
    const userType = (session as any)?.userType;
    if (!userType) return null;

    switch (userType) {
      case "admin":
        return (
          <Link href="/admin" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <ShieldAlert className="w-4 h-4" />
            Admin Panel
          </Link>
        );
      case "agent":
        return (
          <Link href="/agent" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <Headset className="w-4 h-4" />
            Agent Dashboard
          </Link>
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
      className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#0a0a0a]/80 backdrop-blur-xl"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-white text-black p-1.5 rounded-lg shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Sarathi</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          {status === "loading" ? (
            <div className="w-20 h-8 bg-slate-800 animate-pulse rounded-md" />
          ) : session ? (
            <div className="flex items-center gap-6">
              {renderDashboardLink()}
              <div className="h-4 w-px bg-slate-800" />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-white text-black px-4 py-2 rounded-lg hover:bg-slate-200 transition-all shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
