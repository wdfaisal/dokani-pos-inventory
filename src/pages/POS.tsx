import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { CartItem, Product, PaymentMethod, Expense } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Maximize,
  Minimize,
  Keyboard,
  Hand,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  ShoppingCart,
  X,
  Barcode,
  Printer,
  DollarSign,
  ScanLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThermalReceipt } from '@/components/receipt/ThermalReceipt';

const expenseCategories = ['رواتب', 'إيجار', 'كهرباء', 'ماء', 'مشتريات', 'صيانة', 'نقل', 'متفرقات'];

export default function POS() {
  const {
    products,
    categories,
    paymentMethods,
    settings,
    currentShift,
    setCurrentShift,
    isFullscreen,
    setIsFullscreen,
    expenses,
    setExpenses,
  } = useApp();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'keyboard' | 'touch'>('keyboard');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [transactionId, setTransactionId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ amount: '', category: '', description: '' });
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lastInvoice, setLastInvoice] = useState<{
    items: CartItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethod | null;
    transactionId: string;
    invoiceNumber: string;
  } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Barcode scanner handler
  const handleBarcodeSubmit = useCallback((barcode: string) => {
    const product = products.find(p => p.barcode === barcode || p.scaleBarcode === barcode);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      toast.error('المنتج غير موجود');
    }
  }, [products]);

  // Handle expense save
  const handleSaveExpense = () => {
    if (!expenseForm.amount || !expenseForm.category) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }
    const expense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      description: expenseForm.description,
      shiftId: currentShift?.id,
      userId: '1',
      createdAt: new Date(),
    };
    setExpenses(prev => [expense, ...prev]);
    toast.success('تم إضافة المصروف');
    setShowExpenseDialog(false);
    setExpenseForm({ amount: '', category: '', description: '' });
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discount = cart.reduce((sum, item) => sum + item.discount * item.quantity, 0);
  const tax = settings.enableTax ? (subtotal - discount) * (settings.taxRate / 100) : 0;
  const total = subtotal - discount + tax;

  // Filtered products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.includes(searchQuery) ||
      product.barcode.includes(searchQuery) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'F12' && cart.length > 0 && currentShift) {
        e.preventDefault();
        setShowPaymentDialog(true);
      }
      if (e.key === 'Escape') {
        setShowPaymentDialog(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, cart.length, currentShift, setIsFullscreen]);

  // Add product to cart
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          discount: 0,
          total: product.price,
        },
      ];
    });
    toast.success(`تمت إضافة ${product.name}`);
  }, []);

  // Update quantity
  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            return {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.price,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove item
  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    toast.info('تم مسح السلة');
  };

  // Process payment
  const processPayment = () => {
    const method = paymentMethods.find((m) => m.id === selectedPaymentMethod);
    if (!method) return;

    if (method.requiresTransactionId && !transactionId) {
      toast.error('يرجى إدخال رقم العملية');
      return;
    }

    const paid = parseFloat(amountPaid) || total;
    if (paid < total) {
      toast.error('المبلغ المدفوع أقل من الإجمالي');
      return;
    }

    const change = paid - total;
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

    // Save invoice data for receipt
    setLastInvoice({
      items: [...cart],
      subtotal,
      discount,
      tax,
      total,
      paymentMethod: method,
      transactionId,
      invoiceNumber,
    });

    // Update shift
    if (currentShift) {
      setCurrentShift({
        ...currentShift,
        totalSales: currentShift.totalSales + total,
        cashSales:
          currentShift.cashSales + (method.name === 'كاش' ? total : 0),
        cardSales:
          currentShift.cardSales + (method.name === 'بنكك' ? total : 0),
        otherSales:
          currentShift.otherSales +
          (method.name !== 'كاش' && method.name !== 'بنكك' ? total : 0),
        transactionsCount: currentShift.transactionsCount + 1,
      });
    }

    toast.success(
      `تم إتمام عملية البيع - ${change > 0 ? `الباقي: ${change.toFixed(2)} ${settings.currency}` : ''}`
    );

    // Show receipt dialog
    setShowReceipt(true);

    // Reset
    setCart([]);
    setShowPaymentDialog(false);
    setSelectedPaymentMethod('');
    setTransactionId('');
    setAmountPaid('');
  };

  // Print receipt
  const printReceipt = () => {
    if (!receiptRef.current) return;

    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) {
      toast.error('تعذر فتح نافذة الطباعة');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>فاتورة - Dokani</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace;
              font-size: 12px;
              width: 80mm;
              padding: 10px;
              direction: rtl;
            }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .my-2 { margin: 8px 0; }
            .text-xl { font-size: 18px; }
            .text-lg { font-size: 16px; }
            .text-xs { font-size: 10px; }
            .border-t { border-top: 1px dashed #000; padding-top: 8px; }
            .border-double { border-top: 2px double #000; }
            .flex { display: flex; justify-content: space-between; }
            .item-row { display: flex; justify-content: space-between; padding: 2px 0; }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Get payment method icon
  const getPaymentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Banknote':
        return Banknote;
      case 'CreditCard':
        return CreditCard;
      case 'Smartphone':
        return Smartphone;
      default:
        return CreditCard;
    }
  };

  if (!currentShift) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-warning" />
            </div>
            <h2 className="text-xl font-bold mb-2">لا توجد وردية مفتوحة</h2>
            <p className="text-muted-foreground mb-6">
              يجب فتح وردية قبل البدء في البيع
            </p>
            <Button asChild>
              <a href="/shifts">بدء الوردية</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-4 transition-all duration-300',
        isFullscreen && 'fixed inset-0 z-50 bg-background p-4'
      )}
    >
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="بحث بالاسم أو الباركود أو الكود... (F2)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 h-11"
            />
          </div>
          <div className="relative min-w-[180px]">
            <ScanLine className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={barcodeInputRef}
              placeholder="قارئ الباركود"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && barcodeInput) {
                  handleBarcodeSubmit(barcodeInput);
                }
              }}
              className="pr-10 h-11"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExpenseDialog(true)}
              className="h-11"
            >
              <DollarSign className="h-4 w-4 ml-1" />
              مصروف
            </Button>
            <Button
              variant={inputMode === 'keyboard' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setInputMode('keyboard')}
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <Button
              variant={inputMode === 'touch' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setInputMode('touch')}
            >
              <Hand className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Categories */}
        <ScrollArea className="w-full whitespace-nowrap mb-4">
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              الكل
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Products Grid */}
        <ScrollArea className="flex-1">
          <div
            className={cn(
              'grid gap-3',
              inputMode === 'touch'
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6'
            )}
          >
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md hover:border-primary/50',
                  inputMode === 'touch' && 'p-4',
                  product.stock <= product.minStock && 'border-warning/50'
                )}
                onClick={() => addToCart(product)}
              >
                <CardContent
                  className={cn('p-3', inputMode === 'touch' && 'p-0')}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                      {product.stock <= product.minStock && (
                        <Badge variant="destructive" className="text-[10px]">
                          منخفض
                        </Badge>
                      )}
                    </div>
                    <h3
                      className={cn(
                        'font-medium line-clamp-2',
                        inputMode === 'touch' ? 'text-base' : 'text-sm'
                      )}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {product.code}
                      </span>
                      <span
                        className={cn(
                          'font-bold text-primary',
                          inputMode === 'touch' ? 'text-lg' : 'text-base'
                        )}
                      >
                        {product.price} {settings.currency}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart Section */}
      <Card className="w-[380px] flex flex-col min-h-[calc(100vh-120px)] shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              السلة
              {cart.length > 0 && (
                <Badge variant="secondary">{cart.length}</Badge>
              )}
            </CardTitle>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                <Trash2 className="h-4 w-4 ml-1" />
                مسح
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-0">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">السلة فارغة</p>
              <p className="text-xs text-muted-foreground mt-1">
                اضغط على منتج لإضافته
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-4 px-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.price} × {item.quantity} = {item.total.toFixed(2)}{' '}
                          {settings.currency}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span>
                    {subtotal.toFixed(2)} {settings.currency}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>الخصم</span>
                    <span>
                      -{discount.toFixed(2)} {settings.currency}
                    </span>
                  </div>
                )}
                {settings.enableTax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      الضريبة ({settings.taxRate}%)
                    </span>
                    <span>
                      {tax.toFixed(2)} {settings.currency}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary">
                    {total.toFixed(2)} {settings.currency}
                  </span>
                </div>
              </div>

              <Button
                className="w-full mt-4 h-12 text-base"
                onClick={() => setShowPaymentDialog(true)}
              >
                <Receipt className="ml-2 h-5 w-5" />
                الدفع (F12)
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إتمام عملية الدفع</DialogTitle>
            <DialogDescription>
              اختر طريقة الدفع وأدخل البيانات المطلوبة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Total */}
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-sm text-muted-foreground">الإجمالي المطلوب</p>
              <p className="text-3xl font-bold text-primary">
                {total.toFixed(2)} {settings.currency}
              </p>
            </div>

            {/* Payment Methods */}
            <div className="space-y-2">
              <Label>طريقة الدفع</Label>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods
                  .filter((m) => m.isActive)
                  .map((method) => {
                    const Icon = getPaymentIcon(method.icon);
                    return (
                      <Button
                        key={method.id}
                        variant={
                          selectedPaymentMethod === method.id
                            ? 'default'
                            : 'outline'
                        }
                        className="flex-col h-auto py-4"
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <Icon className="h-6 w-6 mb-2" />
                        <span className="text-sm">{method.name}</span>
                      </Button>
                    );
                  })}
              </div>
            </div>

            {/* Transaction ID */}
            {selectedPaymentMethod &&
              paymentMethods.find((m) => m.id === selectedPaymentMethod)
                ?.requiresTransactionId && (
                <div className="space-y-2">
                  <Label htmlFor="transactionId">رقم العملية</Label>
                  <Input
                    id="transactionId"
                    placeholder="أدخل رقم العملية"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              )}

            {/* Amount Paid */}
            <div className="space-y-2">
              <Label htmlFor="amountPaid">المبلغ المدفوع</Label>
              <Input
                id="amountPaid"
                type="number"
                placeholder={total.toFixed(2)}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
              {amountPaid && parseFloat(amountPaid) > total && (
                <p className="text-sm text-success">
                  الباقي: {(parseFloat(amountPaid) - total).toFixed(2)}{' '}
                  {settings.currency}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={processPayment}
              disabled={!selectedPaymentMethod}
            >
              <Receipt className="ml-2 h-4 w-4" />
              تأكيد الدفع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              الفاتورة
            </DialogTitle>
          </DialogHeader>
          {lastInvoice && (
            <div className="border rounded-lg overflow-hidden">
              <ThermalReceipt
                ref={receiptRef}
                items={lastInvoice.items}
                subtotal={lastInvoice.subtotal}
                discount={lastInvoice.discount}
                tax={lastInvoice.tax}
                total={lastInvoice.total}
                settings={settings}
                paymentMethod={lastInvoice.paymentMethod}
                transactionId={lastInvoice.transactionId}
                invoiceNumber={lastInvoice.invoiceNumber}
              />
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReceipt(false)}>
              إغلاق
            </Button>
            <Button onClick={printReceipt}>
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مصروف</DialogTitle>
            <DialogDescription>أدخل بيانات المصروف</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>المبلغ *</Label>
              <Input
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>التصنيف *</Label>
              <Select
                value={expenseForm.category}
                onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="وصف المصروف..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>إلغاء</Button>
            <Button onClick={handleSaveExpense}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
