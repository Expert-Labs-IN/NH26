import { useState } from 'react';
import { Copy, Check, Search, Facebook, Linkedin } from 'lucide-react';

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-md transition-all ${copied ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30'}`}>
      {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
}

function AdCard({ platform, icon: Icon, color, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 card-hover">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{platform}</h3>
      </div>
      {children}
    </div>
  );
}

function AdCopyOutput({ adCopy }) {
  if (!adCopy) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <Search className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Ad Copy</h3>
          <p className="text-[11px] text-gray-400">Platform-specific ad formats</p>
        </div>
      </div>

      {/* Google Ads */}
      {adCopy.google && (
        <AdCard platform="Google Search Ad" icon={Search} color="bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Headlines</p>
              {adCopy.google.headlines?.map((h, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{h}</span>
                  <CopyBtn text={h} />
                </div>
              ))}
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Descriptions</p>
              {adCopy.google.descriptions?.map((d, i) => (
                <div key={i} className="flex items-start justify-between py-1.5 border-b border-gray-50 last:border-0 gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{d}</span>
                  <CopyBtn text={d} />
                </div>
              ))}
            </div>
          </div>
        </AdCard>
      )}

      {/* Facebook Ad */}
      {adCopy.facebook && (
        <AdCard platform="Facebook / Instagram Ad" icon={Facebook} color="bg-gradient-to-br from-blue-600 to-indigo-600">
          <div className="space-y-3">
            {['headline', 'primaryText', 'description', 'cta'].map((key) => (
              adCopy.facebook[key] && (
                <div key={key} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{adCopy.facebook[key]}</p>
                  </div>
                  <CopyBtn text={adCopy.facebook[key]} />
                </div>
              )
            ))}
          </div>
        </AdCard>
      )}

      {/* LinkedIn Ad */}
      {adCopy.linkedin && (
        <AdCard platform="LinkedIn Sponsored Ad" icon={Linkedin} color="bg-gradient-to-br from-sky-600 to-blue-700">
          <div className="space-y-3">
            {['introText', 'headline', 'description'].map((key) => (
              adCopy.linkedin[key] && (
                <div key={key} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{adCopy.linkedin[key]}</p>
                  </div>
                  <CopyBtn text={adCopy.linkedin[key]} />
                </div>
              )
            ))}
          </div>
        </AdCard>
      )}
    </div>
  );
}

export default AdCopyOutput;
