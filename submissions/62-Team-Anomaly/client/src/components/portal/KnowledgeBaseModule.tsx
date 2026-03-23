"use client";

import { useState } from "react";
import { Search, BookOpen, ExternalLink, HelpCircle, FileText, ChevronRight } from "lucide-react";
import clsx from "clsx";

const FAQ_CATEGORIES = [
    {
        name: "Common Access",
        articles: [
            { title: "Resetting your SSO Password", status: "Updated" },
            { title: "VPN Installation Guide", status: null },
            { title: "Requesting Slack Workspace Access", status: "New" }
        ]
    },
    {
        name: "HR & Benefits",
        articles: [
            { title: "Understanding the Q3 Leave Expansion", status: "New" },
            { title: "Travel Expense Reimbursement Policy", status: null },
            { title: "Health Insurance Provider List", status: "Updated" }
        ]
    },
    {
        name: "Office Tools",
        articles: [
            { title: "How to use the Smart Printer", status: null },
            { title: "Booking a Conference Room", status: null },
            { title: "Internal Wiki Contribution Rules", status: "Updated" }
        ]
    }
];

export default function KnowledgeBaseModule() {
    return (
        <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">Knowledge Base</h1>
                        <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-1">Self-service solutions for Level 1 support</p>
                    </div>
                </div>
                <div className="relative max-w-2xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4F7CFF]" />
                    <input
                        type="text"
                        placeholder="Search for articles, guides, or troubleshooting steps..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-sm text-white focus:outline-none focus:border-[#4F7CFF]/50 transition-all shadow-inner"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {FAQ_CATEGORIES.map(category => (
                    <div key={category.name} className="flex flex-col gap-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4F7CFF] px-2 flex items-center gap-2">
                            <BookOpen className="w-3 h-3" /> {category.name}
                        </h3>
                        <div className="flex flex-col gap-2">
                            {category.articles.map(article => (
                                <div key={article.title} className="glass-panel p-4 bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                                            <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors">{article.title}</span>
                                        </div>
                                        {article.status && (
                                            <span className={clsx(
                                                "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                                                article.status === 'New' ? 'bg-[#4CAF9A]/10 text-[#4CAF9A]' : 'bg-[#F4C430]/10 text-[#F4C430]'
                                            )}>{article.status}</span>
                                        )}
                                        {!article.status && <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-white/40 transition-all" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Featured Help Card */}
            <div className="glass-panel p-8 bg-gradient-to-br from-[#4F7CFF]/10 to-transparent border-[#4F7CFF]/20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#4F7CFF]/20 flex items-center justify-center border border-[#4F7CFF]/30">
                        <HelpCircle className="w-8 h-8 text-[#4F7CFF]" />
                    </div>
                    <div>
                        <h3 className="font-heading font-black text-white uppercase tracking-tighter text-xl">Can't find what you're looking for?</h3>
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Connect with our AI Support Node for live triage</p>
                    </div>
                </div>
                <button
                    onClick={() => window.location.href = '/portal/assistant'}
                    className="bg-[#4F7CFF] text-black font-black uppercase tracking-widest text-[11px] rounded-2xl px-8 py-3.5 flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(79,124,255,0.3)]"
                >
                    Start Chat <ExternalLink className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
