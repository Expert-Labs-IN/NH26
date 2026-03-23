import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
    { name: "Product", href: "#product" },
    { name: "Features", href: "#features" },
    { name: "How it works", href: "#how-it-works" },
    { name: "Security", href: "#security" },
];

export default function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-4 bg-white/80 backdrop-blur-md border-b border-gray-100" : "py-6 bg-transparent"}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link href="/" className="flex items-center gap-3 group">
                            {/* High-Fidelity Hollow Square Logo */}
                            <div className="w-10 h-10 rounded-xl bg-[#0052FF] flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <div className="w-4 h-4 border-[3px] border-white rounded-[4px]" />
                            </div>
                            <span className="font-heading font-black text-2xl tracking-tighter text-[#000000] uppercase">WorkSync</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-10">
                            {NAV_LINKS.map(link => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-[13px] font-semibold text-[#64748B] hover:text-[#0052FF] transition-colors tracking-wide"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/auth/login" className="hidden sm:block text-[13px] font-bold text-[#64748B] hover:text-[#000] transition-colors px-4 py-2">
                            Log in
                        </Link>
                        <Link href="/auth/signup" className="hidden sm:block text-[13px] font-bold text-[#64748B] hover:text-[#000] transition-colors px-4 py-2">
                            Sign up
                        </Link>
                        <Link href="/auth/signup" className="hidden sm:block ml-2">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(0, 82, 255, 0.2)" }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-[#0052FF] text-white px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-[#1E66FF] transition-all flex items-center gap-3 shadow-xl shadow-blue-500/10"
                            >
                                Get Started <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </Link>
                        <button
                            className="md:hidden p-2 text-gray-600"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </nav>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-8">
                            {NAV_LINKS.map(link => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-2xl font-black text-[#121212] flex items-center justify-between group"
                                >
                                    {link.name}
                                    <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all text-[#0052FF]" />
                                </Link>
                            ))}
                            <div className="h-px bg-gray-100 my-4" />
                            <Link href="/tickets" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-gray-500">Log in</Link>
                            <Link href="/portal/assistant" onClick={() => setMobileMenuOpen(false)}>
                                <button className="w-full bg-[#121212] text-white py-4 rounded-2xl font-black uppercase tracking-widest">
                                    Launch Demo
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
