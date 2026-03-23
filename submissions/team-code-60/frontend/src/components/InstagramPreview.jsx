import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

function InstagramPreview({ caption, productName }) {
  if (!caption) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
          <Heart className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Instagram Preview</h3>
          <p className="text-[11px] text-gray-400">Live mockup of your post</p>
        </div>
      </div>

      {/* Phone Frame */}
      <div className="max-w-[320px] mx-auto">
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
          {/* IG Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{(productName || 'M')[0]}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none">
                  {(productName || 'marketai').toLowerCase().replace(/\s+/g, '_')}
                </p>
                <p className="text-[10px] text-gray-400">Sponsored</p>
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </div>

          {/* IG Image Placeholder */}
          <div className="aspect-square bg-gradient-to-br from-brand-100 via-purple-50 to-pink-100 dark:from-brand-900/30 dark:via-purple-900/20 dark:to-pink-900/30 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="w-16 h-16 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">📸</span>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Product image goes here</p>
            </div>
          </div>

          {/* IG Actions */}
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <Heart className="w-5 h-5 text-gray-900 dark:text-white" />
                <MessageCircle className="w-5 h-5 text-gray-900 dark:text-white" />
                <Send className="w-5 h-5 text-gray-900 dark:text-white" />
              </div>
              <Bookmark className="w-5 h-5 text-gray-900 dark:text-white" />
            </div>
            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">1,234 likes</p>

            {/* Caption */}
            <div className="text-xs text-gray-900 dark:text-gray-200 leading-relaxed">
              <span className="font-semibold">{(productName || 'marketai').toLowerCase().replace(/\s+/g, '_')}</span>{' '}
              {caption.length > 200 ? caption.slice(0, 200) + '...' : caption}
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 uppercase">2 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstagramPreview;
