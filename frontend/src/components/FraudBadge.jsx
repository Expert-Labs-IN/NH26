import { useState } from 'react';

const levelConfig = {
  low: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    ring: 'stroke-emerald-500',
    label: 'Low Risk',
    icon: 'OK'
  },
  medium: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    ring: 'stroke-amber-500',
    label: 'Medium Risk',
    icon: 'MED'
  },
  high: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    text: 'text-orange-400',
    glow: 'shadow-[0_0_15px_rgba(249,115,22,0.25)]',
    ring: 'stroke-orange-500',
    label: 'High Risk',
    icon: 'HIGH'
  },
  critical: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/25',
    text: 'text-rose-400',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
    ring: 'stroke-rose-500',
    label: 'Critical Risk',
    icon: 'CRIT'
  }
};

const FraudBadge = ({ score = 0, level = 'low', flags = [], compact = false }) => {
  const [expanded, setExpanded] = useState(false);
  const config = levelConfig[level] || levelConfig.low;
  const circumference = 2 * Math.PI * 18;
  const strokeOffset = circumference - (score / 100) * circumference;

  if (compact) {
    return (
      <div className="relative group">
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${config.bg} ${config.border} ${config.text} cursor-pointer transition-all duration-300 hover:scale-105 ${level !== 'low' ? config.glow : ''}`}
          onClick={() => setExpanded(!expanded)}
        >
          <span>{config.icon}</span>
          <span>{score}%</span>
        </button>
        {expanded && flags.length > 0 && (
          <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-surface-900 border border-surface-700 rounded-xl p-4 shadow-modal animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <h4 className={`text-sm font-bold ${config.text}`}>{config.label}</h4>
              <span className="text-xs text-surface-400">{score}% risk score</span>
            </div>
            <ul className="space-y-2">
              {flags.map((flag, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-surface-300">
                  <span className={`${config.text} mt-0.5`}>-</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`w-full text-left rounded-xl border p-4 transition-all duration-300 cursor-pointer ${config.bg} ${config.border} ${level !== 'low' ? config.glow : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-200/10" />
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              strokeWidth="3"
              className={`${config.ring} transition-all duration-1000 ease-out`}
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
            />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${config.text}`}>
            {score}%
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-surface-900/20">{config.icon}</span>
            <span className={`text-sm font-bold ${config.text}`}>{config.label}</span>
          </div>
          <p className="text-xs text-surface-400 mt-0.5">
            {flags.length} indicator{flags.length !== 1 ? 's' : ''} detected
          </p>
        </div>
      </div>

      {expanded && flags.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5 animate-fade-in">
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">Fraud Indicators</p>
          <ul className="space-y-1.5">
            {flags.map((flag, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-surface-300">
                <span className={`${config.text} mt-0.5 text-[10px]`}>-</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </button>
  );
};

export default FraudBadge;
