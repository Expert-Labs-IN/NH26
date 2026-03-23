"use client";

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/auth/login");
            } else if (!isAdmin) {
                router.push("/portal/assistant");
            }
        }
    }, [user, loading, isAdmin, router]);

    if (loading || !user || !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0B]">
                <Loader2 className="w-10 h-10 text-[#F4C430] animate-spin mb-6" />
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Authenticating Admin Node...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-transparent selection:bg-[#F4C430] selection:text-black">
            <Sidebar />

            <main className="flex-1 p-10 lg:p-14 overflow-y-auto relative z-10 w-full scroll-smooth">
                <div className="max-w-[1600px] mx-auto min-h-full">
                    {children}
                </div>
            </main>

            {/* Global Ambient Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-[#F4C430] opacity-[0.03] blur-[150px] rounded-full" />
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-[#4F7CFF] opacity-[0.02] blur-[150px] rounded-full" />
            </div>
        </div>
    );
}
