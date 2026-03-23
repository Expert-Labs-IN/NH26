"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function PortalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Portal Runtime Crisis:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 glass-panel border-red-500/20 bg-red-500/5">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-2">
                Neural Synchronization Interrupted
            </h2>

            <p className="text-white/40 text-sm max-w-md text-center mb-8 font-medium">
                Reason: {error.message || "Unknown portal disconnect."}
            </p>

            <button
                onClick={() => reset()}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#4F7CFF] text-black text-xs font-black uppercase tracking-widest hover:bg-[#7aa0ff] transition-all shadow-[0_0_20px_rgba(79,124,255,0.4)]"
            >
                <RefreshCcw className="w-4 h-4" /> Attempt Re-Sync
            </button>
        </div>
    );
}
