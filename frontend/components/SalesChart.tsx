"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { x: "5k", value: 32000 },
  { x: "10k", value: 35000 },
  { x: "15k", value: 38000 },
  { x: "20k", value: 42000 },
  { x: "25k", value: 64364 },
  { x: "30k", value: 48000 },
  { x: "35k", value: 52000 },
  { x: "40k", value: 58000 },
  { x: "45k", value: 62000 },
  { x: "50k", value: 64000 },
  { x: "55k", value: 61000 },
  { x: "60k", value: 59000 },
];

export default function SalesChart() {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Sales Details</h2>
        <select className="text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>October</option>
          <option>November</option>
          <option>December</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="x" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: 'none', 
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
