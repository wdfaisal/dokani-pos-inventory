import { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { DailyReportPrint } from '@/components/reports/DailyReportPrint';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Printer,
  FileText,
  Receipt,
  Wallet,
  CreditCard,
  Banknote,
  MinusCircle,
  Clock,
  User,
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
  const [activeTab, setActiveTab] = useState('overview');
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printType, setPrintType] = useState<'thermal' | 'a4'>('thermal');
  const printRef = useRef<HTMLDivElement>(null);

  const salesData = generateSalesData(period === 'daily' ? 7 : period === 'weekly' ? 28 : 30);

  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalSales / totalOrders;

  // Daily report data
  const dailyReportData = {
    date: new Date(),
    totalSales: 13200,
    cashSales: 8500,
    bankSales: 3200,
    fawrySales: 1500,
    totalExpenses: 1850,
    netRevenue: 11350,
    ordersCount: 87,
    productsCount: 312,
    avgOrderValue: 151.72,
    shift: {
      id: '1',
      userId: '1',
      userName: 'أحمد محمد',
      startTime: new Date(new Date().setHours(8, 0, 0, 0)),
      openingBalance: 500,
      totalSales: 13200,
      totalExpenses: 1850,
      cashSales: 8500,
      cardSales: 3200,
      otherSales: 1500,
      transactionsCount: 87,
      status: 'open' as const,
    },
  };

  const handlePrint = (type: 'thermal' | 'a4') => {
    setPrintType(type);
    setShowPrintDialog(true);
  };

  const executePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const printWindow = window.open('', '', printType === 'thermal' ? 'width=302' : 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html dir="rtl">
            <head>
              <title>تقرير المبيعات اليومي</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Arial', sans-serif; direction: rtl; }
                .bg-white { background-color: white; }
                .text-black { color: black; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .font-mono { font-family: monospace; }
                .text-xs { font-size: 10px; }
                .text-sm { font-size: 12px; }
                .text-lg { font-size: 18px; }
                .text-xl { font-size: 20px; }
                .text-2xl { font-size: 24px; }
                .mb-1 { margin-bottom: 4px; }
                .mb-2 { margin-bottom: 8px; }
                .mb-4 { margin-bottom: 16px; }
                .mb-6 { margin-bottom: 24px; }
                .mb-8 { margin-bottom: 32px; }
                .mt-2 { margin-top: 8px; }
                .mt-4 { margin-top: 16px; }
                .mt-8 { margin-top: 32px; }
                .p-2 { padding: 8px; }
                .p-4 { padding: 16px; }
                .p-8 { padding: 32px; }
                .pb-2 { padding-bottom: 8px; }
                .pb-4 { padding-bottom: 16px; }
                .pt-4 { padding-top: 16px; }
                .py-2 { padding-top: 8px; padding-bottom: 8px; }
                .py-3 { padding-top: 12px; padding-bottom: 12px; }
                .border { border: 1px solid #e5e5e5; }
                .border-b { border-bottom: 1px solid #e5e5e5; }
                .border-b-2 { border-bottom: 2px solid black; }
                .border-t { border-top: 1px solid #e5e5e5; }
                .border-dashed { border-style: dashed; }
                .border-black { border-color: black; }
                .rounded-lg { border-radius: 8px; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .grid { display: grid; }
                .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
                .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
                .gap-4 { gap: 16px; }
                .gap-8 { gap: 32px; }
                .w-full { width: 100%; }
                .text-left { text-align: left; }
                .text-gray-500 { color: #6b7280; }
                .text-gray-600 { color: #4b5563; }
                .text-red-600 { color: #dc2626; }
                .text-green-600 { color: #16a34a; }
                .text-blue-600 { color: #2563eb; }
                .text-purple-600 { color: #9333ea; }
                .text-orange-600 { color: #ea580c; }
                .bg-gray-50 { background-color: #f9fafb; }
                table { border-collapse: collapse; }
                @media print {
                  body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>${printContents}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
    setShowPrintDialog(false);
  };

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

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-none lg:inline-flex">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="daily-report">التقرير اليومي</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
        </TabsContent>

        {/* Daily Report Tab */}
        <TabsContent value="daily-report" className="space-y-6">
          {/* Print Buttons */}
          <div className="flex gap-2 justify-end">
            <Button onClick={() => handlePrint('thermal')} variant="outline">
              <Receipt className="ml-2 h-4 w-4" />
              طباعة إيصال
            </Button>
            <Button onClick={() => handlePrint('a4')}>
              <FileText className="ml-2 h-4 w-4" />
              طباعة A4
            </Button>
          </div>

          {/* Daily Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold">
                      {dailyReportData.totalSales.toLocaleString()} {settings.currency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">صافي الإيراد</p>
                    <p className="text-2xl font-bold text-green-600">
                      {dailyReportData.netRevenue.toLocaleString()} {settings.currency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-muted">
                    <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">عدد الطلبات</p>
                    <p className="text-2xl font-bold">{dailyReportData.ordersCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-500/10">
                    <MinusCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المصروفات</p>
                    <p className="text-2xl font-bold text-red-600">
                      {dailyReportData.totalExpenses.toLocaleString()} {settings.currency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods & Shift Info */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Payment Methods Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  طرق الدفع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <Banknote className="h-5 w-5 text-green-600" />
                    <span className="font-medium">كاش</span>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-green-600">
                      {dailyReportData.cashSales.toLocaleString()} {settings.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((dailyReportData.cashSales / dailyReportData.totalSales) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">بنكك</span>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-blue-600">
                      {dailyReportData.bankSales.toLocaleString()} {settings.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((dailyReportData.bankSales / dailyReportData.totalSales) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">فوري</span>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-purple-600">
                      {dailyReportData.fawrySales.toLocaleString()} {settings.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((dailyReportData.fawrySales / dailyReportData.totalSales) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shift Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  معلومات الوردية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <User className="h-4 w-4" />
                      الكاشير
                    </div>
                    <div className="font-bold">{dailyReportData.shift.userName}</div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      بداية الوردية
                    </div>
                    <div className="font-bold">
                      {format(dailyReportData.shift.startTime, 'HH:mm', { locale: ar })}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">رصيد الافتتاح</div>
                    <div className="font-bold">
                      {dailyReportData.shift.openingBalance} {settings.currency}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">عدد المعاملات</div>
                    <div className="font-bold">{dailyReportData.shift.transactionsCount}</div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-1">الرصيد المتوقع</div>
                  <div className="text-xl font-bold text-primary">
                    {(
                      dailyReportData.shift.openingBalance +
                      dailyReportData.cashSales -
                      dailyReportData.totalExpenses
                    ).toLocaleString()}{' '}
                    {settings.currency}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>الملخص المالي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-muted-foreground">إجمالي المبيعات</span>
                  <span className="font-bold text-lg text-green-600">
                    +{dailyReportData.totalSales.toLocaleString()} {settings.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-muted-foreground">المصروفات</span>
                  <span className="font-bold text-lg text-red-600">
                    -{dailyReportData.totalExpenses.toLocaleString()} {settings.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 bg-primary/5 rounded-lg px-4">
                  <span className="font-bold text-lg">صافي الإيراد</span>
                  <span className="font-bold text-2xl text-primary">
                    {dailyReportData.netRevenue.toLocaleString()} {settings.currency}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className={printType === 'a4' ? 'max-w-4xl max-h-[90vh] overflow-auto' : 'max-w-sm'}>
          <DialogHeader>
            <DialogTitle>معاينة الطباعة</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center overflow-auto">
            <DailyReportPrint
              ref={printRef}
              data={dailyReportData}
              settings={settings}
              type={printType}
            />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={executePrint}>
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
