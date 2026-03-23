import { useState } from 'react';
import axios from 'axios';
import { Users, Loader2, MapPin, Briefcase, Target, Zap, Hash, Sparkles } from 'lucide-react';

function PersonaCard({ persona, index }) {
  const colors = [
    'from-brand-500 to-purple-600',
    'from-pink-500 to-rose-600',
    'from-blue-500 to-cyan-600',
  ];
  const bgColors = [
    'bg-brand-50 dark:bg-brand-900/20',
    'bg-pink-50 dark:bg-pink-900/20',
    'bg-blue-50 dark:bg-blue-900/20',
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 card-hover">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[index % 3]} rounded-xl flex items-center justify-center text-2xl`}>
          {persona.emoji || '👤'}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-sm">{persona.name}, {persona.age}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> {persona.occupation}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 text-xs">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{persona.location}</span>
          <span className="mx-1">·</span>
          <span>{persona.income}</span>
        </div>

        {/* Pain Points */}
        <div>
          <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-1.5">Pain Points</p>
          <div className="space-y-1">
            {persona.painPoints?.map((p, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-red-400 mt-0.5">•</span>
                <span className="text-gray-600 dark:text-gray-300">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div>
          <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-1.5">Goals</p>
          <div className="space-y-1">
            {persona.goals?.map((g, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <Target className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">{g}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buying Motivation */}
        <div className={`${bgColors[index % 3]} rounded-lg p-2.5`}>
          <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-1">Buying Motivation</p>
          <p className="text-gray-700 dark:text-gray-200 font-medium">{persona.buyingMotivation}</p>
        </div>

        {/* Preferred Channels */}
        <div className="flex flex-wrap gap-1.5">
          {persona.preferredChannels?.map((ch, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md text-[10px] font-semibold">
              {ch}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AudiencePersonas({ productData }) {
  const [personas, setPersonas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!productData) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/campaign/personas', { productData }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPersonas(res.data.data.personas);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate personas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Audience Personas</h3>
            <p className="text-[11px] text-gray-400">AI-generated buyer profiles</p>
          </div>
        </div>
        {!personas && (
          <button onClick={generate} disabled={loading}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {loading ? 'Generating...' : 'Generate Personas'}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}

      {personas && (
        <div className="grid gap-4 sm:grid-cols-3 animate-fade-in">
          {personas.map((persona, i) => (
            <PersonaCard key={i} persona={persona} index={i} />
          ))}
        </div>
      )}

      {!personas && !loading && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
          <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Discover your ideal customers</p>
          <p className="text-xs text-gray-400">Click "Generate Personas" to create 3 AI-powered buyer profiles based on your product.</p>
        </div>
      )}
    </div>
  );
}

export default AudiencePersonas;
