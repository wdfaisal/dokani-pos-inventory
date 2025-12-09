import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const generateData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 7; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' }),
      revenue: Math.floor(Math.random() * 8000) + 2000,
      orders: Math.floor(Math.random() * 50) + 10,
    });
  }
  return data;
};

export function RevenueChart() {
  const data = useMemo(() => generateData(), []);

  return (
    <Card className="col-span-full lg:col-span-2 animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg">إجمالي الإيرادات</CardTitle>
        <CardDescription>يعرض نمو الإيرادات عبر فترات مختلفة</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(270 60% 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(270 60% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px -4px hsl(var(--foreground) / 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value} ر.س`, 'الإيرادات']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(270 60% 50%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
