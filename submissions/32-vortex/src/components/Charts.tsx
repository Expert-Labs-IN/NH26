"use client";

import { ResponsiveContainer, Treemap, Tooltip, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Legend, Cell, BarChart, PieChart, Pie } from 'recharts';
import { Card } from './ui/card';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
const TreemapAny = Treemap as any;

export function MerchantRiskTreemap({ data }: { data: any[] }) {
  return (
    <Card className="flex flex-col h-80">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Merchant Risk Treemap</h2>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <TreemapAny
            data={data}
            dataKey="value"
            ratio={4 / 3}
            stroke="#e2e8f0"
            fill="#f1f5f9"
            content={(props: any) => {
              const { root, depth, x, y, width, height, index, payload, colors, name, value, fraudRate } = props;
              const isHighRisk = fraudRate > 1;
              return (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                      fill: isHighRisk ? '#fecdd3' : '#ffffff',
                      stroke: '#e2e8f0',
                      strokeWidth: 2,
                    }}
                  />
                  {width > 50 && height > 30 && (
                    <text x={x + 4} y={y + 18} fill="#64748b" fontSize={12} style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                      {name} ({fraudRate}%)
                    </text>
                  )}
                </g>
              );
            }}
          />
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-rose-400 mt-2 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>Insight: Crypto and Electronics are the only fraud-heavy categories.</p>
    </Card>
  );
}

export function VelocityTimeline({ data }: { data: any[] }) {
  return (
    <Card className="flex flex-col h-80">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Transaction Velocity</h2>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} style={{ fontFamily: 'var(--font-jetbrains-mono)' }} />
            <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} style={{ fontFamily: 'var(--font-jetbrains-mono)' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} style={{ fontFamily: 'var(--font-jetbrains-mono)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-jetbrains-mono)' }} />
            <Bar yAxisId="right" dataKey="spikes" fill="#e11d48" name="Spikes (Right Y)" radius={[2, 2, 0, 0]} />
            <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#3b82f6" name="Volume (Left Y)" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-blue-400 mt-2 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>Insight: Spikes indicating coordinated or automated activity.</p>
    </Card>
  );
}

export function CityFraudBar({ data }: { data: any[] }) {
  return (
    <Card className="flex flex-col h-80">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>City Fraud Rate</h2>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
            <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} style={{ fontFamily: 'var(--font-jetbrains-mono)' }} />
            <YAxis dataKey="city" type="category" stroke="#64748b" fontSize={10} tickLine={false} style={{ fontFamily: 'var(--font-jetbrains-mono)' }} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.rate > 1.5 ? '#e11d48' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-rose-400 mt-2 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>Insight: Identify high-risk regions.</p>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-2 text-xs rounded shadow-lg" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
        <p className="text-slate-800 mb-1 font-bold">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color || p.fill }}>
            {p.name || p.dataKey}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
