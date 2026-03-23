import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Loader2, User, UserPlus, Zap, Sparkles, ShieldCheck, Layers, Eye, RefreshCw, BarChart3 } from 'lucide-react';

const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction > 0 ? -200 : 200, opacity: 0 }),
};

const features = [
    { Icon: ShieldCheck, title: '98% Originality Score', desc: 'Every output is AI-generated from scratch — never template-based.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { Icon: Layers, title: 'Multi-Platform Copy', desc: 'SEO descriptions, Instagram captions, and LinkedIn posts in one click.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { Icon: Eye, title: 'Vision AI Analysis', desc: 'Upload product images and let AI analyse visual details automatically.', color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { Icon: RefreshCw, title: 'Infinite Regeneration', desc: 'Regenerate unlimited times — every output is completely unique.', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { Icon: BarChart3, title: 'Smart Tag Generation', desc: 'Auto-generated searchable tags for your product catalog.', color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const staggerItem = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function AuthPage({ setAuth, showToast }) {
    const location = useLocation();
    const isRegisterRoute = location.pathname === '/register';
    const [isLogin, setIsLogin] = useState(!isRegisterRoute);
    const [direction, setDirection] = useState(0);
    const navigate = useNavigate();

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regLoading, setRegLoading] = useState(false);

    const switchToRegister = () => { setDirection(1); setIsLogin(false); };
    const switchToLogin = () => { setDirection(-1); setIsLogin(true); };

    const validateEmail = (email) => {
        return String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validateEmail(loginEmail)) {
            return showToast('Please enter a valid email address containing @.', 'error');
        }
        if (loginPassword.length < 6) {
            return showToast('Password must be at least 6 characters.', 'error');
        }

        setLoginLoading(true);
        try {
            const { data } = await axios.post('/api/auth/login', { email: loginEmail, password: loginPassword });
            localStorage.setItem('token', data.token);
            setAuth(data.user);
            showToast('Login successful!');
            navigate('/dashboard');
        } catch (err) {
            showToast(err.response?.data?.error || 'Login failed', 'error');
        }
        setLoginLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!regName.trim()) {
            return showToast('Please enter your name.', 'error');
        }
        if (!validateEmail(regEmail)) {
            return showToast('Please enter a valid email address containing @.', 'error');
        }
        if (regPassword.length < 6) {
            return showToast('Password must be at least 6 characters.', 'error');
        }

        setRegLoading(true);
        try {
            const { data } = await axios.post('/api/auth/signup', { name: regName, email: regEmail, password: regPassword });
            localStorage.setItem('token', data.token);
            setAuth(data.user);
            showToast('Registration successful!');
            navigate('/dashboard');
        } catch (err) {
            showToast(err.response?.data?.error || 'Registration failed', 'error');
        }
        setRegLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-60px)] px-4 py-10">
            <div className="w-full max-w-[1000px] grid lg:grid-cols-[1fr_420px] gap-10">

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="hidden lg:flex flex-col justify-center p-12 bg-bg2 rounded-2xl border border-border shadow-[var(--shadow-lg)] bg-gradient-to-br from-accent/5 via-bg2 to-violet-500/5 relative overflow-hidden"
                >
                    <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-accent/10 blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-[-40px] left-[-40px] w-[150px] h-[150px] rounded-full bg-violet-500/10 blur-[60px] pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative z-10 mb-8"
                    >
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
                                <Zap size={20} className="fill-current" />
                            </div>
                            <div>
                                <div className="font-extrabold text-lg tracking-tight">CopyForge</div>
                                <div className="text-[11px] text-text3 font-medium">AI-Powered Copy Generator</div>
                            </div>
                        </div>
                        <p className="text-sm text-text2 leading-relaxed">
                            Generate scroll-stopping marketing copy for your products in seconds — powered by advanced AI.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="relative z-10 flex flex-col gap-5"
                    >
                        {features.map(({ Icon, title, desc, color, bg }) => (
                            <motion.div
                                key={title}
                                variants={staggerItem}
                                whileHover={{ x: 4 }}
                                className="flex items-start gap-3 group cursor-default"
                            >
                                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                    <Icon size={18} className={color} />
                                </div>
                                <div>
                                    <div className="text-[13px] font-bold text-text">{title}</div>
                                    <div className="text-[12px] text-text3 leading-relaxed">{desc}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="relative z-10 mt-8 pt-6 border-t border-border/50"
                    >
                        <div className="flex items-center gap-2 text-xs text-text3">
                            <Sparkles size={14} className="text-accent" />
                            <span>Trusted by teams at <span className="font-semibold text-text2">IBM ThinkFest 2026</span></span>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col bg-bg2 rounded-2xl border border-border shadow-[var(--shadow-lg)]">

                    <div className="pt-8 pb-2 flex justify-center lg:hidden">
                        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                            <Zap size={28} className="text-accent fill-current" />
                        </div>
                    </div>

                    <div className="px-8 pt-6 lg:pt-8 pb-2">
                        <div className="relative flex bg-bg rounded-xl p-1 border border-border">
                            <motion.div
                                className="absolute top-1 bottom-1 rounded-lg bg-accent shadow-sm"
                                initial={false}
                                animate={{ left: isLogin ? '4px' : '50%', width: 'calc(50% - 4px)' }}
                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            />
                            <button
                                onClick={switchToLogin}
                                className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${isLogin ? 'text-white' : 'text-text3 hover:text-text2'
                                    }`}
                            >
                                <LogIn size={15} /> Login
                            </button>
                            <button
                                onClick={switchToRegister}
                                className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${!isLogin ? 'text-white' : 'text-text3 hover:text-text2'
                                    }`}
                            >
                                <UserPlus size={15} /> Sign Up
                            </button>
                        </div>
                    </div>

                    <div className="px-8 pb-8 pt-4 relative overflow-hidden" style={{ minHeight: isLogin ? 300 : 370 }}>
                        <AnimatePresence mode="wait" custom={direction}>
                            {isLogin ? (
                                <motion.form
                                    key="login"
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    onSubmit={handleLogin}
                                    className="flex flex-col gap-4"
                                >
                                    <h2 className="text-xl font-extrabold tracking-tight text-center mb-1">Welcome Back</h2>

                                    <div>
                                        <label className="block text-[13px] font-semibold mb-1.5 text-text2">Email</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text3" />
                                            <input
                                                type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bg text-sm outline-none transition-colors focus:border-accent focus:bg-accentLight"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-semibold mb-1.5 text-text2">Password</label>
                                        <div className="relative">
                                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text3" />
                                            <input
                                                type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bg text-sm outline-none transition-colors focus:border-accent focus:bg-accentLight"
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={!loginLoading ? { scale: 1.02 } : {}}
                                        whileTap={!loginLoading ? { scale: 0.98 } : {}}
                                        disabled={loginLoading}
                                        className={`w-full mt-1 py-3 rounded-lg text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${loginLoading ? 'bg-border2 cursor-not-allowed text-text3' : 'bg-accent hover:bg-blue-700'
                                            }`}
                                    >
                                        {loginLoading ? <><Loader2 size={16} className="animate-spin" /> Logging in...</> : <><LogIn size={16} /> Login</>}
                                    </motion.button>

                                    <div className="text-center text-[13px] text-text3 mt-1">
                                        Don't have an account?{' '}
                                        <button type="button" onClick={switchToRegister} className="text-accent font-semibold hover:underline bg-transparent border-none cursor-pointer">
                                            Sign up
                                        </button>
                                    </div>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="register"
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    onSubmit={handleRegister}
                                    className="flex flex-col gap-4"
                                >
                                    <h2 className="text-xl font-extrabold tracking-tight text-center mb-1">Create Account</h2>

                                    <div>
                                        <label className="block text-[13px] font-semibold mb-1.5 text-text2">Name</label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text3" />
                                            <input
                                                type="text" required value={regName} onChange={e => setRegName(e.target.value)}
                                                placeholder="John Doe"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bg text-sm outline-none transition-colors focus:border-accent focus:bg-accentLight"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-semibold mb-1.5 text-text2">Email</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text3" />
                                            <input
                                                type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bg text-sm outline-none transition-colors focus:border-accent focus:bg-accentLight"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-semibold mb-1.5 text-text2">Password</label>
                                        <div className="relative">
                                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text3" />
                                            <input
                                                type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)}
                                                placeholder="Min 6 characters"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bg text-sm outline-none transition-colors focus:border-accent focus:bg-accentLight"
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={!regLoading ? { scale: 1.02 } : {}}
                                        whileTap={!regLoading ? { scale: 0.98 } : {}}
                                        disabled={regLoading}
                                        className={`w-full mt-1 py-3 rounded-lg text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${regLoading ? 'bg-border2 cursor-not-allowed text-text3' : 'bg-accent hover:bg-blue-700'
                                            }`}
                                    >
                                        {regLoading ? <><Loader2 size={16} className="animate-spin" /> Signing up...</> : <><UserPlus size={16} /> Sign Up</>}
                                    </motion.button>

                                    <div className="text-center text-[13px] text-text3 mt-1">
                                        Already have an account?{' '}
                                        <button type="button" onClick={switchToLogin} className="text-accent font-semibold hover:underline bg-transparent border-none cursor-pointer">
                                            Login
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
