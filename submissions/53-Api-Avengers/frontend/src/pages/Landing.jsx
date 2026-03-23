import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Mail, 
  Search, 
  Check, 
  Calendar,
  Zap,
  Shield,
  User,
  MessageSquare,
  Clock,
  ChevronRight
} from 'lucide-react';

const Nav = () => (
  <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight text-white uppercase italic">Agentic AI</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
        <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</a>
        <a href="#docs" className="text-sm text-white/60 hover:text-white transition-colors">Docs</a>
      </div>
      <Link to="/inbox" className="bg-secondary text-white text-xs font-bold px-5 py-2.5 rounded-sm hover:brightness-110 transition-all">
        Get Started
      </Link>
    </div>
  </nav>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-secondary/30 selection:text-white pb-20">
      <Nav />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 text-center overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
               backgroundSize: '80px 80px' 
             }}></div>
        
        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <div className="flex justify-center">
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-secondary/80">Autonomously Intelligent</span>
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] font-bold tracking-tighter leading-[1.1] text-white">
            The Executive Inbox,<br/>Autonomously Managed.
          </h1>
          
          <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            An Agentic AI that reads, categorizes, and prepares your next steps.<br/>
            Approve and execute with one click.
          </p>

          <div className="flex justify-center gap-6 pt-4">
            <Link 
              to="/inbox" 
              className="bg-white text-black font-bold px-8 py-4 rounded-md flex items-center gap-3 hover:bg-white/90 transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Central Mockup */}
        <div className="relative mt-20 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="glass-panel p-6 border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-secondary" fill="currentColor" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Agent Action Prepared</span>
                <span className="text-[8px] text-white/20 formular-mono">Just now</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-left">
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/30 block mb-2">Drafted Reply</span>
                <p className="text-sm text-white/70 italic leading-relaxed">
                  "I've reviewed the proposal and it looks solid. Let's sync on <span className="text-white font-medium underline decoration-secondary">Thursday at 2 PM</span> to finalize."
                </p>
              </div>
              
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">Calendar Invite</span>
                    <span className="text-xs font-medium">Project Sync • Thu, 2:00 PM</span>
                  </div>
                </div>
                <Check className="w-4 h-4 text-secondary/50" />
              </div>
            </div>
          </div>
          
          {/* Subtle Glow Behind Mockup */}
          <div className="absolute -inset-10 bg-secondary/5 blur-[100px] -z-10 rounded-full"></div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-12 gap-6 items-stretch">
          
          {/* Main Inbox Triage (6/12) */}
          <div className="col-span-12 lg:col-span-7 glass-panel bg-white/[0.02] border-white/5 p-0 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold">Inbox Triage</h3>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
              </div>
            </div>
            
            <div className="flex-1 space-y-px">
              {/* Item 1 */}
              <div className="p-8 hover:bg-white/[0.02] transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                    <span className="text-sm font-bold text-white">Sarah Jenkins</span>
                  </div>
                  <span className="text-[10px] formular-mono text-white/20">08:42 • #4</span>
                </div>
                <h4 className="text-sm font-semibold mb-2">Q4 Strategic Partnership Proposal</h4>
                <p className="text-xs text-white/40 line-clamp-1">Hi team, following up on our conversation last week regarding the integration...</p>
              </div>
              
              {/* Item 2 */}
              <div className="p-8 bg-white/[0.01] border-y border-white/5 group relative">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                    <span className="text-sm font-bold text-white">Michael Chen</span>
                  </div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Urgent</span>
                </div>
                <h4 className="text-sm font-semibold mb-2 text-white/80">Urgent: Board Meeting Materials</h4>
                <p className="text-xs text-white/40 line-clamp-1">Please find the attached deck for tomorrow's executive review session.</p>
                {/* Visual Accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary shadow-glow-orange opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Item 3 */}
              <div className="p-8 opacity-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <span className="text-sm font-bold text-white/50">Slack Notifications</span>
                  </div>
                  <span className="text-[10px] formular-mono text-white/20">Yesterday</span>
                </div>
                <h4 className="text-sm font-semibold mb-2 text-white/40">New mentions in #product-roadmap</h4>
                <p className="text-xs text-white/20 line-clamp-1">You were mentioned by @alex in the design discussion.</p>
              </div>
            </div>
          </div>

          {/* Sidebar Column (5/12) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            {/* Agent Summary Card */}
            <div className="flex-1 glass-card bg-white/[0.02] border-white/5 p-8 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-8 block">Agent Intelligence Summary</span>
              
              <div className="space-y-6">
                {[
                  { icon: Sparkles, text: "Identify 4 high-priority emails requiring your signature or approval today." },
                  { icon: MessageSquare, text: "Summarized the 12-email thread with the legal team into three action points." },
                  { icon: Clock, text: "Blocked 2 hours on Friday for the deep-work session requested by engineering." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="p-2 h-fit bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                      <item.icon className="w-4 h-4 text-secondary" />
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed pt-1.5">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Execute Card */}
            <div className="glass-panel bg-white/[0.03] border-white/10 p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6">
                <Check className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Execute Next Step</h3>
              <p className="text-sm text-white/40 mb-8 max-w-[200px]">Agent has prepared a follow-up and scheduled the review.</p>
              
              <button className="w-full bg-secondary text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 shadow-glow-orange hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest text-xs">
                Approve & Send
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-40 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-secondary" fill="currentColor" />
            </div>
            <h3 className="text-xl font-bold italic tracking-tight">Contextual Intelligence</h3>
            <p className="text-sm text-white/40 leading-relaxed font-medium">
              Beyond keywords. Our agent understands the nuances of your business relationships and project timelines to prioritize what actually matters.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-xl font-bold italic tracking-tight">Agentic Execution</h3>
            <p className="text-sm text-white/40 leading-relaxed font-medium">
              Don't just read. The agent drafts replies, schedules meetings, and creates tasks in your project management tools automatically.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-xl font-bold italic tracking-tight">Human Control</h3>
            <p className="text-sm text-white/40 leading-relaxed font-medium">
              Designed for the elite. Every automated action sits in a "Pending Review" state until you give the final, one-click approval.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-40 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary/5 blur-[150px] -z-10 rounded-full scale-150"></div>
        <div className="space-y-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter italic">Ready to reclaim your time?</h2>
          <p className="text-xl text-white/40 max-w-xl mx-auto">
            Join our private beta for executive teams and experience the future of autonomous workflows.
          </p>
          <Link 
            to="/inbox" 
            className="inline-block bg-white text-black font-black px-12 py-5 rounded-md hover:bg-white/90 transition-all uppercase tracking-widest text-xs"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
        <span className="text-lg font-bold tracking-tight text-white uppercase italic">Agentic AI</span>
        
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/30">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
        </div>
        
        <span className="text-[10px] font-bold text-white/20 formular-mono">© 2024 AGENTIC AI. PH0213009 TRIAGE.</span>
      </footer>
    </div>
  );
};

export default Landing;
