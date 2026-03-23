"use client";

import UserSidebar from "./UserSidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0E0E10]">
                <Loader2 className="w-10 h-10 text-[#0052FF] animate-spin mb-6" />
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Synchronizing Neuro-Link...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0E0E10] overflow-hidden text-white font-sans selection:bg-[#4F7CFF]/30 selection:text-white">
            {/* Background Glows (Blue Tint for Portal) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4F7CFF]/10 blur-[120px] rounded-full opacity-50 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4F7CFF]/5 blur-[120px] rounded-full opacity-30" />
                <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-[#4CAF9A]/5 blur-[120px] rounded-full opacity-20" />
            </div>

            <UserSidebar />

            <main className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden p-10 custom-scrollbar mt-4">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
