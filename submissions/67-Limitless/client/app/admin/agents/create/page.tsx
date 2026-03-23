"use client";

import { motion } from "framer-motion";
import { 
    UserPlus, Mail, Lock, ShieldCheck, 
    Building2, ArrowLeft, Loader2, Sparkles,
    UserCircle, ShieldAlert
} from "lucide-react";
import { useState } from "react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import { strapi } from "@/lib/sdk/sdk";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AdminCreateAgentPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Fetch departments for the dropdown
    const { data: deptsResponse, isLoading: loadingDepts } = useStrapi("departments");
    const departments = deptsResponse?.data || [];

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        department: "",
        type: "agent"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.department) {
            toast.error("Please assign a department to the agent.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Step 1: Register the account with randomized username (as per pattern)
            const randomizedUsername = formData.username.trim() + Math.random().toString(36).substring(2, 10);
            const registerRes = (await strapi.register({
                username: randomizedUsername,
                email: formData.email.trim(),
                password: formData.password,
            })) as any;

            const userId = registerRes?.user?.id || registerRes?.id;

            if (!userId) throw new Error("Could not retrieve ID from registration.");

            // Step 2: Update the account using the manual fetch pattern requested
            const token = registerRes?.jwt;
            if (!token) throw new Error("Could not retrieve authentication token from registration.");

            try {
                const updateRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        fullName: formData.username.trim(),
                        type: "agent",
                        department: formData.department,
                        confirmed: true,
                        blocked: false,
                        role: 1
                    }),
                });

                if (!updateRes.ok) {
                    const errorJson = await updateRes.json();
                    throw new Error(errorJson?.error?.message || "Failed to finalize agent profile.");
                }
            } catch (fetchErr: any) {
                console.warn("Retrying update via restricted global token due to direct fetch issue...");
                // Fallback to SDK with global token if the direct fetch failed
                await strapi.update("users", userId, {
                    type: "agent",
                    fullName: formData.username,
                    department: formData.department
                } as any);
            }

            toast.success("Agent onboarded successfully!");
            setTimeout(() => {
                router.push("/admin/dashboard");
            }, 2000);
        } catch (error: any) {
            console.error("Error onboarding agent:", error);
            // Handle specific Strapi errors (e.g., duplicate email)
            const errorMsg = error?.error?.message || "Failed to create agent account.";
            toast.error(errorMsg);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] py-20 px-6 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full z-10"
            >
                <div className="mb-12">
                    <Link 
                        href="/admin/dashboard" 
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest group mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                        Back to Core Dashboard
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-white text-black rounded-3xl shadow-3xl">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Onboard Agent</h1>
                            <p className="text-slate-500 text-lg font-medium">Provision a new expert account for system-wide assistance.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#111]/80 backdrop-blur-3xl border border-slate-800 p-12 rounded-[3.5rem] shadow-2xl space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] pointer-events-none" />
                    
                    <div className="space-y-8">
                        {/* Profile Info */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Display Username</label>
                                <div className="relative">
                                    <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g. support_jason"
                                        className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-14 pr-6 py-4.5 outline-none focus:ring-1 ring-blue-500/40 text-sm transition-all font-medium placeholder:text-slate-700 shadow-inner"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Expert Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input 
                                        required
                                        type="email" 
                                        placeholder="expert@system.com"
                                        className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-14 pr-6 py-4.5 outline-none focus:ring-1 ring-blue-500/40 text-sm transition-all font-medium placeholder:text-slate-700 shadow-inner"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security & Access */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Initial Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input 
                                        required
                                        type="password" 
                                        placeholder="Minimum 8 characters"
                                        className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-14 pr-6 py-4.5 outline-none focus:ring-1 ring-blue-500/40 text-sm transition-all font-medium placeholder:text-slate-700 shadow-inner"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Assigned Department</label>
                                <div className="relative">
                                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <select 
                                        required
                                        className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-14 pr-10 py-4.5 outline-none focus:ring-1 ring-blue-500/40 text-sm transition-all font-medium appearance-none placeholder:text-slate-700 shadow-inner"
                                        value={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                    >
                                        <option value="" disabled className="bg-slate-900">Select Domain</option>
                                        {departments.map((dept: any) => (
                                            <option key={dept.id} value={dept.id} className="bg-slate-900">
                                                {dept.attributes?.title || dept.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-black font-black text-lg py-6 rounded-[2rem] hover:bg-slate-200 transition-all flex items-center justify-center gap-4 shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Provisioning Expert...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-6 h-6" />
                                Validate & Onboard
                            </>
                        )}
                    </button>

                    <div className="pt-6 flex items-center gap-2 justify-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        New accounts are automatically confirmed and verified.
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
