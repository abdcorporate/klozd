'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TrendData {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data: TrendData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    dateFormatted: format(new Date(item.date), 'dd/MM', { locale: fr }),
    revenueFormatted: new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(item.revenue),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formattedData}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="dateFormatted" />
        <YAxis />
        <Tooltip formatter={(value: number | undefined) => value != null ? new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        }).format(value) : ''} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#FF6B35"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorRevenue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

