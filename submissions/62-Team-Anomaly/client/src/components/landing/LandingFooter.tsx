"use client";

import Link from "next/link";

export default function LandingFooter() {
    return (
        <footer className="bg-white border-t border-gray-100 py-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
                    <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
                        <Link href="/landing" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-[#0052FF] flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-sm" />
                            </div>
                            <span className="font-heading font-black text-xl tracking-tight text-[#121212] uppercase">WorkSync</span>
                        </Link>
                        <p className="text-sm font-medium text-gray-400 leading-relaxed">
                            The AI-first workplace resolution engine.
                            Empowering internal teams through autonomous triage and deflection.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#121212]">Product</span>
                        <div className="flex flex-col gap-4">
                            {["AI Intake", "Resolution Hub", "Analytics", "Security"].map((link) => (
                                <Link key={link} href="#" className="text-sm font-bold text-gray-500 hover:text-[#0052FF] transition-colors">{link}</Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#121212]">Company</span>
                        <div className="flex flex-col gap-4">
                            {["About", "Privacy", "Terms", "Contact"].map((link) => (
                                <Link key={link} href="#" className="text-sm font-bold text-gray-500 hover:text-[#0052FF] transition-colors">{link}</Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#121212]">Social</span>
                        <div className="flex flex-col gap-4">
                            {["Twitter", "LinkedIn", "GitHub"].map((link) => (
                                <Link key={link} href="#" className="text-sm font-bold text-gray-500 hover:text-[#0052FF] transition-colors">{link}</Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="text-xs font-bold text-gray-400">© 2026 WorkSync AI. All rights reserved.</span>
                    <div className="flex items-center gap-6">
                        <span className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" /> All systems operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
