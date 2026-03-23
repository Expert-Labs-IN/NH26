"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Sparkles, MessageCircle, AlertCircle, CheckCircle2, Phone } from "lucide-react";
import clsx from "clsx";

type Message = {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
    type?: "text" | "action" | "status";
};

export default function UserChatPanel() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "ai",
            content: "Hello! I'm your WorkSync Support Assistant. How can I help you today? I can answer questions about policies, IT access, or help you file a new complaint.",
            timestamp: new Date(),
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        // Real AI Logic via Groq
        try {
            const history = messages.map(m => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.content
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: inputValue, history })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const aiMsg: Message = {
                id: Date.now().toString(),
                role: "ai",
                content: data.response || "Neural node synchronization interrupted.",
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (err: any) {
            console.error("Chat API Error:", err);
            const errorMsg: Message = {
                id: Date.now().toString(),
                role: "ai",
                content: `ERROR: ${err.message}`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const openVoiceCall = () => {
        window.open('https://omnidim.io/agent/131022', '_blank');
    };

    return (
        <div className="flex-1 flex flex-col glass-panel bg-white/[0.02] border-white/10 overflow-hidden relative">
            {/* Header / Status */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#4CAF9A] shadow-[0_0_8px_#4CAF9A] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Neural Node Active</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={openVoiceCall}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0052FF]/10 border border-[#0052FF]/20 text-[#0052FF] text-[10px] font-black uppercase tracking-widest hover:bg-[#0052FF] hover:text-white transition-all group"
                    >
                        <Phone className="w-3 h-3 group-hover:animate-bounce" /> Call AI Assistant
                    </button>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" /> Powered by WorkSync AI
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                {messages.map((m) => (
                    <div key={m.id} className={clsx("flex gap-4 max-w-[85%]", m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}>
                        <div className={clsx(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-lg",
                            m.role === "user" ? "bg-white/10 border-white/10" : "bg-[#4F7CFF]/10 border-[#4F7CFF]/20"
                        )}>
                            {m.role === "user" ? <User className="w-4 h-4 text-white/60" /> : <Bot className="w-4 h-4 text-[#4F7CFF]" />}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className={clsx(
                                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                                m.role === "user"
                                    ? "bg-white/[0.05] text-white/90 rounded-tr-none border border-white/5"
                                    : "bg-[#4F7CFF]/[0.03] text-white/80 rounded-tl-none border border-[#4F7CFF]/10"
                            )}>
                                {m.content}
                            </div>
                            <span className={clsx("text-[9px] font-bold uppercase tracking-widest opacity-20", m.role === "user" ? "text-right" : "text-left")}>
                                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-4 mr-auto animate-pulse">
                        <div className="w-8 h-8 rounded-xl bg-[#4F7CFF]/10 border border-[#4F7CFF]/20 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-[#4F7CFF]/50" />
                        </div>
                        <div className="bg-[#4F7CFF]/5 border border-[#4F7CFF]/10 px-4 py-3 rounded-2xl rounded-tl-none text-[10px] uppercase font-black tracking-widest text-[#4F7CFF]/40">
                            Neural node processing...
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-6 bg-black/20 border-t border-white/5">
                <div className="flex gap-4 items-center relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Describe your issue or ask a question..."
                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm text-white focus:outline-none focus:border-[#4F7CFF]/30 transition-all font-medium placeholder:text-white/20"
                    />
                    <button
                        onClick={handleSend}
                        className="absolute right-2 w-10 h-10 bg-[#4F7CFF] text-black rounded-xl flex items-center justify-center hover:bg-[#7aa0ff] transition-all shadow-[0_0_15px_rgba(79,124,255,0.3)] group"
                    >
                        <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {["Password Reset", "HR Policy", "IT Software Request", "Facilities Issue"].map(suggestion => (
                        <button
                            key={suggestion}
                            onClick={() => { setInputValue(suggestion); }}
                            className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-[9px] font-black uppercase tracking-wider text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
