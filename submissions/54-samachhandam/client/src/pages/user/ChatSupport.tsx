import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, MessageSquare, Sparkles } from 'lucide-react';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatMessageInput from '@/components/chat/ChatMessageInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { post } from '@/utils/api/apiMethod';

interface Message {
  id: string | number;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  isComplain?: boolean;
  complaintData?: any;
  isSubmitted?: boolean;
}

const ChatSupport: React.FC = () => {
  const { user } = useAuth();
  const { id: sessionIdFromUrl } = useParams();
  const navigate = useNavigate();
  
  const [sessionId, setSessionId] = useState<string | null>(sessionIdFromUrl || null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi ${user?.name || 'there'}! I'm ResolveX AI. Tell me about the issue you're facing, and I'll help you file a report.`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const initChat = useCallback(async () => {
    if (!sessionIdFromUrl) {
      try {
        const response = await api.chat.createSession();
        if (response.success) {
          const sid = response.data.session_id.sessionId;
          setSessionId(sid);
          navigate(`/chat/${sid}`, { replace: true });
        } else {
          console.error("Created session unsuccessful", response.message);
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error("Failed to create chat session:", error);
        navigate('/dashboard', { replace: true });
      }
    }
  }, [sessionIdFromUrl, navigate]);

  useEffect(() => {
    initChat();
  }, [initChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleAIResponse = useCallback((response: any) => {
    const botMessage: Message = {
      id: Date.now() + 2,
      content: response.reply,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isComplain: response.isComplain,
      complaintData: response.complaint
    };
    setMessages(prev => [...prev, botMessage]);
  }, []);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now(),
      content,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      if (!sessionId) {
        const response = await api.chat.createSession();
        const sid = response.data.session_id.sessionId;
        setSessionId(sid);
        navigate(`/chat/${sid}`, { replace: true });
        const chatResp = await api.chat.sendMessage(sid, content);
        handleAIResponse(chatResp);
      } else {
        const response = await api.chat.sendMessage(sessionId, content);
        handleAIResponse(response);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
          id: Date.now() + 1,
          content: "Sorry, I'm having trouble connecting to the AI. Please try again later.",
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCreateComplaint = async (messageId: string | number, complaintData: any) => {
    try {
        let currentCoords = {
            latitude: complaintData.coordinates?.latitude || user?.location?.lat || null,
            longitude: complaintData.coordinates?.longitude || user?.location?.lng || null
        };

        if ("geolocation" in navigator) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                });
                currentCoords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
            } catch (err) {
                console.warn("Geolocation failed, using fallback:", err);
            }
        }

        const payload = {
            complained_by: user?._id || complaintData.complained_by,
            description: complaintData.description,
            coordinates: currentCoords,
            status: "Pending",
            category: complaintData.category?._id || complaintData.category,
            priority: complaintData.priority,
            title: complaintData.title
        };

        const response = await post("complain", payload);
        if (response) {
            setMessages(prev => prev.map(msg => 
                msg.id === messageId ? { ...msg, isSubmitted: true } : msg
            ));
            
            setMessages(prev => [...prev, {
                id: Date.now() + 3,
                content: "Your complaint has been successfully raised! You can track it in your dashboard.",
                role: 'assistant',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    } catch (error) {
        console.error("Complaint creation failed:", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all">
      {/* Header */}
      <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10">
            <MessageSquare size={18} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-tight">AI Support Agent</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <Sparkles size={12} className="text-blue-600" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">AI Powered</span>
        </div>
      </div>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-white dark:bg-zinc-900"
      >
        {messages.map((message) => (
          <div key={message.id}>
            <ChatBubble
              isBot={message.role === 'assistant'}
              message={message.content}
              timestamp={message.timestamp}
            >
              {message.role === 'assistant' && message.isComplain && !message.isSubmitted && message.complaintData && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                          <h4 className="font-bold text-[11px] text-zinc-900 dark:text-white uppercase tracking-widest">Report Drafted</h4>
                      </div>
                      
                      <div className="space-y-3 mb-4 bg-zinc-50/50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                          <div>
                              <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-0.5">Title</p>
                              <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight uppercase tracking-tight">{message.complaintData.title || "Waste Report"}</p>
                          </div>
                          <div>
                              <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-0.5">Summary</p>
                              <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">{message.complaintData.description || "Issue described in chat"}</p>
                          </div>
                      </div>

                      <button
                          onClick={() => handleCreateComplaint(message.id, message.complaintData)}
                          className="w-full bg-zinc-900 dark:bg-zinc-800 hover:bg-blue-600 text-white rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-[0.98]"
                      >
                          <span>Confirm & Raise Report</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>
              )}
            </ChatBubble>
          </div>
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input area */}
      <div className="p-4 bg-zinc-50/30 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800">
        <ChatMessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatSupport;
