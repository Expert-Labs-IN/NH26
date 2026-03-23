"use client";

import { Card } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function ImpossibleTravelFeed({ data }: { data: any[] }) {
  return (
    <Card className="flex flex-col h-80 overflow-hidden">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Impossible Travel Feed</h2>
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <ul className="space-y-2">
          <AnimatePresence>
            {data.map((item, idx) => (
              <motion.li
                key={item.id + idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-slate-50/80 p-2 rounded border-l-2 border-orange-500 text-xs flex justify-between items-center"
                style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
              >
                <div>
                  <span className="text-slate-900 font-bold">{item.id}</span>
                  <div className="text-slate-500 flex items-center gap-2 mt-1">
                    <span>{item.transition}</span>
                    <span className="text-gray-600">({item.gap})</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-rose-400 font-bold" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: '14px' }}>${item.amount}</span>
                  <div className={`text-[9px] uppercase mt-1 px-1 py-0.5 rounded text-center font-bold ${item.risk === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'}`}>
                    {item.risk}
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <p className="text-xs text-orange-500 mt-2 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>Insight: Same user, distinct cities within minutes.</p>
    </Card>
  );
}

export function OffenderLeaderboard({ data }: { data: any[] }) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  return (
    <Card className="flex flex-col h-80 overflow-hidden">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Repeat Offender Leaderboard</h2>
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-thin scrollbar-thumb-gray-200 pb-4">
        <table className="w-full text-left text-xs" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
          <thead className="text-slate-500 sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
            <tr>
              <th className="py-2">Rank</th>
              <th className="py-2">User ID</th>
              <th className="py-2">Flags</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => (
              <tr key={user.rank} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setSelectedUser(user.id)}>
                <td className="py-2 text-slate-500">#{user.rank}</td>
                <td className="py-2 text-slate-800">{user.id}</td>
                <td className="py-2 text-rose-500">{user.flags}</td>
                <td className="py-2 text-right font-bold text-slate-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>${user.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedUser && (
        <div className="mt-2 p-2 bg-slate-50 text-[10px] rounded border border-rose-200 border-dashed" style={{ fontFamily: 'var(--font-inter)' }}>
          <div className="text-rose-500 font-bold mb-1">AI Risk Explainer - {selectedUser}</div>
          <p className="text-slate-600">High risk due to repeated fraud flags across multiple locations. Recommended action: <span className="text-rose-600 font-bold">Freeze account immediately.</span></p>
          <button className="mt-1 text-slate-400 underline text-[9px]" onClick={() => setSelectedUser(null)}>Dismiss</button>
        </div>
      )}
      <p className="text-xs mt-2 text-slate-500 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>Insight: Target users ranked by offenses.</p>
    </Card>
  );
}

export function FlaggedTransactionFeed({ data }: { data: any[] }) {
  return (
    <Card className="flex flex-col h-80 overflow-hidden">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Flagged Tx Feed</h2>
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-thin scrollbar-thumb-slate-200 pb-4">
        <ul className="space-y-2">
          <AnimatePresence>
            {data.map((tx, i) => (
              <motion.li
                key={tx.id + i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-50 p-2 border border-slate-200 rounded"
              >
                <div className="flex justify-between text-[10px] text-slate-500 mb-1" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                  <span>{tx.id} - {tx.timestamp}</span>
                  <span className="text-indigo-600">{tx.merchant}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-slate-700 font-mono text-xs" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{tx.user} ({tx.city})</span>
                  <span className="text-rose-600 font-bold text-sm" style={{ fontFamily: 'var(--font-space-grotesk)' }}>${tx.amount}</span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <p className="text-xs mt-2 text-indigo-600 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>Insight: Monitoring highest amount transactions.</p>
    </Card>
  );
}
