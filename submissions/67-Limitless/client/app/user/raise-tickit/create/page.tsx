"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Send, ChevronRight, AlertCircle, Building2, 
    MessageSquare, ShieldAlert, Cpu, CheckCircle2,
    Loader2, Sparkles, Brain
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useStrapi } from "@/lib/sdk/useStrapi";
import { strapi } from "@/lib/sdk/sdk";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function CreateTicketPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { data: departmentsResponse, isLoading: loadingDepts } = useStrapi("departments");
    const departments = departmentsResponse?.data || [];

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "General Support",
        severity: "Low",
        department: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!session) {
            toast.error("You must be logged in to raise a ticket.");
            return;
        }

        if (!formData.department) {
            toast.error("Please select a department.");
            return;
        }

        setIsSubmitting(true);
        setAiSuggestion("Analyzing your request to determine priority and category...");

        try {
            // First analyze with AI in background to determine metadata
            const analysisRes = await fetch("/api/analyze-ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title: formData.title, 
                    description: formData.description,
                    departments: departments.map((d: any) => ({ id: d.id, title: d.title || d.attributes?.title }))
                })
            });

            if (!analysisRes.ok) throw new Error("AI Autonomous Routing failed");
            const analysisData = await analysisRes.json();

            const ticketData = {
                title: formData.title,
                description: formData.description,
                category: analysisData.category || "General Support",
                severity: analysisData.severity || "Low",
                aiResolved: false,
                raisedBy: (session.user as any).id,
                department: formData.department,
            };

            await strapi.create("tickets", ticketData);
            
            setAiSuggestion(`Success! Automatically categorized as ${analysisData.category} and routed.`);
            toast.success("Ticket created and routed autonomously.");
            
            setTimeout(() => {
                router.push("/user/my-tickets");
            }, 2000);

        } catch (error) {
            console.error("Error creating ticket:", error);
            toast.error("Something went wrong. Please try again.");
            setIsSubmitting(false);
            setAiSuggestion(null);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 py-20 px-6 font-sans flex flex-col items-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full z-10"
            >
                <div className="mb-12">
                    <Link 
                        href="/user/raise-tickit"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 group"
                    >
                        <AlertCircle className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Hub
                    </Link>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Create Manual Ticket</h1>
                    <p className="text-slate-400">Please provide all necessary details for our support team to assist you.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 bg-[#111]/80 backdrop-blur-xl border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl">
                    <div className="space-y-6">
                        {/* Title & Department Row */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Ticket Subject</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="Brief summary..."
                                    className="w-full bg-black/40 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-1 ring-blue-500/50 transition-all font-medium"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Target Department</label>
                                <div className="relative">
                                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <select 
                                        required
                                        className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-1 ring-blue-500/50 appearance-none transition-all font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                                        value={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                    >
                                        <option value="" disabled>Select Department</option>
                                        {departments.map((dept: any) => (
                                            <option key={dept.id} value={dept.id}>{dept.attributes?.title || dept.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Full Description</label>
                            <textarea 
                                required
                                rows={8}
                                placeholder="Please provide detailed information about your issue..."
                                className="w-full bg-black/40 border border-slate-800 rounded-3xl px-6 py-6 outline-none focus:ring-1 ring-blue-500/50 transition-all font-medium resize-none placeholder:text-slate-600 shadow-inner"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        {/* AI Status Feedback */}
                        <AnimatePresence>
                            {aiSuggestion && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-6 py-5 bg-blue-950/20 border border-blue-800/40 rounded-2xl flex items-center gap-4 text-blue-400"
                                >
                                    <div className="shrink-0 w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-700/30">
                                        <Brain className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold leading-snug">{aiSuggestion}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting || !formData.title || !formData.description}
                        className="w-full relative group overflow-hidden bg-white text-black font-black text-lg py-5 rounded-2xl hover:bg-slate-200 transition-all shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Analyzing with AI Assistant...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                Raise Ticket
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
