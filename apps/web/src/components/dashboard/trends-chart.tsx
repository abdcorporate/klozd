'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TrendData {
  date: string;
  leads: number;
  qualified: number;
  appointments: number;
  revenue: number;
}

interface TrendsChartProps {
  data: TrendData[];
}

export function TrendsChart({ data }: TrendsChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    dateFormatted: format(new Date(item.date), 'dd/MM', { locale: fr }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="dateFormatted" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="leads" stroke="#000000" name="Leads" strokeWidth={2} />
        <Line type="monotone" dataKey="qualified" stroke="#FF6B35" name="Qualifiés" strokeWidth={2} />
        <Line type="monotone" dataKey="appointments" stroke="#FF8C42" name="RDV" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

