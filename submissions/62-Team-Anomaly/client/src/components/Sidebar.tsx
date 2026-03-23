"use client";

import { LayoutDashboard, Ticket, BarChart3, Bot, Settings, HelpCircle } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Tickets", href: "/tickets", icon: Ticket },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "AI Assistant", href: "/assistant", icon: Bot },
    { name: "Settings", href: "/settings", icon: Settings },
];

import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const displayName = user?.email?.split('@')[0] || "Admin";

    return (
        <aside className="w-64 h-full flex flex-col justify-between py-8 px-6 bg-black/20 backdrop-blur-3xl border-r border-white/5 relative z-20 shrink-0">
            <div>
                {/* Logo */}
                <div className="flex items-center gap-3 px-2 mb-12">
                    <div className="w-9 h-9 rounded-xl bg-[#F4C430] shadow-[0_0_20px_rgba(244,196,48,0.4)] flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50" />
                        <div className="w-3.5 h-3.5 bg-black rounded-sm relative z-10" />
                    </div>
                    <span className="font-heading font-black text-2xl tracking-tighter text-white uppercase">WorkSync</span>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-500 relative text-sm font-bold tracking-tight overflow-hidden group cursor-pointer",
                                    isActive
                                        ? "text-white bg-white/[0.07] shadow-lg border border-white/10"
                                        : "text-white/40 hover:text-white/80 hover:bg-white/[0.03]"
                                )}
                            >
                                {isActive && (
                                    <>
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F4C430] shadow-[0_0_15px_#F4C430]" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#F4C430]/10 to-transparent pointer-events-none" />
                                    </>
                                )}
                                <item.icon className={clsx("w-5 h-5 transition-transform duration-500 group-hover:scale-110", isActive ? "text-[#F4C430] drop-shadow-[0_0_8px_rgba(244,196,48,0.5)]" : "opacity-50")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex flex-col gap-4">
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#F4C430]/40 hover:text-[#F4C430] transition-colors group"
                >
                    <LogOut className="w-4 h-4" /> Terminate Auth
                </button>

                <div className="glass-panel p-4 flex items-center gap-4 border-white/10 bg-white/[0.02]">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-cover border-2 border-white/10 flex items-center justify-center bg-white/5 uppercase font-black text-[#F4C430] text-xs">
                            {displayName.substring(0, 2)}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4CAF9A] rounded-full border-2 border-[#0E0E10] shadow-[0_0_8px_#4CAF9A]" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-1 overflow-hidden">
                        <span className="text-[11px] font-bold text-white tracking-tight text-left truncate w-full">{displayName}</span>
                        <span className="text-[8px] uppercase font-black tracking-widest text-white/20 text-left">Admin Head</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
