import { Send, Bot, User, Sparkles } from "lucide-react";

export default function ChatPanel() {
    return (
        <div className="glow-behind h-full flex flex-col">
            <div className="glass-panel p-0 flex-1 flex flex-col min-h-[450px]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#4F7CFF]/20 flex items-center justify-center border border-[#4F7CFF]/20">
                            <Bot className="w-5 h-5 text-[#4F7CFF]" />
                        </div>
                        <div>
                            <h3 className="font-heading font-bold text-white tracking-tight">ResolveX Intelligence</h3>
                            <p className="text-[10px] uppercase tracking-wider text-[#4CAF9A] flex items-center gap-1.5 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_#4CAF9A]" /> System Online
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                            <Sparkles className="w-4 h-4 text-white/40" />
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                    {/* User Message */}
                    <div className="flex gap-4 items-start max-w-[90%]">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                            <User className="w-4 h-4 text-white/80" />
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-5 py-3 text-sm text-white/90 leading-relaxed">
                            Ticket #T-8942: Customer reports "Advanced Analytics" module is locked after premium upgrade. Account shows active status.
                        </div>
                    </div>

                    {/* AI Message */}
                    <div className="flex gap-4 items-start max-w-[90%] self-end flex-row-reverse">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-[#4F7CFF]/20 flex items-center justify-center border border-[#4F7CFF]/30 shadow-[0_0_20px_rgba(79,124,255,0.2)]">
                            <Sparkles className="w-4 h-4 text-[#4F7CFF]" />
                        </div>
                        <div className="bg-[#4F7CFF]/10 border border-[#4F7CFF]/20 rounded-2xl rounded-tr-sm px-5 py-4 text-sm text-white/95 leading-relaxed shadow-lg">
                            <p className="font-medium text-[#4F7CFF] mb-1 text-xs uppercase tracking-tighter">AI Diagnosis</p>
                            <p>I've identified a cache invalidation delay on the permissions shard. The payment was successful but the feature flag hasn't propagated to the local CDN entry.</p>
                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                                <span className="bg-black/40 border border-white/10 rounded-md px-2 py-1 text-[10px] font-bold text-[#F4C430] uppercase">Confidence: 98.4%</span>
                                <span className="bg-black/40 border border-white/10 rounded-md px-2 py-1 text-[10px] font-bold text-white/40 uppercase">Provisioning Engine</span>
                            </div>
                            <button className="mt-4 w-full py-2.5 bg-[#F4C430] hover:bg-[#ffe3a1] text-black font-bold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(244,196,48,0.2)] uppercase tracking-wide">
                                Force Shard Sync
                            </button>
                        </div>
                    </div>
                </div>

                {/* Input */}
                <div className="p-5 bg-black/40 border-t border-white/10 backdrop-blur-md">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Type message to AI Support..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F4C430]/40 focus:ring-1 focus:ring-[#F4C430]/20 transition-all shadow-inner"
                        />
                        <button className="absolute right-2.5 w-10 h-10 rounded-xl bg-[#F4C430] hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-[0_0_20px_rgba(244,196,48,0.4)]">
                            <Send className="w-5 h-5 text-black" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
