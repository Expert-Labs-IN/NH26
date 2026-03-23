import { useState } from 'react';
import { Copy, Check, Mail, Rocket, Tag, UserPlus } from 'lucide-react';

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-md transition-all ${copied ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30'}`}>
      {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
}

const emailTypes = [
  { key: 'launch', label: 'Launch Email', icon: Rocket, color: 'from-brand-500 to-purple-500' },
  { key: 'promotional', label: 'Promo Email', icon: Tag, color: 'from-orange-500 to-red-500' },
  { key: 'followup', label: 'Follow-up Email', icon: UserPlus, color: 'from-green-500 to-emerald-500' },
];

function EmailCopyOutput({ emailCopy }) {
  const [activeEmail, setActiveEmail] = useState('launch');

  if (!emailCopy) return null;

  const current = emailCopy[activeEmail];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
          <Mail className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Email Marketing</h3>
          <p className="text-[11px] text-gray-400">3 email variations</p>
        </div>
      </div>

      {/* Email Type Tabs */}
      <div className="flex gap-2">
        {emailTypes.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setActiveEmail(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200
              ${activeEmail === key ? 'bg-brand-600 text-white shadow-brand' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Email Content */}
      {current && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Subject Line</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{current.subject}</p>
            </div>
            <CopyBtn text={current.subject} />
          </div>

          {current.preview && (
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Preview Text</p>
                <p className="text-xs text-gray-500 mt-0.5">{current.preview}</p>
              </div>
              <CopyBtn text={current.preview} />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Email Body</p>
              <CopyBtn text={current.body} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {current.body}
            </div>
          </div>

          {current.cta && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase">CTA Button:</p>
                <span className="px-4 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg">{current.cta}</span>
              </div>
              <CopyBtn text={current.cta} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EmailCopyOutput;
