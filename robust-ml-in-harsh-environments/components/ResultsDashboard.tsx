import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const ResultsDashboard: React.FC = () => {
  
  // Data extracted from Table 3 in the paper
  // "Test Delta" - Lower is better
  const chartData = [
    { name: 'Standard ReLU', delta: 0.0276, type: 'Standard' },
    { name: 'Smart Pool (ReLU)', delta: 0.0181, type: 'Optimization' },
    { name: 'ReLU + Dropout', delta: 0.0242, type: 'Optimization' },
    { name: 'Proposed RWG', delta: 0.0135, type: 'Proposed' },
    { name: 'RWG + Dropout', delta: 0.0123, type: 'Proposed' },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" stroke="#94a3b8" fontSize={12} domain={[0, 0.03]} />
          <YAxis type="category" dataKey="name" stroke="#475569" fontSize={11} width={100} />
          <Tooltip 
            cursor={{fill: '#f1f5f9'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="delta" radius={[0, 4, 4, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.type === 'Proposed' ? '#2563eb' : entry.type === 'Optimization' ? '#93c5fd' : '#cbd5e1'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center text-xs text-slate-500">
          <span className="w-3 h-3 bg-slate-300 rounded-sm mr-2"></span> Baseline
        </div>
        <div className="flex items-center text-xs text-slate-500">
          <span className="w-3 h-3 bg-blue-300 rounded-sm mr-2"></span> Optimization
        </div>
        <div className="flex items-center text-xs text-blue-700 font-bold">
          <span className="w-3 h-3 bg-blue-600 rounded-sm mr-2"></span> Proposed RWG
        </div>
      </div>
    </div>
  );
};
