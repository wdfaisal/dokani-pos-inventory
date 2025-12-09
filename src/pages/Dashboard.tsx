import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { ShiftStatus } from '@/components/dashboard/ShiftStatus';
import { useApp } from '@/contexts/AppContext';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  Receipt,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export default function Dashboard() {
  const { settings, products } = useApp();
  const [period, setPeriod] = useState('daily');

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  // Sample data - in production, this would come from the database
  const stats = {
    totalSales: 15420,
    totalOrders: 87,
    revenue: 12350,
    expenses: 3070,
    customers: 45,
    invoices: 87,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">
            نظرة عامة على النقاط البيانية الأساسية
          </p>
        </div>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="daily">يومي</TabsTrigger>
            <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
            <TabsTrigger value="monthly">شهري</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="إجمالي المبيعات"
          value={`${stats.totalSales.toLocaleString()} ${settings.currency}`}
          icon={DollarSign}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="إجمالي الطلبات"
          value={stats.totalOrders}
          icon={ShoppingCart}
          variant="default"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="مجموع الأرباح"
          value={`${stats.revenue.toLocaleString()} ${settings.currency}`}
          icon={TrendingUp}
          variant="success"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="عدد التكلفة الإجمالي"
          value={`${stats.expenses.toLocaleString()} ${settings.currency}`}
          icon={Receipt}
          variant="warning"
        />
        <StatCard
          title="العملاء"
          value={stats.customers}
          icon={Users}
          variant="default"
        />
        <StatCard
          title="منتجات منخفضة"
          value={lowStockCount}
          icon={Package}
          variant={lowStockCount > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Charts and Widgets */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RevenueChart />
        <div className="space-y-6">
          <ShiftStatus />
          <QuickActions />
        </div>
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert />
    </div>
  );
}
