import { useState, useMemo, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Invoice, CartItem } from '@/types';
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
  Download,
  BarChart3,
  PieChart
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Sample invoices data
const sampleInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    shiftId: '1',
    userId: '1',
    items: [
      { id: '1', name: 'حليب المراعي طازج 1 لتر', barcode: '6281007012345', code: 'P001', price: 6.5, cost: 5.0, stock: 50, minStock: 10, category: 'منتجات الألبان', unit: 'قطعة', isWeighted: false, createdAt: new Date(), updatedAt: new Date(), quantity: 2, discount: 0, total: 13 },
      { id: '3', name: 'بيبسي 330 مل', barcode: '6281007012347', code: 'P003', price: 2.5, cost: 1.8, stock: 100, minStock: 20, category: 'مشروبات', unit: 'قطعة', isWeighted: false, createdAt: new Date(), updatedAt: new Date(), quantity: 3, discount: 0, total: 7.5 },
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
      { id: '4', name: 'تفاح أحمر', barcode: '6281007012348', code: 'P004', price: 8.0, cost: 5.5, stock: 25, minStock: 5, category: 'خضروات وفواكه', unit: 'كيلو', isWeighted: true, createdAt: new Date(), updatedAt: new Date(), quantity: 1.5, discount: 0, total: 12 },
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
      { id: '5', name: 'دجاج طازج', barcode: '6281007012349', code: 'P005', price: 18.0, cost: 14.0, stock: 15, minStock: 5, category: 'لحوم ودواجن', unit: 'كيلو', isWeighted: true, createdAt: new Date(), updatedAt: new Date(), quantity: 2, discount: 0, total: 36 },
      { id: '2', name: 'خبز أبيض', barcode: '6281007012346', code: 'P002', price: 3.0, cost: 2.0, stock: 30, minStock: 5, category: 'مخبوزات', unit: 'قطعة', isWeighted: false, createdAt: new Date(), updatedAt: new Date(), quantity: 2, discount: 0, total: 6 },
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
  const [invoices] = useState<Invoice[]>(sampleInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

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
        matchesCategory = invoice.items.some(item => item.category === categoryFilter);
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
        if (!categoryMap[item.category]) {
          categoryMap[item.category] = { sales: 0, quantity: 0, cost: 0 };
        }
        categoryMap[item.category].sales += item.total;
        categoryMap[item.category].quantity += item.quantity;
        categoryMap[item.category].cost += item.cost * item.quantity;
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
          <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">صافي الربح</p>
                  <p className="text-lg font-bold">{stats.netProfit.toFixed(2)} {settings.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">عدد الفواتير</p>
                  <p className="text-lg font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Package className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">الأصناف المباعة</p>
                  <p className="text-lg font-bold">{stats.totalItems.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <ShoppingCart className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">متوسط الطلب</p>
                  <p className="text-lg font-bold">{stats.avgOrderValue.toFixed(2)} {settings.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-cyan-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <BarChart3 className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">نسبة الربح</p>
                  <p className="text-lg font-bold">{stats.totalSales > 0 ? ((stats.netProfit / stats.totalSales) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث برقم الفاتورة أو المنتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع طرق الدفع</SelectItem>
                  <SelectItem value="كاش">كاش</SelectItem>
                  <SelectItem value="بنكك">بنكك</SelectItem>
                  <SelectItem value="فوري">فوري</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="الصنف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأصناف</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="من تاريخ"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="إلى تاريخ"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="invoices">الفواتير</TabsTrigger>
            <TabsTrigger value="categories">حسب الأصناف</TabsTrigger>
            <TabsTrigger value="products">حسب المنتجات</TabsTrigger>
            <TabsTrigger value="payments">حسب طرق الدفع</TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الفاتورة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">عدد الأصناف</TableHead>
                      <TableHead className="text-right">طريقة الدفع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{format(new Date(invoice.createdAt), 'yyyy/MM/dd HH:mm')}</TableCell>
                        <TableCell>{invoice.items.length}</TableCell>
                        <TableCell>
                          {invoice.paymentMethod}
                          {invoice.transactionId && (
                            <span className="text-xs text-muted-foreground mr-1">
                              ({invoice.transactionId})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="font-bold">{invoice.total.toFixed(2)} {settings.currency}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedInvoice(invoice)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>تفاصيل الفاتورة {invoice.invoiceNumber}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">التاريخ</p>
                                    <p>{format(new Date(invoice.createdAt), 'yyyy/MM/dd HH:mm')}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">طريقة الدفع</p>
                                    <p>{invoice.paymentMethod}</p>
                                  </div>
                                  {invoice.transactionId && (
                                    <div className="col-span-2">
                                      <p className="text-muted-foreground">رقم العملية</p>
                                      <p>{invoice.transactionId}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-right">المنتج</TableHead>
                                        <TableHead className="text-right">الكمية</TableHead>
                                        <TableHead className="text-right">السعر</TableHead>
                                        <TableHead className="text-right">الإجمالي</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {invoice.items.map((item, idx) => (
                                        <TableRow key={idx}>
                                          <TableCell>{item.name}</TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>{item.price.toFixed(2)}</TableCell>
                                          <TableCell>{item.total.toFixed(2)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>المجموع الفرعي</span>
                                    <span>{invoice.subtotal.toFixed(2)} {settings.currency}</span>
                                  </div>
                                  {invoice.discount > 0 && (
                                    <div className="flex justify-between text-red-500">
                                      <span>الخصم</span>
                                      <span>-{invoice.discount.toFixed(2)} {settings.currency}</span>
                                    </div>
                                  )}
                                  {invoice.tax > 0 && (
                                    <div className="flex justify-between">
                                      <span>الضريبة</span>
                                      <span>{invoice.tax.toFixed(2)} {settings.currency}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>الإجمالي</span>
                                    <span>{invoice.total.toFixed(2)} {settings.currency}</span>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الصنف</TableHead>
                      <TableHead className="text-right">الكمية المباعة</TableHead>
                      <TableHead className="text-right">إجمالي المبيعات</TableHead>
                      <TableHead className="text-right">صافي الربح</TableHead>
                      <TableHead className="text-right">نسبة الربح</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesByCategory.map((cat, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{cat.category}</TableCell>
                        <TableCell>{cat.quantity}</TableCell>
                        <TableCell>{cat.sales.toFixed(2)} {settings.currency}</TableCell>
                        <TableCell className="text-green-500">{cat.profit.toFixed(2)} {settings.currency}</TableCell>
                        <TableCell>{cat.sales > 0 ? ((cat.profit / cat.sales) * 100).toFixed(1) : 0}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-right">الكمية المباعة</TableHead>
                      <TableHead className="text-right">إجمالي المبيعات</TableHead>
                      <TableHead className="text-right">صافي الربح</TableHead>
                      <TableHead className="text-right">نسبة الربح</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesByProduct.map((prod, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{prod.name}</TableCell>
                        <TableCell>{prod.quantity}</TableCell>
                        <TableCell>{prod.sales.toFixed(2)} {settings.currency}</TableCell>
                        <TableCell className="text-green-500">{prod.profit.toFixed(2)} {settings.currency}</TableCell>
                        <TableCell>{prod.sales > 0 ? ((prod.profit / prod.sales) * 100).toFixed(1) : 0}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">طريقة الدفع</TableHead>
                      <TableHead className="text-right">عدد العمليات</TableHead>
                      <TableHead className="text-right">إجمالي المبيعات</TableHead>
                      <TableHead className="text-right">النسبة من الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesByPayment.map((pay, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{pay.method}</TableCell>
                        <TableCell>{pay.count}</TableCell>
                        <TableCell>{pay.total.toFixed(2)} {settings.currency}</TableCell>
                        <TableCell>{stats.totalSales > 0 ? ((pay.total / stats.totalSales) * 100).toFixed(1) : 0}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
