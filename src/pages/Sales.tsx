import { useState, useMemo, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Printer, 
  FileText, 
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  Eye,
  PieChart
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  shiftId: string;
  userId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    cost: number;
    quantity: number;
    discount: number;
    total: number;
    categoryName?: string;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  transactionId?: string;
  amountPaid: number;
  change: number;
  status: 'completed' | 'cancelled' | 'refunded';
  createdAt: Date;
}

// Sample invoices data
const sampleInvoices: SaleInvoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    shiftId: '1',
    userId: '1',
    items: [
      { id: '1', name: 'حليب المراعي طازج 1 لتر', price: 6.5, cost: 5.0, quantity: 2, discount: 0, total: 13, categoryName: 'منتجات الألبان' },
      { id: '3', name: 'بيبسي 330 مل', price: 2.5, cost: 1.8, quantity: 3, discount: 0, total: 7.5, categoryName: 'مشروبات' },
    ],
    subtotal: 20.5,
    discount: 0,
    tax: 3.08,
    total: 23.58,
    paymentMethod: 'كاش',
    amountPaid: 25,
    change: 1.42,
    status: 'completed',
    createdAt: new Date(),
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    shiftId: '1',
    userId: '1',
    items: [
      { id: '4', name: 'تفاح أحمر', price: 8.0, cost: 5.5, quantity: 1.5, discount: 0, total: 12, categoryName: 'خضروات وفواكه' },
    ],
    subtotal: 12,
    discount: 0,
    tax: 1.8,
    total: 13.8,
    paymentMethod: 'بنكك',
    transactionId: 'TXN123456',
    amountPaid: 13.8,
    change: 0,
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    invoiceNumber: 'INV-003',
    shiftId: '1',
    userId: '1',
    items: [
      { id: '5', name: 'دجاج طازج', price: 18.0, cost: 14.0, quantity: 2, discount: 0, total: 36, categoryName: 'لحوم ودواجن' },
      { id: '2', name: 'خبز أبيض', price: 3.0, cost: 2.0, quantity: 2, discount: 0, total: 6, categoryName: 'مخبوزات' },
    ],
    subtotal: 42,
    discount: 2,
    tax: 6,
    total: 46,
    paymentMethod: 'فوري',
    transactionId: 'FWR789012',
    amountPaid: 46,
    change: 0,
    status: 'completed',
    createdAt: new Date(Date.now() - 7200000),
  },
];

export default function Sales() {
  const { settings, categories } = useApp();
  const [invoices] = useState<SaleInvoice[]>(sampleInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPayment = paymentFilter === 'all' || invoice.paymentMethod === paymentFilter;
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      const matchesDateFrom = !dateFrom || new Date(invoice.createdAt) >= new Date(dateFrom);
      const matchesDateTo = !dateTo || new Date(invoice.createdAt) <= new Date(dateTo + 'T23:59:59');
      
      let matchesCategory = categoryFilter === 'all';
      if (!matchesCategory) {
        matchesCategory = invoice.items.some(item => item.categoryName === categoryFilter);
      }

      return matchesSearch && matchesPayment && matchesStatus && matchesDateFrom && matchesDateTo && matchesCategory;
    });
  }, [invoices, searchQuery, paymentFilter, statusFilter, dateFrom, dateTo, categoryFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalCost = filteredInvoices.reduce((sum, inv) => 
      sum + inv.items.reduce((itemSum, item) => itemSum + (item.cost * item.quantity), 0), 0);
    const netProfit = totalSales - totalCost;
    const totalOrders = filteredInvoices.length;
    const totalItems = filteredInvoices.reduce((sum, inv) => 
      sum + inv.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return { totalSales, totalCost, netProfit, totalOrders, totalItems, avgOrderValue };
  }, [filteredInvoices]);

  // Sales by category
  const salesByCategory = useMemo(() => {
    const categoryMap: Record<string, { sales: number; quantity: number; cost: number }> = {};
    
    filteredInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const catName = item.categoryName || 'غير مصنف';
        if (!categoryMap[catName]) {
          categoryMap[catName] = { sales: 0, quantity: 0, cost: 0 };
        }
        categoryMap[catName].sales += item.total;
        categoryMap[catName].quantity += item.quantity;
        categoryMap[catName].cost += item.cost * item.quantity;
      });
    });

    return Object.entries(categoryMap).map(([category, data]) => ({
      category,
      sales: data.sales,
      quantity: data.quantity,
      profit: data.sales - data.cost,
    })).sort((a, b) => b.sales - a.sales);
  }, [filteredInvoices]);

  // Sales by product
  const salesByProduct = useMemo(() => {
    const productMap: Record<string, { name: string; sales: number; quantity: number; cost: number }> = {};
    
    filteredInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        if (!productMap[item.id]) {
          productMap[item.id] = { name: item.name, sales: 0, quantity: 0, cost: 0 };
        }
        productMap[item.id].sales += item.total;
        productMap[item.id].quantity += item.quantity;
        productMap[item.id].cost += item.cost * item.quantity;
      });
    });

    return Object.entries(productMap).map(([id, data]) => ({
      id,
      name: data.name,
      sales: data.sales,
      quantity: data.quantity,
      profit: data.sales - data.cost,
    })).sort((a, b) => b.sales - a.sales);
  }, [filteredInvoices]);

  // Sales by payment method
  const salesByPayment = useMemo(() => {
    const paymentMap: Record<string, { count: number; total: number }> = {};
    
    filteredInvoices.forEach(invoice => {
      if (!paymentMap[invoice.paymentMethod]) {
        paymentMap[invoice.paymentMethod] = { count: 0, total: 0 };
      }
      paymentMap[invoice.paymentMethod].count += 1;
      paymentMap[invoice.paymentMethod].total += invoice.total;
    });

    return Object.entries(paymentMap).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
    }));
  }, [filteredInvoices]);

  const printReport = (type: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let content = '';
    const header = `
      <html dir="rtl">
      <head>
        <title>تقرير المبيعات - ${settings.name}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; direction: rtl; }
          h1, h2 { text-align: center; color: #1a1a2e; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
          th { background-color: #f4f4f4; }
          .summary { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .summary-item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { font-weight: bold; font-size: 1.2em; color: #22c55e; }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>${settings.name}</h1>
        <p style="text-align: center;">${settings.address} | ${settings.phone}</p>
        <hr />
    `;

    const footer = `
        <p style="text-align: center; margin-top: 30px; color: #666;">
          تم إنشاء التقرير في: ${format(new Date(), 'yyyy/MM/dd HH:mm', { locale: ar })}
        </p>
      </body>
      </html>
    `;

    if (type === 'invoices') {
      content = `
        <h2>تقرير الفواتير</h2>
        <div class="summary">
          <div class="summary-item"><span>إجمالي المبيعات:</span><span class="total">${stats.totalSales.toFixed(2)} ${settings.currency}</span></div>
          <div class="summary-item"><span>عدد الفواتير:</span><span>${stats.totalOrders}</span></div>
        </div>
        <table>
          <thead>
            <tr><th>رقم الفاتورة</th><th>التاريخ</th><th>عدد الأصناف</th><th>طريقة الدفع</th><th>الإجمالي</th></tr>
          </thead>
          <tbody>
            ${filteredInvoices.map(inv => `
              <tr>
                <td>${inv.invoiceNumber}</td>
                <td>${format(new Date(inv.createdAt), 'yyyy/MM/dd HH:mm')}</td>
                <td>${inv.items.length}</td>
                <td>${inv.paymentMethod}${inv.transactionId ? ` (${inv.transactionId})` : ''}</td>
                <td>${inv.total.toFixed(2)} ${settings.currency}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'categories') {
      content = `
        <h2>تقرير المبيعات حسب الأصناف</h2>
        <table>
          <thead>
            <tr><th>الصنف</th><th>الكمية المباعة</th><th>إجمالي المبيعات</th><th>صافي الربح</th></tr>
          </thead>
          <tbody>
            ${salesByCategory.map(cat => `
              <tr>
                <td>${cat.category}</td>
                <td>${cat.quantity}</td>
                <td>${cat.sales.toFixed(2)} ${settings.currency}</td>
                <td>${cat.profit.toFixed(2)} ${settings.currency}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'products') {
      content = `
        <h2>تقرير المبيعات حسب المنتجات</h2>
        <table>
          <thead>
            <tr><th>المنتج</th><th>الكمية المباعة</th><th>إجمالي المبيعات</th><th>صافي الربح</th></tr>
          </thead>
          <tbody>
            ${salesByProduct.map(prod => `
              <tr>
                <td>${prod.name}</td>
                <td>${prod.quantity}</td>
                <td>${prod.sales.toFixed(2)} ${settings.currency}</td>
                <td>${prod.profit.toFixed(2)} ${settings.currency}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'profit') {
      content = `
        <h2>تقرير صافي الأرباح</h2>
        <div class="summary">
          <div class="summary-item"><span>إجمالي المبيعات:</span><span>${stats.totalSales.toFixed(2)} ${settings.currency}</span></div>
          <div class="summary-item"><span>إجمالي التكلفة:</span><span>${stats.totalCost.toFixed(2)} ${settings.currency}</span></div>
          <div class="summary-item"><span>صافي الربح:</span><span class="total">${stats.netProfit.toFixed(2)} ${settings.currency}</span></div>
          <div class="summary-item"><span>نسبة الربح:</span><span>${stats.totalSales > 0 ? ((stats.netProfit / stats.totalSales) * 100).toFixed(1) : 0}%</span></div>
        </div>
        <h3>الأرباح حسب الصنف</h3>
        <table>
          <thead>
            <tr><th>الصنف</th><th>المبيعات</th><th>الربح</th><th>نسبة الربح</th></tr>
          </thead>
          <tbody>
            ${salesByCategory.map(cat => `
              <tr>
                <td>${cat.category}</td>
                <td>${cat.sales.toFixed(2)} ${settings.currency}</td>
                <td>${cat.profit.toFixed(2)} ${settings.currency}</td>
                <td>${cat.sales > 0 ? ((cat.profit / cat.sales) * 100).toFixed(1) : 0}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'payment') {
      content = `
        <h2>تقرير المبيعات حسب طرق الدفع</h2>
        <table>
          <thead>
            <tr><th>طريقة الدفع</th><th>عدد العمليات</th><th>إجمالي المبيعات</th><th>النسبة</th></tr>
          </thead>
          <tbody>
            ${salesByPayment.map(pay => `
              <tr>
                <td>${pay.method}</td>
                <td>${pay.count}</td>
                <td>${pay.total.toFixed(2)} ${settings.currency}</td>
                <td>${stats.totalSales > 0 ? ((pay.total / stats.totalSales) * 100).toFixed(1) : 0}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(header + content + footer);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">مكتملة</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">ملغية</Badge>;
      case 'refunded':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">مستردة</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">المبيعات والفواتير</h1>
            <p className="text-muted-foreground">إدارة وعرض جميع الفواتير والتقارير</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Printer className="w-4 h-4" />
                  طباعة تقرير
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>اختر نوع التقرير</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                  <Button onClick={() => printReport('invoices')} variant="outline" className="justify-start gap-2">
                    <FileText className="w-4 h-4" />
                    تقرير الفواتير
                  </Button>
                  <Button onClick={() => printReport('categories')} variant="outline" className="justify-start gap-2">
                    <PieChart className="w-4 h-4" />
                    المبيعات حسب الأصناف
                  </Button>
                  <Button onClick={() => printReport('products')} variant="outline" className="justify-start gap-2">
                    <Package className="w-4 h-4" />
                    المبيعات حسب المنتجات
                  </Button>
                  <Button onClick={() => printReport('profit')} variant="outline" className="justify-start gap-2">
                    <TrendingUp className="w-4 h-4" />
                    تقرير صافي الأرباح
                  </Button>
                  <Button onClick={() => printReport('payment')} variant="outline" className="justify-start gap-2">
                    <DollarSign className="w-4 h-4" />
                    المبيعات حسب طرق الدفع
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
                  <p className="text-lg font-bold">{stats.totalSales.toFixed(2)} {settings.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">صافي الربح</p>
                  <p className="text-lg font-bold">{stats.netProfit.toFixed(2)} {settings.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <ShoppingCart className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">عدد الفواتير</p>
                  <p className="text-lg font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <Package className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">المنتجات المباعة</p>
                  <p className="text-lg font-bold">{stats.totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <DollarSign className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">متوسط قيمة الفاتورة</p>
                  <p className="text-lg font-bold">{stats.avgOrderValue.toFixed(2)} {settings.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="كاش">كاش</SelectItem>
                  <SelectItem value="بنكك">بنكك</SelectItem>
                  <SelectItem value="فوري">فوري</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="cancelled">ملغية</SelectItem>
                  <SelectItem value="refunded">مستردة</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[150px]"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[150px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>الفواتير</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>عدد الأصناف</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">لا توجد فواتير</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{format(new Date(invoice.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}</TableCell>
                      <TableCell>{invoice.items.length}</TableCell>
                      <TableCell>
                        {invoice.paymentMethod}
                        {invoice.transactionId && (
                          <span className="text-xs text-muted-foreground block">{invoice.transactionId}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{invoice.total.toFixed(2)} {settings.currency}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(invoice)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invoice Details Dialog */}
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل الفاتورة {selectedInvoice?.invoiceNumber}</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">التاريخ</p>
                    <p className="font-medium">{format(new Date(selectedInvoice.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">طريقة الدفع</p>
                    <p className="font-medium">{selectedInvoice.paymentMethod}</p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price.toFixed(2)} {settings.currency}</TableCell>
                        <TableCell>{item.total.toFixed(2)} {settings.currency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{selectedInvoice.subtotal.toFixed(2)} {settings.currency}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span>الخصم:</span>
                      <span>-{selectedInvoice.discount.toFixed(2)} {settings.currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>الضريبة:</span>
                    <span>{selectedInvoice.tax.toFixed(2)} {settings.currency}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>الإجمالي:</span>
                    <span>{selectedInvoice.total.toFixed(2)} {settings.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المدفوع:</span>
                    <span>{selectedInvoice.amountPaid.toFixed(2)} {settings.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الباقي:</span>
                    <span>{selectedInvoice.change.toFixed(2)} {settings.currency}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  );
}