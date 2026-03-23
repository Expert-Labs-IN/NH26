"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, AlertTriangle, ShieldCheck, Cpu, Send, Upload } from "lucide-react";
import clsx from "clsx";

export default function ReportIssueModule() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: "",
        department: "",
        category: "",
        description: "",
    });

    const nextStep = () => setStep(s => s + 1);

    return (
        <div className="max-w-2xl mx-auto py-10">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-heading font-black text-white tracking-tighter uppercase mb-2">Report an Issue</h1>
                <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.3em]">Direct Line to Enterprise Support Node</p>
            </header>

            <div className="glass-panel p-10 bg-white/[0.02] relative">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
                    <div
                        className="h-full bg-[#4F7CFF] transition-all duration-700 shadow-[0_0_15px_#4F7CFF]"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#4F7CFF] mb-3 block">Primary Issue Heading</label>
                            <input
                                type="text"
                                placeholder="e.g. Broken VPN access on Linux machine"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#4F7CFF]/50 transition-all font-medium"
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 block">Select Department Context</label>
                            <div className="grid grid-cols-2 gap-4">
                                {["Information Technology", "Human Resources", "Finance & Payroll", "Facilities Management"].map(dept => (
                                    <button
                                        key={dept}
                                        onClick={() => { setFormData({ ...formData, department: dept }); nextStep(); }}
                                        className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#4F7CFF]/30 hover:bg-[#4F7CFF]/5 text-left transition-all group"
                                    >
                                        <div className="text-xs font-bold text-white mb-1">{dept}</div>
                                        <div className="text-[9px] uppercase font-black text-white/20 group-hover:text-white/40">Select node</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#4F7CFF] mb-3 block">Detailed Description</label>
                            <textarea
                                rows={5}
                                placeholder="Please explain the problem in detail..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#4F7CFF]/50 transition-all font-medium resize-none"
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-4">
                            <button className="flex-1 glass-panel py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase text-white/40 hover:text-white transition-all">
                                <Upload className="w-4 h-4" /> Attach Logs/Images
                            </button>
                            <button
                                onClick={nextStep}
                                className="flex-1 bg-[#4F7CFF] text-black font-black uppercase tracking-widest text-[11px] rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-[#7aa0ff] transition-all"
                            >
                                Process Intake <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-10 text-center py-6 animate-in zoom-in-95 duration-700">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-full bg-[#4CAF9A]/20 flex items-center justify-center mx-auto mb-6 relative z-10 border-2 border-[#4CAF9A]/30">
                                <CheckCircle2 className="w-12 h-12 text-[#4CAF9A]" />
                            </div>
                            <div className="absolute inset-x-0 top-0 w-full h-full bg-[#4CAF9A]/20 blur-2xl rounded-full" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-4">Intake Success</h2>
                            <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
                                Issue <span className="text-white font-bold">#T-9001</span> has been logged. Our neural routing engine is assigning an agent based on priority.
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col gap-1 items-start text-left max-w-sm mx-auto">
                            <span className="text-[10px] font-black uppercase text-[#4F7CFF] mb-2 px-2 py-0.5 bg-[#4F7CFF]/10 rounded border border-[#4F7CFF]/20">Auto-Categorization</span>
                            <div className="flex justify-between w-full text-xs font-bold text-white/80">
                                <span>Status:</span>
                                <span className="text-[#F4C430]">Level 1 Triage</span>
                            </div>
                            <div className="flex justify-between w-full text-xs font-bold text-white/80 mt-1">
                                <span>Assigned:</span>
                                <span>{formData.department}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.href = '/portal/tickets'}
                            className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl px-10 py-4 transition-all"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>

            {step < 3 && (
                <div className="mt-10 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Cpu className="w-4 h-4" /> Neural Analysis Active
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" /> 256-bit Secure Node
                    </div>
                </div>
            )}
        </div>
    );
}
