'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
}

interface FunnelChartProps {
  data: FunnelData[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    label: item.stage.replace('_', ' '),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="label" type="category" width={120} />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#000000" name="Nombre" />
        <Bar dataKey="percentage" fill="#FF6B35" name="% Conversion" />
      </BarChart>
    </ResponsiveContainer>
  );
}

