import { useState, useRef } from 'react';
import { useApp, Shift } from '@/contexts/AppContext';
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
  const { settings, currentShift } = useApp();
  const [period, setPeriod] = useState('daily');
  const [activeTab, setActiveTab] = useState('overview');
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printType, setPrintType] = useState<'thermal' | 'a4'>('thermal');
  const printRef = useRef<HTMLDivElement>(null);

  const salesData = generateSalesData(period === 'daily' ? 7 : period === 'weekly' ? 28 : 30);

  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalSales / totalOrders;

  // Create a report shift that matches the Shift type
  const reportShift: Shift | undefined = currentShift ? currentShift : {
    id: '1',
    user_id: '1',
    store_id: '1',
    started_at: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    closed_at: null,
    opening_balance: 500,
    closing_balance: null,
    expected_balance: null,
    difference: null,
    total_sales: 13200,
    total_expenses: 1850,
    cash_sales: 8500,
    card_sales: 3200,
    other_sales: 1500,
    transactions_count: 87,
    status: 'open',
    notes: null,
  };

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
    shift: reportShift,
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
                @media print { body { -webkit-print-color-adjust: exact; } }
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
                        ({((item.value / paymentMethodsData.reduce((s, i) => s + i.value, 0)) * 100).toFixed(1)}%)
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
          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
                    <p className="text-xl font-bold">
                      {dailyReportData.totalSales.toLocaleString()} {settings.currency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Banknote className="h-8 w-8 text-success" />
                  <div>
                    <p className="text-xs text-muted-foreground">كاش</p>
                    <p className="text-xl font-bold">
                      {dailyReportData.cashSales.toLocaleString()} {settings.currency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">بنكك</p>
                    <p className="text-xl font-bold">
                      {dailyReportData.bankSales.toLocaleString()} {settings.currency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Wallet className="h-8 w-8 text-secondary-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">فوري</p>
                    <p className="text-xl font-bold">
                      {dailyReportData.fawrySales.toLocaleString()} {settings.currency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MinusCircle className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="text-xs text-muted-foreground">المصروفات</p>
                    <p className="text-xl font-bold">
                      {dailyReportData.totalExpenses.toLocaleString()} {settings.currency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Details */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  ملخص اليوم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span>عدد الطلبات</span>
                  <span className="font-bold">{dailyReportData.ordersCount}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>المنتجات المباعة</span>
                  <span className="font-bold">{dailyReportData.productsCount}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>متوسط قيمة الطلب</span>
                  <span className="font-bold">
                    {dailyReportData.avgOrderValue.toFixed(2)} {settings.currency}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-lg font-bold">
                  <span>صافي الإيراد</span>
                  <span className="text-primary">
                    {dailyReportData.netRevenue.toLocaleString()} {settings.currency}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  معلومات الوردية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailyReportData.shift && (
                  <>
                    <div className="flex justify-between border-b pb-2">
                      <span>بداية الوردية</span>
                      <span className="font-bold">
                        {format(new Date(dailyReportData.shift.started_at), 'HH:mm', { locale: ar })}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span>رصيد الافتتاح</span>
                      <span className="font-bold">
                        {dailyReportData.shift.opening_balance} {settings.currency}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span>عدد المعاملات</span>
                      <span className="font-bold">{dailyReportData.shift.transactions_count}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-lg font-bold">
                      <span>الحالة</span>
                      <span className="text-success">
                        {dailyReportData.shift.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Print Options */}
          <Card>
            <CardHeader>
              <CardTitle>طباعة التقرير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => handlePrint('thermal')} className="gap-2">
                  <Printer className="h-4 w-4" />
                  طباعة حرارية (80mm)
                </Button>
                <Button variant="outline" onClick={() => handlePrint('a4')} className="gap-2">
                  <FileText className="h-4 w-4" />
                  طباعة A4
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>معاينة الطباعة</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4 bg-muted rounded-lg overflow-auto">
            <DailyReportPrint
              ref={printRef}
              data={dailyReportData}
              settings={settings}
              type={printType}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
              إغلاق
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