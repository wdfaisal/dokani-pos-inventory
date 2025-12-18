import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { ShiftStatus } from '@/components/dashboard/ShiftStatus';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  Receipt,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  const { settings, products } = useApp();
  const { currentStore } = useAuth();
  const [period, setPeriod] = useState('daily');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    revenue: 0,
    expenses: 0,
    customers: 0,
  });
  const [loading, setLoading] = useState(true);

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  useEffect(() => {
    if (!currentStore) return;

    const fetchStats = async () => {
      setLoading(true);
      
      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'weekly':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        default: // daily
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
      }

      // Fetch sales stats
      const { data: salesData } = await supabase
        .from('sales')
        .select('total, subtotal, discount')
        .eq('store_id', currentStore.id)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString());

      // Fetch expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('store_id', currentStore.id)
        .gte('created_at', startDate.toISOString());

      // Calculate stats
      const totalSales = salesData?.reduce((sum, s) => sum + Number(s.total), 0) || 0;
      const totalOrders = salesData?.length || 0;
      const totalSubtotal = salesData?.reduce((sum, s) => sum + Number(s.subtotal), 0) || 0;
      const totalDiscount = salesData?.reduce((sum, s) => sum + Number(s.discount), 0) || 0;
      const totalExpenses = expensesData?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      // Revenue = Sales - Cost of goods (approximated as 70% of subtotal) - Expenses
      const estimatedCost = totalSubtotal * 0.7;
      const revenue = totalSales - estimatedCost - totalExpenses;

      setStats({
        totalSales,
        totalOrders,
        revenue: Math.max(0, revenue),
        expenses: totalExpenses,
        customers: totalOrders, // Using orders as proxy for customers
      });

      setLoading(false);
    };

    fetchStats();
  }, [currentStore, period]);

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
