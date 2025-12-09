import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  Calendar,
  Download,
  FileText,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

// Sample data generators
const generateSalesData = (days: number) => {
  const data = [];
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'dd/MM', { locale: ar }),
      sales: Math.floor(Math.random() * 5000) + 2000,
      orders: Math.floor(Math.random() * 40) + 10,
    });
  }
  return data;
};

const categoryData = [
  { name: 'مشروبات', value: 3500, color: '#8B5CF6' },
  { name: 'منتجات الألبان', value: 2800, color: '#3B82F6' },
  { name: 'خضروات وفواكه', value: 2200, color: '#22C55E' },
  { name: 'مخبوزات', value: 1500, color: '#F59E0B' },
  { name: 'لحوم ودواجن', value: 2000, color: '#EF4444' },
  { name: 'منظفات', value: 1200, color: '#06B6D4' },
];

const paymentMethodsData = [
  { name: 'كاش', value: 8500, color: '#22C55E' },
  { name: 'بنكك', value: 3200, color: '#3B82F6' },
  { name: 'فوري', value: 1500, color: '#8B5CF6' },
];

export default function Reports() {
  const { settings } = useApp();
  const [period, setPeriod] = useState('daily');

  const salesData = generateSalesData(period === 'daily' ? 7 : period === 'weekly' ? 28 : 30);

  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalSales / totalOrders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">التقارير</h1>
          <p className="text-sm text-muted-foreground">
            تحليل المبيعات والإيرادات والأداء
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="ml-2 h-4 w-4" />
            تحديد الفترة
          </Button>
          <Button variant="outline">
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList>
          <TabsTrigger value="daily">يومي</TabsTrigger>
          <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
          <TabsTrigger value="monthly">شهري</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي المبيعات"
          value={`${totalSales.toLocaleString()} ${settings.currency}`}
          icon={DollarSign}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="عدد الطلبات"
          value={totalOrders}
          icon={ShoppingCart}
          variant="default"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="متوسط قيمة الطلب"
          value={`${avgOrderValue.toFixed(2)} ${settings.currency}`}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="المنتجات المباعة"
          value={Math.floor(totalOrders * 3.5)}
          icon={Package}
          variant="default"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">اتجاه المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} ${settings.currency}`, 'المبيعات']}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(270 60% 50%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">عدد الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value, 'طلب']}
                  />
                  <Bar dataKey="orders" fill="hsl(270 60% 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">المبيعات حسب التصنيف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} ${settings.currency}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium mr-auto">
                    {item.value} {settings.currency}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">المبيعات حسب طريقة الدفع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} ${settings.currency}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {paymentMethodsData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1 text-sm">{item.name}</span>
                  <span className="font-medium">
                    {item.value} {settings.currency}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (
                    {(
                      (item.value /
                        paymentMethodsData.reduce((sum, i) => sum + i.value, 0)) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
