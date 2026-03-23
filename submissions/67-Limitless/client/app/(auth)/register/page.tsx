"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, User } from "lucide-react";
import { strapi } from "@/lib/sdk/sdk";

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const emailError = email && !validateEmail(email) ? "Enter a valid email address." : "";
    const passwordError =
        password && password.length < 6 ? "Password must be at least 6 characters." : "";
    const confirmError =
        confirmPassword && confirmPassword !== password ? "Passwords do not match." : "";

    const isValid =
        username.trim().length >= 2 &&
        validateEmail(email) &&
        password.length >= 6 &&
        password === confirmPassword;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isValid) return;
        setError("");
        setLoading(true);

        try {
            // Using the new Strapi SDK directly
            await strapi.register({
                username: username.trim() + Math.random().toString(36).substring(2, 10),
                email: email.trim(),
                password,
            });

            // Auto sign-in after successful registration
            const result: any = await signIn("credentials", {
                redirect: false,
                identifier: email.trim(),
                password,
            });

            if (result?.error) {
                router.push("/login?registered=true");
            } else {

                const update = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users`,{
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${result?.jwt}`,
                    },
                    body: JSON.stringify({
                        fullName: username.trim(),
                    }),
                })

                router.push("/");
                router.refresh();
            }
        } catch (err: any) {
            const msg =
                err?.error?.message ||
                err?.message ||
                "Something went wrong. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center"
            >
                <div className="bg-white text-black p-2.5 rounded-xl shadow-lg mb-4">
                    <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
                    Create an account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    Join Sarathi today — it&apos;s completely free
                </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
            >
                <div className="bg-[#111] py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-800">
                    {error && (
                        <div className="mb-6 bg-red-900/30 border border-red-800/50 rounded-lg p-4 flex gap-3 text-red-400 items-start">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300" htmlFor="username">
                                Username
                            </label>
                            <div className="mt-2 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    className="block w-full text-white bg-transparent pl-10 px-3 py-3 border border-slate-800 rounded-xl focus:ring-2 focus:ring-white focus:border-white sm:text-sm outline-none transition-all placeholder-slate-600"
                                    placeholder="johndoe"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    disabled={loading}
                                />
                            </div>
                            {username.length > 0 && username.trim().length < 2 && (
                                <p className="mt-1 text-xs text-red-400">Username must be at least 2 characters.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300" htmlFor="email">
                                Email address
                            </label>
                            <div className="mt-2 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    className={`block w-full text-white bg-transparent pl-10 px-3 py-3 border rounded-xl focus:ring-2 focus:ring-white focus:border-white sm:text-sm outline-none transition-all placeholder-slate-600 ${emailError ? 'border-red-500/50' : 'border-slate-800'}`}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    disabled={loading}
                                />
                            </div>
                            {emailError && <p className="mt-1 text-xs text-red-400">{emailError}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300" htmlFor="password">
                                Password
                            </label>
                            <div className="mt-2 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className={`block w-full text-white bg-transparent pl-10 pr-10 px-3 py-3 border rounded-xl focus:ring-2 focus:ring-white focus:border-white sm:text-sm outline-none transition-all placeholder-slate-600 ${passwordError ? 'border-red-500/50' : 'border-slate-800'}`}
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {passwordError && <p className="mt-1 text-xs text-red-400">{passwordError}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300" htmlFor="confirm-password">
                                Confirm Password
                            </label>
                            <div className="mt-2 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="confirm-password"
                                    type={showPassword ? "text" : "password"}
                                    className={`block w-full text-white bg-transparent pl-10 pr-10 px-3 py-3 border rounded-xl focus:ring-2 focus:ring-white focus:border-white sm:text-sm outline-none transition-all placeholder-slate-600 ${confirmError ? 'border-red-500/50' : 'border-slate-800'}`}
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                            </div>
                            {confirmError && <p className="mt-1 text-xs text-red-400">{confirmError}</p>}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || !isValid}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-black bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin text-black" />
                                        Creating account...
                                    </>
                                ) : (
                                    "Create account"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <p className="text-center text-xs text-slate-500">
                            By registering, you agree to our{" "}
                            <a href="#" className="font-semibold text-white hover:underline">Terms of Service</a> and{" "}
                            <a href="#" className="font-semibold text-white hover:underline">Privacy Policy</a>.
                        </p>
                    </div>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link href="/login" className="font-bold text-white hover:text-slate-200 transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
