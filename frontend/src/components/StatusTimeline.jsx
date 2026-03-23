const StatusTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return <p className="text-surface-400 text-sm italic">No timeline available</p>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIcon = (status) => {
    if (status.includes('Submitted')) return '📝';
    if (status.includes('Approved')) return '✅';
    if (status.includes('Rejected')) return '❌';
    if (status.includes('Auto')) return '⚡';
    if (status.includes('Fully')) return '🎉';
    return '📋';
  };

  const getIconStyle = (status) => {
    if (status.includes('Approved') || status.includes('Fully') || status.includes('Auto'))
      return 'bg-emerald-50 border-emerald-200 shadow-sm';
    if (status.includes('Rejected'))
      return 'bg-rose-50 border-rose-200 shadow-sm';
    return 'bg-brand-50 border-brand-200 shadow-sm';
  };

  const getLineColor = (status) => {
    if (status.includes('Approved') || status.includes('Fully') || status.includes('Auto'))
      return 'bg-emerald-200';
    if (status.includes('Rejected'))
      return 'bg-rose-200';
    return 'bg-brand-200';
  };

  return (
    <div className="space-y-0">
      {timeline.map((item, index) => (
        <div key={index} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${getIconStyle(item.status)}`}>
              {getIcon(item.status)}
            </div>
            {index < timeline.length - 1 && (
              <div className={`w-0.5 h-full min-h-[24px] ${getLineColor(item.status)} mt-1`}></div>
            )}
          </div>
          <div className="flex-1 pb-5">
            <div className="bg-surface-50 rounded-xl p-4 border border-surface-100 hover:border-surface-200 transition-colors">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-surface-800 text-sm">{item.status}</p>
                <span className="text-[11px] text-surface-400 font-medium bg-white px-2 py-0.5 rounded-md border border-surface-100">
                  {formatDate(item.timestamp)}
                </span>
              </div>
              <p className="text-sm text-surface-500 mt-1">
                by <span className="font-semibold text-surface-700">{item.actionBy}</span>
              </p>
              {item.remark && (
                <p className="text-sm text-surface-500 mt-2 italic bg-white p-2.5 rounded-lg border border-surface-100">
                  "{item.remark}"
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusTimeline;