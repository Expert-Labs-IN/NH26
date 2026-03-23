"use client";

import { motion } from "framer-motion";
import {
    Building2, Plus, ArrowLeft, Loader2, Sparkles,
    Tag, ShieldAlert, CheckCircle2,
    Users
} from "lucide-react";
import { useState } from "react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import { strapi } from "@/lib/sdk/sdk";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AdminCreateDepartmentPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        agents: [] as string[], // Selected agent IDs
    });

    // Fetch available agents to assign
    const { data: usersResponse, isLoading: loadingAgents } = useStrapi("users");
    const agents = (Array.isArray(usersResponse) ? usersResponse : (usersResponse as any)?.data || [])
        .filter((u: any) => u.type === 'agent');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        try {
            await strapi.create("departments", {
                title: formData.title,
                agents: formData.agents
            } as any);

            toast.success("Department registry and expert mapping updated!");
            setTimeout(() => {
                router.push("/admin/departments");
            }, 2000);
        } catch (error: any) {
            console.error("Error creating department:", error);
            const errorMsg = error?.error?.message || "Failed to create support domain.";
            toast.error(errorMsg);
            setIsSubmitting(false);
        }
    };

    const toggleAgent = (id: string) => {
        setFormData(prev => ({
            ...prev,
            agents: prev.agents.includes(id)
                ? prev.agents.filter(a => a !== id)
                : [...prev.agents, id]
        }));
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] py-20 px-6 relative overflow-hidden flex flex-col items-center">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl w-full z-10"
            >
                <div className="mb-12">
                    <Link
                        href="/admin/departments"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest group mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Registry
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-white text-black rounded-3xl shadow-3xl">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Create Department</h1>
                            <p className="text-slate-500 text-lg font-medium">Define a new expertise sector and assign experts.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#111]/80 backdrop-blur-3xl border border-slate-800 p-12 rounded-[3.5rem] shadow-2xl space-y-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] pointer-events-none" />

                    <div className="space-y-10">
                        {/* Domain Info */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Department Name</label>
                            <div className="relative">
                                <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Billing & Finance"
                                    className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-14 pr-6 py-4.5 outline-none focus:ring-1 ring-blue-500/40 text-sm transition-all font-medium placeholder:text-slate-700 shadow-inner"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Expert Assignment */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Expert Assignments</label>
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{formData.agents.length} Selected</span>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {loadingAgents ? (
                                    <div className="col-span-full py-10 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-slate-700" />
                                    </div>
                                ) : (
                                    agents.map((agent: any) => (
                                        <button
                                            key={agent.id}
                                            type="button"
                                            onClick={() => toggleAgent(agent.id)}
                                            className={`p-5 rounded-2xl border transition-all text-left flex items-center gap-4 group ${formData.agents.includes(agent.id)
                                                    ? 'bg-blue-600/10 border-blue-500/50'
                                                    : 'bg-black/20 border-slate-800 hover:border-slate-700'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${formData.agents.includes(agent.id) ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'
                                                }`}>
                                                {agent.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white leading-none mb-1 text-sm">{agent.username}</p>
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Expert Account</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Domain Control Summary */}
                        <div className="bg-black/40 border border-slate-800 rounded-[2.5rem] p-8">
                            <div className="flex items-center gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 mb-2">
                                <ShieldAlert className="w-5 h-5 text-emerald-500" />
                                <div className="text-xs font-bold text-white leading-none">
                                    Instant Availability
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1.5 leading-none">Global registry updated immediately.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-black font-black text-lg py-6 rounded-[2rem] hover:bg-slate-200 transition-all flex items-center justify-center gap-4 shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Initializing Sector...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-6 h-6" />
                                Validate & Finalize
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-2 justify-center text-[10px] font-black text-slate-600 uppercase tracking-widest group cursor-default">
                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-500" />
                        Domain names must be unique within the organization.
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
