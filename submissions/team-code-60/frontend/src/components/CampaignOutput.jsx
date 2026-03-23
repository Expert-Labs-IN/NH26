import { useState } from 'react';
import axios from 'axios';
import { Copy, Check, RefreshCw, FileText, Instagram, Linkedin, Hash, Heart, Cpu, DollarSign, Eye, Sparkles, Twitter, Facebook, MessageSquare, Send, Loader2 } from 'lucide-react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
        ${copied
          ? 'bg-green-50 dark:bg-green-900/30 text-green-600 border border-green-200 dark:border-green-800'
          : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-600 border border-gray-200 dark:border-gray-700 hover:border-brand-200'
        }`}>
      {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
    </button>
  );
}

function ContentCard({ icon: Icon, title, content, tags, color, delay, platform, onContentUpdate }) {
  const [showRefine, setShowRefine] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [refining, setRefining] = useState(false);
  const [displayContent, setDisplayContent] = useState(content);

  const handleRefine = async () => {
    if (!instruction.trim() || refining) return;
    setRefining(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/campaign/refine', {
        content: typeof displayContent === 'string' ? displayContent : (displayContent || []).join(', '),
        platform: platform || title,
        instruction: instruction.trim(),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setDisplayContent(res.data.data.refined);
      if (onContentUpdate) onContentUpdate(res.data.data.refined);
      setInstruction('');
      setShowRefine(false);
    } catch (err) {
      console.error('Refine failed:', err);
    } finally {
      setRefining(false);
    }
  };

  const currentContent = displayContent ?? content;

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 card-hover group ${delay || ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color || 'bg-brand-50'}`}>
            <Icon className={`w-5 h-5 ${color ? 'text-white' : 'text-brand-600'}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{title}</h3>
            <p className="text-[11px] text-gray-400">{currentContent?.length || 0} characters</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {!tags && (
            <button onClick={() => setShowRefine(!showRefine)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${showRefine ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30'}
                border border-gray-200 dark:border-gray-700 hover:border-brand-200`}>
              <MessageSquare className="w-3 h-3" /> Refine
            </button>
          )}
          <CopyButton text={typeof currentContent === 'string' ? currentContent : (currentContent || []).join(', ')} />
        </div>
      </div>
      {tags ? (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag, i) => (
            <span key={i} className="px-2.5 py-1 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/30 dark:to-purple-900/30 text-brand-600 dark:text-brand-400 text-xs font-medium rounded-full border border-brand-100 dark:border-brand-800">
              #{tag}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{currentContent}</p>
      )}
      {showRefine && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
          <div className="flex gap-2">
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
              placeholder='e.g., "make it funnier" or "add urgency"'
              className="input-field text-xs py-2 flex-1"
              disabled={refining}
            />
            <button onClick={handleRefine} disabled={refining || !instruction.trim()}
              className="px-3 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">
              {refining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              {refining ? 'Refining...' : 'Refine'}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {['Make it funnier', 'Add urgency', 'More professional', 'Shorter', 'Add emojis', 'More persuasive'].map(s => (
              <button key={s} onClick={() => { setInstruction(s); }}
                className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-500 text-[10px] font-medium rounded-md hover:bg-brand-50 hover:text-brand-600 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'emotional', label: 'Emotional', icon: Heart },
  { id: 'technical', label: 'Technical', icon: Cpu },
  { id: 'sales', label: 'Sales', icon: DollarSign },
];

const cardConfigs = [
  { key: 'seo', icon: FileText, title: 'SEO Web Description', color: 'bg-gradient-to-br from-brand-500 to-brand-600' },
  { key: 'instagram', icon: Instagram, title: 'Instagram Caption', color: 'bg-gradient-to-br from-pink-500 to-rose-500' },
  { key: 'linkedin', icon: Linkedin, title: 'LinkedIn Post', color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  { key: 'twitter', icon: Twitter, title: 'Twitter / X Post', color: 'bg-gradient-to-br from-sky-500 to-blue-500' },
  { key: 'facebook', icon: Facebook, title: 'Facebook Post', color: 'bg-gradient-to-br from-blue-600 to-indigo-600' },
  { key: 'tags', icon: Hash, title: 'Dynamic Tags', color: 'bg-gradient-to-br from-amber-500 to-orange-500' },
];

function CampaignOutput({ data, onRegenerate }) {
  const [activeTab, setActiveTab] = useState('overview');

  const getContent = () => {
    if (activeTab === 'overview') return data;
    return data?.variations?.[activeTab] || data;
  };

  const current = getContent();

  return (
    <div className="space-y-5">
      {/* Success Badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl animate-scale-in">
        <Sparkles className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-700 dark:text-green-400">Campaign generated successfully!</span>
      </div>

      {/* Tab Switcher */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-1.5 flex gap-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200
              ${activeTab === id
                ? 'bg-brand-600 text-white shadow-brand'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Variation Label */}
      {activeTab !== 'overview' && (
        <div className="flex items-center gap-2 text-xs text-gray-400 animate-fade-in">
          <div className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
          Showing <span className="font-semibold text-brand-600 capitalize">{activeTab}</span> variation
        </div>
      )}

      {/* Content Cards */}
      <div className="space-y-4" key={activeTab}>
        {cardConfigs.map((cfg, i) => (
          <div key={cfg.key} className="animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <ContentCard
              icon={cfg.icon}
              title={cfg.title}
              content={cfg.key === 'tags' ? undefined : current?.[cfg.key]}
              tags={cfg.key === 'tags' ? current?.tags : undefined}
              color={cfg.color}
              platform={cfg.key}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={onRegenerate}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3">
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </button>
      </div>
    </div>
  );
}

export default CampaignOutput;
