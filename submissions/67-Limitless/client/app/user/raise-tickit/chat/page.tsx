"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, CheckCircle2, Building2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

type Message = {
    role: "user" | "assistant" | "system";
    content: string;
};

export default function ChatbotPage() {
    const { data: session } = useSession();
    
    const [departments, setDepartments] = useState<any[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<any | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [guidelines, setGuidelines] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/departments")
            .then(res => res.json())
            .then(res => {
                if (res.data) setDepartments(res.data);
            })
            .catch(err => console.error("Failed to fetch departments", err));

        fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/company-support-context`,{
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
            },
        })
            .then(res => res.json())
            .then(res => {
                if (res.data) setGuidelines(res.data.context || res.data?.context);
            })
            .catch(err => console.error("Failed to fetch guidelines", err));
        
    }, []);

    console.log(departments)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleEscalation = async (escalationData: any, entireChat: any[]) => {
        try {
            // Inject strictly selected department into escalation payload
            const assignedDepartmentId = selectedDepartment?.documentId || selectedDepartment?.attributes?.id || escalationData.category;

            const res = await fetch("/api/create-ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: escalationData.title,
                    summary: escalationData.summary,
                    departmentId: assignedDepartmentId,
                    severity: escalationData.severity,
                    messages: entireChat
                })
            });

            if (res.ok) {
                toast.success("Ticket instantly escalated to our human experts.");
            } else {
                toast.error("Failed to automatically escalate ticket.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Connectivity issue during escalation.");
        }
    };

    const processMessageStream = async (text: string, currentMessages: Message[]) => {
        // Bulletproof JSON extraction: Identify the main JSON body dynamically.
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        
        if (start !== -1 && end !== -1 && start < end) {
            const possibleJson = text.substring(start, end + 1);
            
            if (possibleJson.includes('_action') && possibleJson.includes('escalate')) {
                try {
                    // Scrub AI hallucinated syntax like double-double quotes `""key""` or trailing commas
                    // Also strip stray spaces out of property keys! (e.g. " _action": )
                    const safeJson = possibleJson
                        .replace(/""/g, '"') 
                        .replace(/"\s+([^"]+)"\s*:/g, '"$1":')
                        .replace(/,\s*}/g, '}'); 
                        
                    const parsed = JSON.parse(safeJson);
                    
                    if (parsed._action === "escalate") {
                        // Remove the JSON string and markdown artifacts from the user-facing message
                        const cleanedText = text.substring(0, start).replace(/```\w*\n?/g, '').trim();
                        
                        setMessages(prev => {
                            const newMsg = [...prev];
                            newMsg[newMsg.length - 1].content = cleanedText || "I am escalating this issue to our human experts.";
                            newMsg.push({
                                role: "system",
                                content: `Ticket Escalated: ${parsed.title || 'Untitled'} (Severity: ${parsed.severity || 'Unspecified'})`
                            });
                            return newMsg;
                        });
                        
                        await handleEscalation(parsed, currentMessages);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to parse escalation JSON. Raw payload:", possibleJson, "Error:", e);
                }
            }
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Add context that the user relates to a specific department on the very first message sent
        let isFirstMessage = messages.filter(m => m.role === "user").length === 0;
        let finalInput = input.trim();
        
        if (isFirstMessage && selectedDepartment) {
            const deptName = selectedDepartment?.title || selectedDepartment?.attributes?.title;
            finalInput = `[Context: I am contacting the ${deptName} department.]\n${finalInput}`;
        }

        const newMessages: Message[] = [...messages, { role: "user", content: finalInput }];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ departmentId: selectedDepartment?.documentId,messages: newMessages, stream: true, guidelines }),
            });

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let assistantResponse = "";

            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                let lines = buffer.split("\n");
                
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith("data:")) continue;

                    const jsonStr = trimmed.replace("data:", "").trim();
                    if (jsonStr === "[DONE]") {
                        buffer = "";
                        break;
                    }

                    try {
                        const parsed = JSON.parse(jsonStr);
                        const contentPiece = parsed.choices?.[0]?.delta?.content;

                        if (contentPiece) {
                            assistantResponse += contentPiece;

                            setMessages((prev) => {
                                const updated = [...prev];
                                
                                // Hide JSON block from the user while it is actively streaming
                                let displayContent = assistantResponse;
                                const hideIndex = displayContent.indexOf('```json');
                                if (hideIndex !== -1) {
                                    if (!displayContent.includes('_action')) {
                                        // Still generating the JSON, show a nice loader string
                                        displayContent = displayContent.substring(0, hideIndex) + "\n\n*⚙️ Generating Ticket...*";
                                    } else {
                                        displayContent = displayContent.substring(0, hideIndex) + "\n\n*⚙️ Escalating to human experts...*";
                                    }
                                }

                                updated[updated.length - 1].content = displayContent;
                                return updated;
                            });
                        }
                    } catch (err) {
                        console.error("Stream parse error:", jsonStr, err);
                    }
                }
            }

            await processMessageStream(assistantResponse, newMessages);

        } catch (err) {
            console.error(err);
            setMessages((prev) => [...prev, { role: "assistant", content: "I am having connectivity issues. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // UI: Department Selection Screen
    if (!selectedDepartment) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] flex items-center justify-center font-sans p-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg p-8 bg-[#111] rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/10 blur-[80px] pointer-events-none rounded-full -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="mb-6 inline-flex p-3 bg-blue-900/30 text-blue-400 rounded-xl border border-blue-800/50">
                        <Building2 className="w-6 h-6" />
                    </div>
                    
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Select Issue Category</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">Please choose the relevant category so we can route your ticket directly to the right specialized experts.</p>
                    
                    <div className="space-y-3 relative z-10">
                        {departments.length === 0 ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                            </div>
                        ) : (
                            departments.map(dept => {
                                const deptName = dept.title || dept.attributes?.title;
                                return (
                                    <button
                                        key={dept.id}
                                        onClick={() => {
                                            setSelectedDepartment(dept);
                                            setMessages([
                                                { role: "assistant", content: `Hi there! I am Sarathi representing the **${deptName}** department. How can I help resolve your issue today?` }
                                            ]);
                                        }}
                                        className="w-full text-left p-5 rounded-2xl bg-[#151515] border border-slate-800 hover:bg-[#1a1a1a] hover:border-slate-600 transition-all text-white font-medium flex items-center justify-between group"
                                    >
                                        <span>{deptName}</span>
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                            <Send className="w-4 h-4 ml-0.5 opacity-50 group-hover:opacity-100" />
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    // UI: Main Chat Interface
    return (
        <div className="h-[calc(100vh-64px)] bg-[#0a0a0a] flex justify-center py-8 font-sans">
            <div className="w-full max-w-4xl bg-[#111] rounded-2xl border border-slate-800 flex flex-col shadow-2xl overflow-hidden relative">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 bg-[#151515] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-900/40 text-blue-400 rounded-lg">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white tracking-tight">Sarathi Support • {selectedDepartment?.title || selectedDepartment?.attributes?.title}</h2>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-medium text-slate-400">AI Active & Listening</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Display */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <AnimatePresence>
                        {messages.map((msg, idx) => {
                            const isUser = msg.role === "user";
                            const isSystem = msg.role === "system";

                            if (isSystem) {
                                return (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex justify-center my-4"
                                    >
                                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/20 border border-emerald-800/50 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wide">
                                            <CheckCircle2 className="w-4 h-4" />
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                );
                            }

                            // If it's a context injected prompt from User side, hide the context metadata explicitly on UI.
                            let displayContent = msg.content;
                            if (isUser && displayContent.startsWith("[Context:")) {
                                displayContent = displayContent.split("]\n").slice(1).join("]\n");
                            }

                            return (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${isUser ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'}`}>
                                            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed relative whitespace-pre-wrap ${isUser ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-[#1a1a1a] text-slate-300 border border-slate-800/80 rounded-tl-none'}`}>
                                            {displayContent}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        {isLoading && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex w-full justify-start"
                            >
                                <div className="flex gap-3 max-w-[85%] flex-row">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="px-5 py-3.5 rounded-2xl bg-[#1a1a1a] border border-slate-800/80 rounded-tl-none flex items-center gap-1.5">
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-slate-500 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-slate-500 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-slate-500 rounded-full" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <div className="p-4 bg-[#151515] border-t border-slate-800">
                    <form onSubmit={sendMessage} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full bg-[#0a0a0a] text-white border border-slate-800 rounded-full pl-6 pr-14 py-4 outline-none focus:ring-1 focus:ring-slate-700 transition-all font-medium text-sm shadow-inner"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 p-2.5 bg-white text-black rounded-full hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                        </button>
                    </form>
                    <p className="text-center text-xs text-slate-500 mt-3 font-medium">
                        Sarathi AI may make mistakes. We automatically flag unresolvable issues for human review.
                    </p>
                </div>
            </div>
        </div>
    );
}
