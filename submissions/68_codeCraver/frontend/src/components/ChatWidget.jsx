import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  'How do I write better product descriptions?',
  'Tips for Instagram product captions',
  'Best SEO practices for e-commerce',
  'Help me brainstorm product names',
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey! 👋 I\'m your CopyForge AI assistant. Ask me anything about product copywriting, SEO, social media marketing, or branding!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const userMsg = { role: 'user', content: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const apiMessages = newMessages
        .slice(1)
        .map(m => ({ role: m.role, content: m.content }))

      const { data } = await axios.post('/api/chat', { messages: apiMessages })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      console.error('Chat error:', err.response?.data || err.message)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I hit an error. Please try again! 😅' }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const showSuggestions = messages.length <= 1

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-shadow"
          >
            <MessageCircle size={24} className="fill-current" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[560px] bg-bg2 rounded-2xl border border-border shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-accent/5 to-violet-500/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="text-[14px] font-bold">CopyForge Assistant</div>
                  <div className="text-[11px] text-text3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Online · Powered by AI
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-bg3 flex items-center justify-center text-text3 hover:text-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'user' ? 'bg-accent/10 text-accent' : 'bg-violet-500/10 text-violet-600'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`max-w-[280px] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent text-white rounded-tr-md'
                      : 'bg-bg3 text-text rounded-tl-md border border-border'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="bg-bg3 border border-border px-4 py-3 rounded-2xl rounded-tl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-text3 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-text3 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-text3 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {showSuggestions && (
                <div className="pt-2 space-y-1.5">
                  <div className="text-[11px] font-semibold text-text3 uppercase tracking-wide mb-2">Try asking:</div>
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="block w-full text-left px-3 py-2 rounded-lg text-[12px] text-text2 bg-bg hover:bg-accentLight hover:text-accent border border-border hover:border-accent/30 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-border bg-bg">
              <div className="flex items-center gap-2 bg-bg2 border border-border rounded-xl px-3 py-1 focus-within:border-accent transition-colors">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about copywriting..."
                  disabled={loading}
                  className="flex-1 py-2 text-[13px] bg-transparent outline-none text-text placeholder:text-text3"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    input.trim() && !loading
                      ? 'bg-accent text-white hover:bg-blue-700'
                      : 'bg-bg3 text-text3 cursor-not-allowed'
                  }`}
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
