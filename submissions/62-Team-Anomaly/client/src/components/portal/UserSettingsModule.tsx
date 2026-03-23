"use client";

import { Settings, Bell, Lock, Globe, Moon, ChevronRight, Save } from "lucide-react";
import clsx from "clsx";

function SettingRow({ icon: Icon, title, desc, action }: any) {
    return (
        <div className="flex items-center justify-between py-6 border-b border-white/5 last:border-0 group cursor-pointer">
            <div className="flex items-center gap-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#4F7CFF]/50 transition-all">
                    <Icon className="w-5 h-5 text-white/40 group-hover:text-[#4F7CFF]" />
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">{title}</h3>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{desc}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{action}</span>
                <ChevronRight className="w-4 h-4 text-white/5 group-hover:text-white/40 transition-all" />
            </div>
        </div>
    );
}

export default function UserSettingsModule() {
    return (
        <div className="flex flex-col gap-10">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">Portal Settings</h1>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-1">Configure your support experience</p>
                </div>
                <button className="bg-[#4F7CFF] text-black px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_4px_20px_rgba(79,124,255,0.3)] flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Preferences
                </button>
            </header>

            <div className="glass-panel p-8 bg-white/[0.01]">
                <div className="flex flex-col">
                    <SettingRow
                        icon={Bell}
                        title="Notification Channel"
                        desc="Email, In-App, and Push Alerts"
                        action="Multi-Channel"
                    />
                    <SettingRow
                        icon={Lock}
                        title="Authentication"
                        desc="Change password and 2FA settings"
                        action="Managed by SSO"
                    />
                    <SettingRow
                        icon={Globe}
                        title="Localization"
                        desc="Portal language and time zone"
                        action="English (UK)"
                    />
                    <SettingRow
                        icon={Moon}
                        title="Theme Engine"
                        desc="Auto, Light, or Dark Liquid Glass"
                        action="Dark Mode"
                    />
                </div>
            </div>
        </div>
    );
}
