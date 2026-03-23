"use client";

import { User, Mail, Building2, MapPin, Shield, Camera, Edit3 } from "lucide-react";

export default function UserProfileModule() {
    return (
        <div className="flex flex-col gap-10">
            <header>
                <h1 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">User Profile</h1>
                <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-1">Neural ID & Enterprise Context</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                    <div className="glass-panel p-10 bg-white/[0.01] flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-3xl bg-cover border-4 border-white/5 shadow-2xl overflow-hidden group-hover:border-[#4F7CFF]/50 transition-all" style={{ backgroundImage: "url('https://i.pravatar.cc/200?img=33')" }}>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                        <h2 className="mt-6 text-xl font-heading font-black text-white uppercase tracking-tighter">Jordan Smith</h2>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4F7CFF] mt-2 bg-[#4F7CFF]/10 px-3 py-1 rounded-lg border border-[#4F7CFF]/20">Senior Developer</span>
                    </div>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="glass-panel p-8 bg-white/[0.01] grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">Email Address</label>
                            <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4">
                                <Mail className="w-4 h-4 text-white/20" />
                                <span className="text-sm font-bold text-white/80">jordan.smith@worksync.ai</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">Department</label>
                            <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4">
                                <Building2 className="w-4 h-4 text-white/20" />
                                <span className="text-sm font-bold text-white/80">Engineering Ops</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">Primary Branch</label>
                            <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4">
                                <MapPin className="w-4 h-4 text-white/20" />
                                <span className="text-sm font-bold text-white/80">Udaipur Global HQ</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">System Access</label>
                            <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4">
                                <Shield className="w-4 h-4 text-[#4CAF9A]" />
                                <span className="text-sm font-bold text-[#4CAF9A]">Standard Employee</span>
                            </div>
                        </div>
                    </div>
                    <button className="bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all hover:bg-white/10">
                        <Edit3 className="w-4 h-4" /> Request Profile Correction
                    </button>
                </div>
            </div>
        </div>
    );
}
