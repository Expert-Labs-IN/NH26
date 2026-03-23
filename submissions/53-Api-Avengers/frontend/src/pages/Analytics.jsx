import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Mail, ShieldCheck, Clock, Zap, ArrowUpRight } from 'lucide-react';
import { emailService } from '../services/api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="glass-card p-6 bg-white/[0.01]">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-${color}/10`}>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full formular-mono uppercase">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-xs text-white/40 uppercase tracking-widest font-bold font-sans">{title}</div>
  </div>
);

const AnalyticsPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    triaged: 0,
    urgent: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await emailService.fetchEmails();
        const total = data.emails.length;
        const triaged = data.emails.filter(e => e.triage && e.triage.summary).length;
        const urgent = data.emails.filter(e => e.triage?.priority === 'Urgent').length;
        setStats({ total, triaged, urgent });
      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold mb-2">Platform Intelligence</h2>
          <p className="text-white/40 max-w-md">Real-time metrics on AI processing efficiency and inbox security health.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl p-1">
          {['24H', '7D', '30D', 'ALL'].map(period => (
            <button key={period} className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${period === '7D' ? 'bg-secondary text-white' : 'text-white/40 hover:text-white'}`}>
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Volume" value={stats.total} icon={Mail} color="white" trend="+12%" />
        <StatCard title="AI Triaged" value={stats.triaged} icon={Zap} color="secondary" trend="+24%" />
        <StatCard title="Time Saved" value={`${stats.triaged * 2.5}m`} icon={Clock} color="accent" trend="+18%" />
        <StatCard title="Risk Blocked" value="0.0%" icon={ShieldCheck} color="emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Chart Mock */}
        <div className="lg:col-span-2 glass-panel p-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/60">Triage Throughput</h4>
              <p className="text-[10px] text-white/20 formular-mono">Avg: 1,420 emails / week</p>
            </div>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <div className="h-64 flex items-end justify-between gap-4">
            {[45, 60, 40, 80, 55, 90, 75].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <div 
                  className="w-full bg-white/5 group-hover:bg-secondary/40 transition-all rounded-t-lg relative"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-4 text-[10px] text-white/20 text-center formular-mono uppercase">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distro */}
        <div className="glass-panel p-8">
          <div className="flex items-center gap-2 mb-8">
            <PieChart className="w-4 h-4 text-white/40" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/60">Priority Distro</h4>
          </div>
          
          <div className="space-y-6">
            {[
              { label: 'Urgent', count: stats.urgent, color: 'bg-red-500', pct: (stats.urgent/stats.total*100) || 0 },
              { label: 'Action Required', count: Math.ceil(stats.total * 0.4), color: 'bg-secondary', pct: 40 },
              { label: 'Information Only', count: Math.floor(stats.total * 0.35), color: 'bg-white/10', pct: 35 },
              { label: 'Muted/Noise', count: Math.floor(stats.total * 0.1), color: 'bg-white/5', pct: 10 },
            ].map(item => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-white/40 uppercase">{item.label}</span>
                  <span className="formular-mono text-white/60">{item.count}</span>
                </div>
                <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-4 rounded-xl bg-secondary/10 border border-secondary/20 border-dashed">
            <div className="flex gap-3">
              <Zap className="w-4 h-4 text-secondary mt-1 shrink-0" />
              <div className="text-[10px] leading-relaxed text-white/60">
                <span className="text-white font-bold">AI Insight:</span> Week-over-week urgent email volume is up 8%. Recommendation: Auto-prioritize technical threads.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
