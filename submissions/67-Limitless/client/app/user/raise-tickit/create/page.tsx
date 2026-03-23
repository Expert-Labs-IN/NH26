"use client";

import { motion } from "framer-motion";
import { 
    Send, ChevronRight, AlertCircle, Building2, 
    MessageSquare, ShieldAlert, Cpu, CheckCircle2,
    Loader2
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

        try {
            const ticketData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                severity: formData.severity,
                aiResolved: false,
                raisedBy: (session.user as any).id,
                department: formData.department,
            };

            await strapi.create("tickets", ticketData);
            
            toast.success("Ticket created successfully! Redirecting...");
            
            setTimeout(() => {
                router.push("/user/my-tickets");
            }, 2000);

        } catch (error) {
            console.error("Error creating ticket:", error);
            toast.error("Something went wrong. Please try again.");
            setIsSubmitting(false);
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
                        {/* Title */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Ticket Subject</label>
                            <input 
                                required
                                type="text" 
                                placeholder="Describe your issue in a few words..."
                                className="w-full bg-black/40 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-1 ring-blue-500/50 transition-all font-medium"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                        </div>

                        {/* Department & Severity Row */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Department</label>
                                <div className="relative">
                                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <select 
                                        required
                                        className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-1 ring-blue-500/50 appearance-none transition-all font-medium"
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
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Priority Level</label>
                                <div className="relative">
                                    <ShieldAlert className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <select 
                                        className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-1 ring-blue-500/50 appearance-none transition-all font-medium"
                                        value={formData.severity}
                                        onChange={(e) => setFormData({...formData, severity: e.target.value})}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Issue Category</label>
                            <div className="relative">
                                <Cpu className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <select 
                                    className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-1 ring-blue-500/50 appearance-none transition-all font-medium"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="General Support">General Support</option>
                                    <option value="Billing">Billing & Payments</option>
                                    <option value="Technical Error">Technical Error</option>
                                    <option value="Account Access">Account Access</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Full Description</label>
                            <textarea 
                                required
                                rows={5}
                                placeholder="Please provide detailed information about your issue..."
                                className="w-full bg-black/40 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-1 ring-blue-500/50 transition-all font-medium resize-none placeholder:text-slate-600"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-black font-black text-lg py-5 rounded-2xl hover:bg-slate-200 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Creating Ticket...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Raise Ticket
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
