"use client";

import { motion } from "framer-motion";
import { Send, FileText, Layout, AlertTriangle, ChevronDown, CheckCircle2, Loader2, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { strapi } from "@/lib/sdk/sdk";
import { useStrapi } from "@/lib/sdk/useStrapi";
import { useRouter } from "next/navigation";

export default function CreateTicketPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Technical",
        severity: "Low",
        department: "",
    });

    const { data: departmentsResponse } = useStrapi("departments");
    const departments = departmentsResponse?.data || [];

    const containerVariants: any = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { 
                duration: 0.6,
                staggerChildren: 0.1,
                ease: "easeOut"
            },
        },
    };

    const itemVariants: any = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = session?.user as any;
        if (!user?.id) {
            alert("Please login to raise a ticket");
            return;
        }

        setLoading(true);
        try {
            const ticketData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                severity: formData.severity,
                raisedBy: user.id,
                department: formData.department,
                summary: formData.title.substring(0, 100),
                aiResolved: false
            };

            await strapi.create("tickets", ticketData);
            setSuccess(true);
            setTimeout(() => {
                router.push("/user/raise-tickit");
            }, 3000);
        } catch (error) {
            console.error("Error creating ticket:", error);
            alert("Failed to create ticket. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-slate-200">
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#111] p-12 rounded-3xl border border-emerald-500/30 flex flex-col items-center shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]"
                >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 text-center">Ticket Raised Successfully!</h2>
                    <p className="text-slate-400 text-center mb-8">Your ticket has been created and our team will get back to you soon.</p>
                    <p className="text-xs text-slate-500">Redirecting you to support center...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 py-12 px-4 font-sans relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -z-10" />

            <div className="max-w-3xl mx-auto">
                <Link 
                    href="/user/raise-tickit" 
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Support
                </Link>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    <header>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Raise a Ticket</h1>
                        <p className="text-slate-400">Describe your query below and we'll connect you with the right department.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-400" />
                                Query Title
                            </label>
                            <input 
                                required
                                type="text"
                                placeholder="E.g., I'm having trouble with my account access"
                                className="w-full bg-[#111] border border-slate-800 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Layout className="w-4 h-4 text-purple-400" />
                                    Department
                                </label>
                                <div className="relative">
                                    <select 
                                        required
                                        className="w-full appearance-none bg-[#111] border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer shadow-lg"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option value="" disabled className="bg-[#111]">Select a Department</option>
                                        {departments.map((dept: any) => (
                                            <option key={dept.id} value={dept.id} className="bg-[#111]">
                                                {dept.attributes?.title || dept.title}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-pink-400" />
                                    Category
                                </label>
                                <div className="relative">
                                    <select 
                                        className="w-full appearance-none bg-[#111] border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer shadow-lg"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Technical">Technical</option>
                                        <option value="Billing">Billing</option>
                                        <option value="Account">Account</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                </div>
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                Severity Level
                            </label>
                            <div className="flex gap-4">
                                {['Low', 'Medium', 'High'].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, severity: level })}
                                        className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border ${
                                            formData.severity === level 
                                            ? (level === 'Low' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]' :
                                               level === 'Medium' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)]' :
                                               'bg-rose-500/10 border-rose-500 text-rose-500 shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]')
                                            : 'bg-[#111] border-slate-800 text-slate-500 hover:border-slate-700'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-400" />
                                Full Description
                            </label>
                            <textarea 
                                required
                                rows={6}
                                placeholder="Please provide as much detail as possible..."
                                className="w-full bg-[#111] border border-slate-800 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="pt-6">
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-5 bg-white text-black font-black text-xl rounded-xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Submit Request
                                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
