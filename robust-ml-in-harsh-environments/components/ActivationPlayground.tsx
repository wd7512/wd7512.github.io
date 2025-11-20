import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const ActivationPlayground: React.FC = () => {
  const [inputValue, setInputValue] = useState<number>(2); // Initial healthy value

  // Functions
  const relu = (x: number) => Math.max(0, x);
  const rwg = (x: number) => Math.max(0, x * Math.exp(-Math.pow(x, 2)));
  
  // Generate data points for the graph
  const data = [];
  for (let i = -4; i <= 4; i += 0.1) {
    const x = parseFloat(i.toFixed(1));
    data.push({
      x,
      ReLU: relu(x),
      RWG: rwg(x)
    });
  }

  // Current point logic
  const currentRelu = relu(inputValue);
  const currentRwg = rwg(inputValue);

  const isError = Math.abs(inputValue) > 3;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      
      {/* Controls */}
      <div className="w-full md:w-1/3 space-y-6">
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-2">Input Signal (x)</label>
           <div className="flex items-center space-x-4">
             <input 
              type="range" 
              min="-10" 
              max="10" 
              step="0.1"
              value={inputValue}
              onChange={(e) => setInputValue(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
             />
             <span className="font-mono w-12 text-right text-slate-600">{inputValue.toFixed(1)}</span>
           </div>
        </div>

        <div className="flex gap-2">
            <button 
              onClick={() => setInputValue(1.5)}
              className="flex-1 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-xs font-bold hover:bg-green-200 transition"
            >
              Normal Signal
            </button>
            <button 
              onClick={() => setInputValue(8)}
              className="flex-1 px-3 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-bold hover:bg-red-200 transition"
            >
              Simulate Burst (SEE)
            </button>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
           <div className="flex justify-between items-center border-b border-slate-200 pb-2">
             <span className="text-slate-500 font-medium text-sm">ReLU Output</span>
             <span className={`font-mono font-bold ${isError && currentRelu > 3 ? 'text-red-600' : 'text-slate-800'}`}>
                {currentRelu.toFixed(4)}
             </span>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-blue-600 font-medium text-sm">RWG Output</span>
             <span className="font-mono font-bold text-blue-600">
                {currentRwg.toFixed(4)}
             </span>
           </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          <strong>Observation:</strong> When "x" becomes very large (simulating an error), ReLU outputs a huge value, propagating the error. RWG decays to zero, effectively suppressing the noise.
        </p>
      </div>

      {/* Graph */}
      <div className="w-full md:w-2/3 h-64 bg-white">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="x" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              itemStyle={{ fontSize: '12px' }}
            />
            <ReferenceLine x={inputValue} stroke="#ef4444" strokeDasharray="3 3" label="Input" />
            <Line type="monotone" dataKey="ReLU" stroke="#94a3b8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="RWG" stroke="#2563eb" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center space-x-6 mt-2">
            <div className="flex items-center text-xs text-slate-500">
                <span className="w-3 h-1 bg-slate-400 mr-1"></span> Standard ReLU
            </div>
            <div className="flex items-center text-xs text-blue-600 font-bold">
                <span className="w-3 h-1 bg-blue-600 mr-1"></span> Proposed RWG
            </div>
        </div>
      </div>
    </div>
  );
};
