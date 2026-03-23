"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Building2, Plus, ArrowLeft, Search, 
    MoreVertical, Trash2, Edit, Users, 
    Sparkles, ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { useStrapi } from "@/lib/sdk/useStrapi";
import { strapi } from "@/lib/sdk/sdk";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AdminDepartmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const { data: deptsResponse, isLoading, mutate } = useStrapi("departments", { populate: "*" });
    
    // Normalize data for Strapi 5
    const departments = deptsResponse?.data || (Array.isArray(deptsResponse) ? deptsResponse : []);

    const filteredDepts = departments.filter((dept: any) => {
        const title = (dept.attributes?.title || dept.title || "").toLowerCase();
        return title.includes(searchQuery.toLowerCase());
    });

    const handleDelete = async (docId: string) => {
        if (!confirm("Are you sure you want to delete this department? Any agents assigned to it will need re-routing.")) return;
        
        try {
            await strapi.delete("departments", docId);
            toast.success("Department removed from registry.");
            mutate();
        } catch (error) {
            console.error("Error deleting department:", error);
            toast.error("Failed to remove department. Check for active relations.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin shadow-3xl shadow-blue-500/10" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-200 py-16 px-6 font-sans relative overflow-x-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <Link 
                            href="/admin/dashboard" 
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Core Administration
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Organization Map</h1>
                        <p className="text-slate-500 text-lg font-medium">Manage internal departments and domain expertise routing.</p>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input 
                                type="text" 
                                placeholder="Filter departments..."
                                className="w-full bg-[#111] border border-slate-800 outline-none pl-14 pr-6 py-4.5 rounded-[1.5rem] text-[13px] text-white transition-all font-medium placeholder:text-slate-700 shadow-2xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Link 
                            href="/admin/departments/create"
                            className="bg-white text-black font-black px-10 py-4.5 rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-3 shadow-3xl shadow-white/5 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            Create New
                        </Link>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {filteredDepts.length > 0 ? (
                        <motion.div 
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {filteredDepts.map((dept: any) => {
                                const attr = dept.attributes || dept;
                                const docId = dept.documentId || dept.id;
                                const agentCount = attr.agents?.data?.length || attr.agents?.length || 0;

                                return (
                                    <motion.div 
                                        key={dept.id}
                                        layout
                                        className="bg-[#111]/80 backdrop-blur-3xl border border-slate-800/80 rounded-[3rem] p-10 group hover:border-slate-700 transition-all shadow-2xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] pointer-events-none group-hover:bg-blue-500/10 transition-all" />
                                        
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="w-16 h-16 bg-blue-600/10 text-blue-400 rounded-3xl flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-inner">
                                                <Building2 className="w-8 h-8" />
                                            </div>
                                            <button 
                                                onClick={() => handleDelete(docId)}
                                                className="p-3 text-slate-700 hover:text-rose-500 transition-colors bg-black/40 rounded-xl border border-slate-800/50 hover:border-rose-500/20"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="space-y-4 mb-10">
                                            <h3 className="text-2xl font-black text-white leading-tight">{attr.title}</h3>
                                            <div className="flex items-center gap-3 text-xs font-black text-slate-600 uppercase tracking-widest">
                                                <Users className="w-4 h-4 text-blue-500" />
                                                {agentCount} Experts Assigned
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-8 border-t border-slate-800/60">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-1 bg-black/40 rounded-lg border border-slate-800/50">ID: {dept.id}</span>
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Active Zone
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-[#111]/40 border-2 border-slate-800 border-dashed rounded-[3rem] py-32 flex flex-col items-center text-center shadow-inner"
                        >
                            <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-10">
                                <Building2 className="w-10 h-10 text-slate-700" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4">No Organizations Defined</h2>
                            <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed font-medium">
                                The registry is currently empty. Start by creating a new support domain.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
