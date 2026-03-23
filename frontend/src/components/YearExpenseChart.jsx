import {
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString()}`;

const YearExpenseChart = ({ yearlyStats }) => {
  const hasData = yearlyStats?.monthlyTotals?.some((month) => month.totalAmount > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-surface-200 overflow-hidden">
        <div className="section-header">
          <h2 className="text-lg font-semibold text-white tracking-tight">Overall Year Expense</h2>
        </div>
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-surface-500 font-medium">No yearly expense trend available</p>
          <p className="text-surface-400 text-sm mt-1">The yearly overview appears after approvals are recorded</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const monthly = payload.find((row) => row.dataKey === 'totalAmount');
    const cumulative = payload.find((row) => row.dataKey === 'cumulativeAmount');

    return (
      <div className="bg-surface-900 text-white px-4 py-3 rounded-xl shadow-elevated text-sm min-w-[180px]">
        <p className="font-semibold mb-2">{label}</p>
        <p className="text-surface-300">Monthly: {formatCurrency(monthly?.value || 0)}</p>
        <p className="text-surface-300">Cumulative: {formatCurrency(cumulative?.value || 0)}</p>
      </div>
    );
  };

  const peakMonth = yearlyStats.monthlyTotals.reduce(
    (max, month) => (month.totalAmount > max.totalAmount ? month : max),
    { month: '-', totalAmount: 0 }
  );
  const averageMonthly = yearlyStats.totalAmount / 12;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-surface-200 overflow-hidden">
      <div className="section-header">
        <h2 className="text-lg font-semibold text-white tracking-tight">Overall Year Expense</h2>
        <p className="text-xs text-surface-300 mt-1">{yearlyStats.year} monthly totals and cumulative trend</p>
      </div>
      <div className="p-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={yearlyStats.monthlyTotals}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
                formatter={(value) => <span className="text-surface-600">{value}</span>}
              />
              <Bar dataKey="totalAmount" name="Monthly Expense" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="cumulativeAmount"
                name="Cumulative (YTD)"
                stroke="#0F766E"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-surface-500">Year Total</p>
            <p className="text-2xl font-bold text-surface-900">{formatCurrency(yearlyStats.totalAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-surface-500">Peak Month</p>
            <p className="text-sm font-semibold text-surface-900">
              {peakMonth.month} ({formatCurrency(peakMonth.totalAmount)})
            </p>
            <p className="text-xs text-surface-500 mt-0.5">Avg: {formatCurrency(Math.round(averageMonthly))}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearExpenseChart;
