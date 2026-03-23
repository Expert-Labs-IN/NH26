import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#1D4ED8', '#0F766E', '#B45309', '#B91C1C', '#7E22CE', '#0891B2'];

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString()}`;

const BudgetChart = ({ currentMonthStats }) => {
  const hasData = currentMonthStats?.categoryBreakdown?.length > 0 && currentMonthStats?.totalAmount > 0;

  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-surface-200 overflow-hidden">
        <div className="section-header">
          <h2 className="text-lg font-semibold text-white tracking-tight">Budget Health by Category</h2>
        </div>
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-surface-500 font-medium">
            No approved expenses for {currentMonthStats?.monthLabel || new Date().toLocaleString('en-US', { month: 'short' })} {currentMonthStats?.year || new Date().getFullYear()}
          </p>
          <p className="text-surface-400 text-sm mt-1">Category breakdown appears when this month has approved expenses</p>
        </div>
      </div>
    );
  }

  const data = currentMonthStats.categoryBreakdown;
  const totalAmount = currentMonthStats.totalAmount;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const entry = payload[0];
    const percentage = totalAmount > 0 ? ((entry.value / totalAmount) * 100).toFixed(1) : '0.0';

    return (
      <div className="bg-surface-900 text-white px-4 py-3 rounded-xl shadow-elevated text-sm">
        <p className="font-semibold">{entry.name}</p>
        <p className="text-surface-300">{formatCurrency(entry.value)} ({percentage}%)</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-surface-200 overflow-hidden">
      <div className="section-header">
        <h2 className="text-lg font-semibold text-white tracking-tight">Budget Health by Category</h2>
        <p className="text-xs text-surface-300 mt-1">{currentMonthStats.monthLabel} {currentMonthStats.year} approved expenses</p>
      </div>
      <div className="p-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={64}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
                formatter={(value) => <span className="text-surface-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-surface-500">Total Approved ({currentMonthStats.monthLabel})</p>
            <p className="text-2xl font-bold text-surface-900">{formatCurrency(currentMonthStats.totalAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-surface-500">Approved Requests</p>
            <p className="text-2xl font-bold text-surface-900">{currentMonthStats.totalCount.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetChart;
