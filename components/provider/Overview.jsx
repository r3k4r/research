'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Mock data for weekly sales
const data = [
  {
    name: 'Mon',
    total: 232,
  },
  {
    name: 'Tue',
    total: 315,
  },
  {
    name: 'Wed',
    total: 275,
  },
  {
    name: 'Thu',
    total: 340,
  },
  {
    name: 'Fri',
    total: 456,
  },
  {
    name: 'Sat',
    total: 510,
  },
  {
    name: 'Sun',
    total: 420,
  },
];

export function Overview() {
  const formatTooltipValue = (value) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
        <Tooltip 
          formatter={formatTooltipValue}
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
          }}
          labelStyle={{ fontWeight: "bold" }}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
