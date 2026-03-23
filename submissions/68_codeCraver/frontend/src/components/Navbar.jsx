import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, LogOut, LogIn, UserPlus, Upload, Shield } from 'lucide-react'

export default function Navbar({ user, onLogout }) {
    return (
        <nav className="bg-bg2 border-b border-border px-6 sm:px-10 h-[60px] flex items-center justify-between sticky top-0 z-50 shadow-[0_1px_0_var(--border)]">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white">
                    <Zap size={16} className="fill-current" />
                </div>
                <Link to="/" className="font-extrabold text-[18px] tracking-tight text-text no-underline">ShopScribe</Link>
                <span className="text-[10px] font-bold bg-accentLight text-accent px-2 py-0.5 rounded-full tracking-wider">AI</span>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <Link to="/bulk" className="flex items-center gap-1.5 text-[13px] font-semibold text-text2 hover:text-accent no-underline transition-colors">
                            <Upload size={14} /> Bulk Upload
                        </Link>
                        {user?.role === 'admin' && (
                            <Link
                                to="/admin/dashboard"
                                className="flex items-center gap-1.5 text-[13px] font-semibold text-text2 hover:text-accent no-underline transition-colors"
                            >
                                <Shield size={14} /> Admin
                            </Link>
                        )}
                        <span className="text-sm font-semibold text-text2 hidden sm:block">{user.name}</span>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-1.5 bg-transparent border border-border px-3 py-1.5 rounded-md text-[13px] font-semibold text-text2 hover:bg-bg transition-colors"
                        >
                            <LogOut size={14} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="flex items-center gap-1.5 text-sm font-semibold text-text2 hover:text-text no-underline transition-colors"><LogIn size={15} /> Login</Link>
                        <Link to="/register" className="flex items-center gap-1.5 bg-accent hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-semibold no-underline transition-colors shadow-sm"><UserPlus size={15} /> Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    )
}
