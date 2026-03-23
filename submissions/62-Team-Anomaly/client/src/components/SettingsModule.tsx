"use client";

import {
    Building2, Users, Brain, Workflow, Bell, Link,
    ChevronRight, ToggleRight, ToggleLeft, Save,
    ShieldCheck, Cpu, Globe, Sliders
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

function SettingsSection({ title, icon: Icon, children }: any) {
    return (
        <div className="glass-panel p-8 bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Icon className="w-4 h-4 text-[#F4C430]" />
                </div>
                <h3 className="font-heading font-black text-white uppercase tracking-widest text-sm">{title}</h3>
            </div>
            <div className="flex flex-col gap-6">
                {children}
            </div>
        </div>
    );
}

function ToggleItem({ label, description, enabled }: any) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-white group-hover:text-[#F4C430] transition-colors">{label}</span>
                <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">{description}</span>
            </div>
            <button className="text-white/20 hover:text-[#F4C430] transition-colors">
                {enabled ? <ToggleRight className="w-8 h-8 text-[#4CAF9A]" /> : <ToggleLeft className="w-8 h-8 opacity-20" />}
            </button>
        </div>
    );
}

export default function SettingsModule() {
    const [activeTab, setActiveTab] = useState("organization");

    const tabs = [
        { id: "organization", label: "Organization", icon: Building2 },
        { id: "roles", label: "Roles & Access", icon: Users },
        { id: "ai", label: "AI & Neural", icon: Brain },
        { id: "workflow", label: "Workflow", icon: Workflow },
        { id: "notifications", label: "Notifs", icon: Bell },
        { id: "integrations", label: "Integrations", icon: Link },
    ];

    return (
        <div className="flex flex-col gap-10 pb-32">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">System Configuration</h1>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-1">Enterprise Core Parameters & Multi-Node Logic</p>
                </div>
                <button className="flex items-center gap-2 bg-[#F4C430] text-black px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_4px_20px_rgba(244,196,48,0.3)]">
                    <Save className="w-4 h-4" /> Save Deployments
                </button>
            </header>

            <div className="flex gap-10">
                {/* Left Mini-Nav */}
                <div className="w-48 flex flex-col gap-2">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all text-left",
                                activeTab === t.id
                                    ? "bg-white/10 border-white/20 text-white shadow-lg"
                                    : "bg-transparent border-transparent text-white/30 hover:text-white/60 hover:bg-white/5"
                            )}
                        >
                            <t.icon className="w-3.5 h-3.5" /> {t.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {activeTab === "organization" && (
                        <>
                            <SettingsSection title="Profile Info" icon={Globe}>
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Company Domain</label>
                                        <input type="text" defaultValue="worksync.ai" className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Primary Branch</label>
                                        <input type="text" defaultValue="Udaipur Global HQ" className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
                                    </div>
                                </div>
                            </SettingsSection>
                            <SettingsSection title="Core Ops" icon={Sliders}>
                                <ToggleItem label="Global NTP Sync" description="Synchronize neural time across all branches" enabled={true} />
                                <ToggleItem label="Multi-Branch Routing" description="Allow tickets to cross-over regional boundaries" enabled={false} />
                            </SettingsSection>
                        </>
                    )}

                    {activeTab === "roles" && (
                        <>
                            <SettingsSection title="Access Control" icon={ShieldCheck}>
                                <div className="flex flex-col gap-3">
                                    {["Admin", "HR Manager", "IT Specialist", "Security Auditor"].map(r => (
                                        <div key={r} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-white/20 transition-all">
                                            <span className="text-xs font-bold text-white/80">{r}</span>
                                            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#F4C430]" />
                                        </div>
                                    ))}
                                </div>
                            </SettingsSection>
                        </>
                    )}

                    {activeTab === "ai" && (
                        <>
                            <SettingsSection title="Neural Logic" icon={Brain}>
                                <ToggleItem label="Autonomous Drafting" description="AI will generate initial case responses" enabled={true} />
                                <ToggleItem label="Sentiment Guard" description="Flag tickets with high emotional volatility" enabled={true} />
                            </SettingsSection>
                            <SettingsSection title="Thresholds" icon={Cpu}>
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="flex justify-between text-[9px] font-black text-white/30 uppercase tracking-widest">
                                            Confidence Limit
                                            <span className="text-[#F4C430]">85%</span>
                                        </label>
                                        <input type="range" className="accent-[#F4C430]" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Personality Matrix</label>
                                        <div className="flex gap-2">
                                            {["Formal", "Neural", "Concise"].map(m => (
                                                <button key={m} className={clsx("flex-1 py-2 rounded-lg text-[9px] font-black uppercase border transition-all", m === 'Neural' ? 'bg-[#F4C430] text-black border-[#F4C430]' : 'border-white/10 text-white/40')}>
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SettingsSection>
                        </>
                    )}

                    {activeTab === "integrations" && (
                        <>
                            <SettingsSection title="Data Pipelines" icon={Link}>
                                <div className="flex flex-col gap-4">
                                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-[#4F7CFF]/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#4F7CFF]/20 flex items-center justify-center">
                                                <Link className="w-4 h-4 text-[#4F7CFF]" />
                                            </div>
                                            <span className="text-xs font-bold text-white">Supabase Cloud</span>
                                        </div>
                                        <span className="text-[8px] font-black uppercase text-[#4CAF9A] bg-[#4CAF9A]/10 px-2 py-1 rounded-md border border-[#4CAF9A]/20">Active</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between opacity-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                <Link className="w-4 h-4 text-white/40" />
                                            </div>
                                            <span className="text-xs font-bold text-white/40">Slack Grid</span>
                                        </div>
                                        <button className="text-[9px] font-black uppercase text-white/20 border border-white/10 px-2 py-1 rounded-md">Connect</button>
                                    </div>
                                </div>
                            </SettingsSection>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
