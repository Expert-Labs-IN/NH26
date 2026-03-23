import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, Loader2 } from 'lucide-react';

export default function Register({ setAuth, showToast }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('/api/auth/signup', { name, email, password });
            localStorage.setItem('token', data.token);
            setAuth(data.user);
            showToast('Registration successful!');
            navigate('/dashboard');
        } catch (err) {
            showToast(err.response?.data?.error || 'Registration failed', 'error');
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[400px] w-full mx-auto mt-[10vh] p-8 bg-bg2 rounded-[var(--radius)] border border-border shadow-[var(--shadow-lg)]"
        >
            <div className="flex justify-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-accentLight text-accent flex items-center justify-center">
                    <UserPlus size={24} />
                </div>
            </div>
            <h2 className="text-2xl font-extrabold mb-8 text-center tracking-tight">Create Account</h2>
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
                <div>
                    <label className="block text-[13px] font-semibold mb-1.5 text-text2">Name</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text3" />
                        <input
                            type="text" required value={name} onChange={e => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bg text-sm outline-none transition-colors focus:border-accent focus:bg-accentLight"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[13px] font-semibold mb-1.5 text-text2">Email</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text3" />
                        <input
                            type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bg text-sm outline-none transition-colors focus:border-accent focus:bg-accentLight"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[13px] font-semibold mb-1.5 text-text2">Password</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text3" />
                        <input
                            type="password" required value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bg text-sm outline-none transition-colors focus:border-accent focus:bg-accentLight"
                        />
                    </div>
                </div>
                <button
                    disabled={loading}
                    className={`w-full mt-2 py-3 rounded-lg text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${loading ? 'bg-border2 cursor-not-allowed text-text3' : 'bg-accent hover:bg-blue-700'}`}
                >
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Signing up...</> : 'Sign Up'}
                </button>
            </form>
            <div className="mt-6 text-center text-[13px] text-text3">
                Already have an account? <Link to="/login" className="text-accent font-semibold hover:underline">Login</Link>
            </div>
        </motion.div>
    );
}
