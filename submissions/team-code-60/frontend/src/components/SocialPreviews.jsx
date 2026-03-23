import { Heart, MessageCircle, Repeat2, BarChart3, Bookmark, Share, MoreHorizontal, ThumbsUp, Send, Globe } from 'lucide-react';

function TwitterPreview({ content, productName }) {
  if (!content) return null;
  const handle = (productName || 'marketai').toLowerCase().replace(/\s+/g, '_');

  return (
    <div className="max-w-[400px] mx-auto">
      <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
        {/* Tweet header */}
        <div className="px-4 pt-3 pb-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">{(productName || 'M')[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{productName || 'MarketAI'}</span>
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.27 4.8-5.23 1.47 1.36-6.2 6.76z"/></svg>
              </div>
              <span className="text-xs text-gray-500">@{handle}</span>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
        </div>

        {/* Tweet content */}
        <div className="px-4 py-3">
          <p className="text-[15px] text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
            {content.length > 280 ? content.slice(0, 277) + '...' : content}
          </p>
          <p className="text-xs text-gray-500 mt-3">{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} · {new Date().toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}</p>
        </div>

        {/* Tweet stats */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1 text-xs text-gray-500">
          <span className="font-bold text-gray-900 dark:text-white">1.2K</span> Reposts
          <span className="mx-2">·</span>
          <span className="font-bold text-gray-900 dark:text-white">324</span> Quotes
          <span className="mx-2">·</span>
          <span className="font-bold text-gray-900 dark:text-white">5.8K</span> Likes
        </div>

        {/* Tweet actions */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-around">
          <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
            <MessageCircle className="w-[18px] h-[18px] text-gray-500" />
          </button>
          <button className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors">
            <Repeat2 className="w-[18px] h-[18px] text-gray-500" />
          </button>
          <button className="p-2 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-full transition-colors">
            <Heart className="w-[18px] h-[18px] text-gray-500" />
          </button>
          <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
            <BarChart3 className="w-[18px] h-[18px] text-gray-500" />
          </button>
          <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
            <Bookmark className="w-[18px] h-[18px] text-gray-500" />
          </button>
          <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
            <Share className="w-[18px] h-[18px] text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview({ content, productName }) {
  if (!content) return null;
  const name = productName || 'MarketAI';

  return (
    <div className="max-w-[400px] mx-auto">
      <div className="bg-white dark:bg-[#1b1f23] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
        {/* LI Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">{name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">Official Brand Account · 12,400 followers</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                2h · <Globe className="w-3 h-3" />
              </p>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
        </div>

        {/* LI Content */}
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {content.length > 400 ? content.slice(0, 397) + '...' : content}
          </p>
        </div>

        {/* LI Image placeholder */}
        <div className="aspect-[1.91/1] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/80 dark:bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Featured content image</p>
          </div>
        </div>

        {/* LI Stats */}
        <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 bg-blue-500 rounded-full border border-white" />
              <div className="w-4 h-4 bg-red-500 rounded-full border border-white" />
              <div className="w-4 h-4 bg-green-500 rounded-full border border-white" />
            </div>
            <span>847</span>
          </div>
          <span>62 comments · 28 reposts</span>
        </div>

        {/* LI Actions */}
        <div className="px-2 py-1 border-t border-gray-100 dark:border-gray-700 flex items-center justify-around">
          {[
            { icon: ThumbsUp, label: 'Like' },
            { icon: MessageCircle, label: 'Comment' },
            { icon: Repeat2, label: 'Repost' },
            { icon: Send, label: 'Send' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialPreviews({ twitter, linkedin, productName }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Social Media Previews</h3>
          <p className="text-[11px] text-gray-400">Live mockups of your posts</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Twitter / X</p>
        <TwitterPreview content={twitter} productName={productName} />
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">LinkedIn</p>
        <LinkedInPreview content={linkedin} productName={productName} />
      </div>
    </div>
  );
}

export default SocialPreviews;
