import { useEffect, useState } from 'react';
import { Zap, Mail, Inbox, ArrowRight, Shield, Cpu, Users } from 'lucide-react';
import { triggerOutlookLogin, triggerGmailLogin, fetchAuthStatus } from '../api/auth';

interface LoginPageProps {
  onGuestAccess: () => void;
}

export default function LoginPage({ onGuestAccess }: LoginPageProps) {
  const [gmailConfigured, setGmailConfigured] = useState(false);
  const [outlookConfigured, setOutlookConfigured] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    fetchAuthStatus()
      .then((s) => {
        setGmailConfigured(s.gmail.configured);
        setOutlookConfigured(s.outlook.configured);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const features = [
    { icon: Cpu, label: 'AI Triage' },
    { icon: Shield, label: 'Human-in-Loop' },
    { icon: Users, label: 'Audit Log' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo + brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-4 animate-pulse-slow">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">TriageAI</h1>
          <p className="text-slate-400 text-sm">Your agentic email assistant</p>

          {/* Feature pills */}
          <div className="flex items-center gap-3 mt-4">
            {features.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2.5 py-1 rounded-full"
              >
                <Icon className="w-3 h-3 text-blue-400" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Login card */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <p className="text-center text-sm text-slate-400 mb-5">
            Connect your inbox or explore with demo data
          </p>

          <div className="space-y-3">
            {/* Gmail */}
            {!checking && gmailConfigured && (
              <button
                onClick={triggerGmailLogin}
                onMouseEnter={() => setHoveredCard('gmail')}
                onMouseLeave={() => setHoveredCard(null)}
                className="w-full group flex items-center gap-4 px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-red-500/40 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/15 transition-colors">
                  <span className="text-xl leading-none">📧</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">Connect Gmail</p>
                  <p className="text-xs text-slate-500 mt-0.5">Read & triage your real inbox</p>
                </div>
                <ArrowRight
                  className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${
                    hoveredCard === 'gmail' ? 'text-red-400 translate-x-0.5' : 'text-slate-600'
                  }`}
                />
              </button>
            )}

            {/* Outlook */}
            {!checking && outlookConfigured && (
              <button
                onClick={triggerOutlookLogin}
                onMouseEnter={() => setHoveredCard('outlook')}
                onMouseLeave={() => setHoveredCard(null)}
                className="w-full group flex items-center gap-4 px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500/40 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/15 transition-colors">
                  <span className="text-xl leading-none">📨</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">Connect Outlook</p>
                  <p className="text-xs text-slate-500 mt-0.5">Read & triage your real inbox</p>
                </div>
                <ArrowRight
                  className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${
                    hoveredCard === 'outlook' ? 'text-blue-400 translate-x-0.5' : 'text-slate-600'
                  }`}
                />
              </button>
            )}

            {/* Divider — only when at least one provider is shown */}
            {!checking && (gmailConfigured || outlookConfigured) && (
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-xs text-slate-600 font-medium">or</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
            )}

            {/* Guest */}
            <button
              onClick={onGuestAccess}
              onMouseEnter={() => setHoveredCard('guest')}
              onMouseLeave={() => setHoveredCard(null)}
              className="w-full group flex items-center gap-4 px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-emerald-500/40 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/15 transition-colors">
                <Inbox className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Continue as Guest</p>
                <p className="text-xs text-slate-500 mt-0.5">Explore with 10 demo emails</p>
              </div>
              <ArrowRight
                className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${
                  hoveredCard === 'guest' ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600'
                }`}
              />
            </button>
          </div>

          {/* Loading shimmer when checking backend */}
          {checking && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[60px] rounded-xl skeleton-shimmer"
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-600 mt-5">
          Nothing executes without your approval &nbsp;·&nbsp; Built for National Hackathon 2026
        </p>
      </div>
    </div>
  );
}
