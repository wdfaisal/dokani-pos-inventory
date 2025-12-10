import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Phone,
  MapPin,
  Eye,
  Printer,
  Truck,
  ShoppingBag,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface OnlineOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
}

// Sample orders data
const sampleOrders: OnlineOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customerName: 'أحمد محمد',
    phone: '0123456789',
    address: 'الخرطوم - شارع النيل',
    items: [
      { name: 'حليب المراعي طازج 1 لتر', quantity: 2, price: 6.5, total: 13 },
      { name: 'بيبسي 330 مل', quantity: 5, price: 2.5, total: 12.5 },
    ],
    subtotal: 25.5,
    deliveryFee: 10,
    total: 35.5,
    status: 'pending',
    paymentMethod: 'كاش عند الاستلام',
    notes: 'يرجى الاتصال قبل الوصول',
    createdAt: new Date(),
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customerName: 'فاطمة علي',
    phone: '0987654321',
    address: 'أم درمان - السوق',
    items: [
      { name: 'دجاج طازج', quantity: 1.5, price: 18, total: 27 },
      { name: 'خبز أبيض', quantity: 3, price: 3, total: 9 },
    ],
    subtotal: 36,
    deliveryFee: 15,
    total: 51,
    status: 'confirmed',
    paymentMethod: 'بنكك',
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customerName: 'محمود حسن',
    phone: '0111222333',
    address: 'بحري - الصناعات',
    items: [
      { name: 'تفاح أحمر', quantity: 2, price: 8, total: 16 },
    ],
    subtotal: 16,
    deliveryFee: 12,
    total: 28,
    status: 'preparing',
    paymentMethod: 'فوري',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    customerName: 'سارة أحمد',
    phone: '0555666777',
    address: 'الخرطوم - الرياض',
    items: [
      { name: 'حليب المراعي طازج 1 لتر', quantity: 4, price: 6.5, total: 26 },
    ],
    subtotal: 26,
    deliveryFee: 10,
    total: 36,
    status: 'delivered',
    paymentMethod: 'كاش عند الاستلام',
    createdAt: new Date(Date.now() - 86400000),
  },
];

export default function OnlineOrders() {
  const { settings } = useApp();
  const [orders, setOrders] = useState<OnlineOrder[]>(sampleOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OnlineOrder['status']) => {
    const statusConfig = {
      pending: { label: 'قيد الانتظار', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
      confirmed: { label: 'مؤكد', className: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
      preparing: { label: 'قيد التحضير', className: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
      ready: { label: 'جاهز للتوصيل', className: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30' },
      delivered: { label: 'تم التوصيل', className: 'bg-green-500/20 text-green-500 border-green-500/30' },
      cancelled: { label: 'ملغي', className: 'bg-red-500/20 text-red-500 border-red-500/30' },
    };
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const updateOrderStatus = (orderId: string, newStatus: OnlineOrder['status']) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getStatusActions = (order: OnlineOrder) => {
    switch (order.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'confirmed')}>
              <CheckCircle className="w-4 h-4 ml-1" />
              تأكيد
            </Button>
            <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, 'cancelled')}>
              <XCircle className="w-4 h-4 ml-1" />
              إلغاء
            </Button>
          </div>
        );
      case 'confirmed':
        return (
          <Button size="sm" onClick={() => updateOrderStatus(order.id, 'preparing')}>
            <Package className="w-4 h-4 ml-1" />
            بدء التحضير
          </Button>
        );
      case 'preparing':
        return (
          <Button size="sm" onClick={() => updateOrderStatus(order.id, 'ready')}>
            <Truck className="w-4 h-4 ml-1" />
            جاهز للتوصيل
          </Button>
        );
      case 'ready':
        return (
          <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivered')}>
            <CheckCircle className="w-4 h-4 ml-1" />
            تم التوصيل
          </Button>
        );
      default:
        return null;
    }
  };

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    total: orders.reduce((sum, o) => o.status === 'delivered' ? sum + o.total : sum, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الطلبات الأون لاين</h1>
          <p className="text-muted-foreground text-sm">متابعة وإدارة طلبات العملاء</p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">قيد الانتظار</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-500">{stats.confirmed}</p>
            <p className="text-xs text-muted-foreground">مؤكد</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Package className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-500">{stats.preparing}</p>
            <p className="text-xs text-muted-foreground">قيد التحضير</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/20">
          <CardContent className="p-4 text-center">
            <Truck className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-cyan-500">{stats.ready}</p>
            <p className="text-xs text-muted-foreground">جاهز للتوصيل</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-500">{stats.delivered}</p>
            <p className="text-xs text-muted-foreground">تم التوصيل</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <ShoppingBag className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold text-primary">{stats.total.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث برقم الطلب أو اسم العميل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="حالة الطلب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="preparing">قيد التحضير</SelectItem>
                <SelectItem value="ready">جاهز للتوصيل</SelectItem>
                <SelectItem value="delivered">تم التوصيل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد طلبات</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map(order => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Order Info */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">{order.orderNumber}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(order.createdAt, 'yyyy/MM/dd - hh:mm a', { locale: ar })}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {order.total.toFixed(2)} {settings.currency}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{order.customerName}</span>
                        <span className="text-muted-foreground">({order.phone})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{order.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{order.paymentMethod}</Badge>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{order.items.length} أصناف</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-2 p-4 bg-muted/30 border-t lg:border-t-0 lg:border-r lg:w-[200px]">
                    {getStatusActions(order)}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="w-4 h-4 ml-1" />
                          التفاصيل
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>تفاصيل الطلب {order.orderNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            {getStatusBadge(order.status)}
                            <span className="text-sm text-muted-foreground">
                              {format(order.createdAt, 'yyyy/MM/dd - hh:mm a', { locale: ar })}
                            </span>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <h4 className="font-medium">معلومات العميل</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">الاسم:</span>
                                <span className="mr-2">{order.customerName}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">الهاتف:</span>
                                <span className="mr-2">{order.phone}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">العنوان:</span>
                                <span className="mr-2">{order.address}</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <h4 className="font-medium">الأصناف</h4>
                            <ScrollArea className="h-[150px]">
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm py-1 border-b border-dashed last:border-0">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>{item.total.toFixed(2)} {settings.currency}</span>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>

                          <Separator />

                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">المجموع الفرعي</span>
                              <span>{order.subtotal.toFixed(2)} {settings.currency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">رسوم التوصيل</span>
                              <span>{order.deliveryFee.toFixed(2)} {settings.currency}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                              <span>الإجمالي</span>
                              <span className="text-primary">{order.total.toFixed(2)} {settings.currency}</span>
                            </div>
                          </div>

                          {order.notes && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="font-medium mb-1">ملاحظات</h4>
                                <p className="text-sm text-muted-foreground">{order.notes}</p>
                              </div>
                            </>
                          )}

                          <div className="flex gap-2 pt-2">
                            {getStatusActions(order)}
                            <Button variant="outline" className="gap-2">
                              <Printer className="w-4 h-4" />
                              طباعة
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
