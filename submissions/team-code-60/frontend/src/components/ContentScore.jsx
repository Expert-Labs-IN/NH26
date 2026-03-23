import { TrendingUp, Eye, Search, Sparkles } from 'lucide-react';

const metrics = [
  { key: 'readability', label: 'Readability', icon: Eye, color: 'from-blue-500 to-cyan-500' },
  { key: 'engagement', label: 'Engagement', icon: TrendingUp, color: 'from-pink-500 to-rose-500' },
  { key: 'seoScore', label: 'SEO Score', icon: Search, color: 'from-green-500 to-emerald-500' },
  { key: 'overallScore', label: 'Overall', icon: Sparkles, color: 'from-brand-500 to-purple-500' },
];

function ScoreRing({ score, color }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <svg width="72" height="72" className="transform -rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="5"
        className="text-gray-100 dark:text-gray-800" />
      <circle cx="36" cy="36" r={r} fill="none" strokeWidth="5" strokeLinecap="round"
        stroke="url(#grad)" strokeDasharray={c} strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out" />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ContentScore({ contentScore }) {
  if (!contentScore) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Content Quality Score</h3>
          <p className="text-[11px] text-gray-400">AI-analyzed metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {metrics.map(({ key, label, icon: Icon, color }) => {
          const score = contentScore[key] || 0;
          return (
            <div key={key} className="text-center">
              <div className="relative inline-flex items-center justify-center mb-2">
                <ScoreRing score={score} color={color} />
                <div className="absolute inset-0 flex items-center justify-center rotate-90">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{score}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Icon className="w-3 h-3 text-gray-400" />
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {contentScore.overallScore >= 80 && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">Excellent quality — ready to publish!</span>
        </div>
      )}
    </div>
  );
}

export default ContentScore;
