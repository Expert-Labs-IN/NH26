function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl skeleton dark:opacity-20" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 rounded-lg skeleton dark:opacity-20" />
            <div className="h-3 w-20 rounded-lg skeleton dark:opacity-20" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 rounded-lg skeleton dark:opacity-20" />
          <div className="h-3 rounded-lg skeleton dark:opacity-20 w-5/6" />
          <div className="h-3 rounded-lg skeleton dark:opacity-20 w-4/6" />
          <div className="h-3 rounded-lg skeleton dark:opacity-20 w-3/6" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl skeleton dark:opacity-20" />
          <div className="h-4 w-36 rounded-lg skeleton dark:opacity-20" />
        </div>
        <div className="space-y-3">
          <div className="h-3 rounded-lg skeleton dark:opacity-20 w-full" />
          <div className="h-3 rounded-lg skeleton dark:opacity-20 w-4/5" />
          <div className="h-3 rounded-lg skeleton dark:opacity-20 w-3/5" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl skeleton dark:opacity-20" />
          <div className="h-4 w-28 rounded-lg skeleton dark:opacity-20" />
        </div>
        <div className="space-y-3">
          <div className="h-3 rounded-lg skeleton dark:opacity-20 w-full" />
          <div className="h-3 rounded-lg skeleton dark:opacity-20 w-5/6" />
          <div className="h-3 rounded-lg skeleton dark:opacity-20 w-2/3" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl skeleton dark:opacity-20" />
          <div className="h-4 w-24 rounded-lg skeleton dark:opacity-20" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-7 rounded-full skeleton dark:opacity-20" style={{ width: `${60 + Math.random() * 40}px` }} />
          ))}
        </div>
      </div>

      <div className="text-center py-4">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand-50 dark:bg-brand-900/30 rounded-xl">
          <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-brand-700 dark:text-brand-300">AI is generating your campaign...</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;
