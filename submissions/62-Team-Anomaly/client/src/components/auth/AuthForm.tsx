"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Lock, Mail, ArrowRight, Loader2, UserPlus, LogIn } from "lucide-react";
import Link from "next/link";

interface AuthFormProps {
    type: "login" | "signup";
}

export default function AuthForm({ type }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (type === "signup") {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/portal/assistant`,
                    },
                });
                if (error) throw error;
                setMessage({ type: "success", text: "Neural link established. Please check your email for verification." });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                window.location.href = email.endsWith('@admin.com') ? '/tickets' : '/portal/assistant';
            }
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Neuro-link failed. Access denied." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 border-white/5 bg-white/[0.02]"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[#0052FF] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <div className="w-4 h-4 border-[3px] border-white rounded-[4px]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-heading font-black text-white uppercase tracking-tight">
                            {type === "login" ? "Access Matrix" : "Create Node"}
                        </h2>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">WorkSync Secure Protocol</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1 mb-2 block">
                            Employee Node Email
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#0052FF] transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-[#0052FF]/50 transition-all"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1 mb-2 block">
                            Neural Passkey
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#0052FF] transition-colors" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-[#0052FF]/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${message.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full bg-[#0052FF] hover:bg-[#1E66FF] text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                {type === "login" ? "Authorize Entry" : "Synchronize Node"}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        {type === "login" ? "New to the Matrix?" : "Already have a Node?"}{" "}
                        <Link
                            href={type === "login" ? "/auth/signup" : "/auth/login"}
                            className="text-[#0052FF] hover:text-[#4F7CFF] transition-colors ml-2"
                        >
                            {type === "login" ? "Create Identity" : "Authorize Exit"}
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
