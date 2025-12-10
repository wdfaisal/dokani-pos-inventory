import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2,
  Eye,
  ShoppingCart,
  Building2,
  Calendar,
  Receipt,
  TrendingUp,
  Printer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";

interface Supplier {
  id: string;
  name: string;
  phone: string;
  balance: number;
}

interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  cost: number;
  total: number;
}

interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  notes?: string;
  createdAt: Date;
}

const Purchases = () => {
  const { toast } = useToast();
  const { products, setProducts } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');

  // Sample suppliers
  const [suppliers] = useState<Supplier[]>([
    { id: "1", name: "شركة الأغذية المتحدة", phone: "0501234567", balance: 5000 },
    { id: "2", name: "مؤسسة المشروبات الحديثة", phone: "0559876543", balance: 0 },
    { id: "3", name: "مصنع الحلويات الذهبية", phone: "0512345678", balance: 3000 },
  ]);

  // Sample purchases
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([
    {
      id: "1",
      invoiceNumber: "PO-001",
      supplierId: "1",
      supplierName: "شركة الأغذية المتحدة",
      items: [
        { productId: "1", productName: "حليب طازج", quantity: 50, cost: 5, total: 250 },
        { productId: "2", productName: "خبز أبيض", quantity: 100, cost: 2, total: 200 },
      ],
      subtotal: 450,
      tax: 67.5,
      discount: 0,
      total: 517.5,
      paidAmount: 517.5,
      remainingAmount: 0,
      paymentStatus: 'paid',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: "2",
      invoiceNumber: "PO-002",
      supplierId: "2",
      supplierName: "مؤسسة المشروبات الحديثة",
      items: [
        { productId: "3", productName: "عصير برتقال", quantity: 30, cost: 8, total: 240 },
      ],
      subtotal: 240,
      tax: 36,
      discount: 10,
      total: 266,
      paidAmount: 150,
      remainingAmount: 116,
      paymentStatus: 'partial',
      createdAt: new Date('2024-01-20'),
    },
  ]);

  // New invoice form state
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<PurchaseItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [invoiceDiscount, setInvoiceDiscount] = useState("0");
  const [paidAmount, setPaidAmount] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");

  const addItemToInvoice = () => {
    if (!selectedProduct || !itemQuantity || !itemCost) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار المنتج وإدخال الكمية والتكلفة",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const qty = parseInt(itemQuantity);
    const cost = parseFloat(itemCost);

    if (isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال قيم صحيحة",
        variant: "destructive",
      });
      return;
    }

    const existingItem = invoiceItems.find(item => item.productId === selectedProduct);
    if (existingItem) {
      setInvoiceItems(invoiceItems.map(item =>
        item.productId === selectedProduct
          ? { ...item, quantity: item.quantity + qty, total: (item.quantity + qty) * item.cost }
          : item
      ));
    } else {
      setInvoiceItems([...invoiceItems, {
        productId: selectedProduct,
        productName: product.name,
        quantity: qty,
        cost,
        total: qty * cost,
      }]);
    }

    setSelectedProduct("");
    setItemQuantity("");
    setItemCost("");
  };

  const removeItemFromInvoice = (productId: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.productId !== productId));
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const discount = parseFloat(invoiceDiscount) || 0;
    const tax = (subtotal - discount) * 0.15;
    const total = subtotal - discount + tax;
    return { subtotal, discount, tax, total };
  };

  const handleCreateInvoice = () => {
    if (!selectedSupplier) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار المورد",
        variant: "destructive",
      });
      return;
    }

    if (invoiceItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة منتجات للفاتورة",
        variant: "destructive",
      });
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplier);
    if (!supplier) return;

    const { subtotal, discount, tax, total } = calculateTotals();
    const paid = parseFloat(paidAmount) || 0;
    const remaining = total - paid;

    let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (paid >= total) {
      paymentStatus = 'paid';
    } else if (paid > 0) {
      paymentStatus = 'partial';
    }

    const newInvoice: PurchaseInvoice = {
      id: Date.now().toString(),
      invoiceNumber: `PO-${(purchases.length + 1).toString().padStart(3, '0')}`,
      supplierId: selectedSupplier,
      supplierName: supplier.name,
      items: invoiceItems,
      subtotal,
      tax,
      discount,
      total,
      paidAmount: paid,
      remainingAmount: remaining,
      paymentStatus,
      notes: invoiceNotes,
      createdAt: new Date(),
    };

    setPurchases([newInvoice, ...purchases]);

    // Update product stock
    setProducts(products.map(p => {
      const invoiceItem = invoiceItems.find(item => item.productId === p.id);
      if (invoiceItem) {
        return { ...p, stock: p.stock + invoiceItem.quantity, cost: invoiceItem.cost };
      }
      return p;
    }));

    toast({
      title: "تم إنشاء فاتورة الشراء",
      description: `تم إضافة ${invoiceItems.length} منتج للمخزون`,
    });

    // Reset form
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setSelectedSupplier("");
    setInvoiceItems([]);
    setSelectedProduct("");
    setItemQuantity("");
    setItemCost("");
    setInvoiceDiscount("0");
    setPaidAmount("");
    setInvoiceNotes("");
  };

  const viewInvoice = (invoice: PurchaseInvoice) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && p.paymentStatus === filterStatus;
  });

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalPaid = purchases.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalRemaining = purchases.reduce((sum, p) => sum + p.remainingAmount, 0);
  const { subtotal: currentSubtotal, discount: currentDiscount, tax: currentTax, total: currentTotal } = calculateTotals();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">مدفوعة</Badge>;
      case 'partial':
        return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">جزئي</Badge>;
      case 'unpaid':
        return <Badge variant="destructive">غير مدفوعة</Badge>;
      default:
        return null;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المشتريات</h1>
          <p className="text-muted-foreground">إدارة فواتير الشراء من الموردين</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              فاتورة شراء جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة شراء</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Supplier Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المورد *</Label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المورد" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>تاريخ الفاتورة</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              {/* Add Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إضافة منتجات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label>المنتج</Label>
                      <Select value={selectedProduct} onValueChange={(value) => {
                        setSelectedProduct(value);
                        const product = products.find(p => p.id === value);
                        if (product) setItemCost(product.cost.toString());
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المنتج" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>الكمية</Label>
                      <Input
                        type="number"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>التكلفة</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={itemCost}
                        onChange={(e) => setItemCost(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addItemToInvoice} className="w-full">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة
                      </Button>
                    </div>
                  </div>

                  {/* Items Table */}
                  {invoiceItems.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">المنتج</TableHead>
                          <TableHead className="text-right">الكمية</TableHead>
                          <TableHead className="text-right">التكلفة</TableHead>
                          <TableHead className="text-right">الإجمالي</TableHead>
                          <TableHead className="text-right">حذف</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceItems.map((item) => (
                          <TableRow key={item.productId}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.cost.toFixed(2)} ر.س</TableCell>
                            <TableCell>{item.total.toFixed(2)} ر.س</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItemFromInvoice(item.productId)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Totals */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>الخصم</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={invoiceDiscount}
                      onChange={(e) => setInvoiceDiscount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>المبلغ المدفوع</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>ملاحظات</Label>
                    <Textarea
                      value={invoiceNotes}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                      placeholder="ملاحظات على الفاتورة..."
                    />
                  </div>
                </div>
                <Card className="bg-muted/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي:</span>
                      <span>{currentSubtotal.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>الخصم:</span>
                      <span>-{currentDiscount.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>الضريبة (15%):</span>
                      <span>{currentTax.toFixed(2)} ر.س</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                      <span>الإجمالي:</span>
                      <span>{currentTotal.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>المتبقي:</span>
                      <span className={currentTotal - (parseFloat(paidAmount) || 0) > 0 ? "text-orange-500" : "text-green-500"}>
                        {(currentTotal - (parseFloat(paidAmount) || 0)).toFixed(2)} ر.س
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button onClick={handleCreateInvoice} className="w-full" size="lg">
                <Receipt className="w-4 h-4 ml-2" />
                إنشاء الفاتورة وتحديث المخزون
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الفواتير</p>
                <p className="text-2xl font-bold">{purchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
                <p className="text-2xl font-bold">{totalPurchases.toLocaleString()} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المدفوع</p>
                <p className="text-2xl font-bold">{totalPaid.toLocaleString()} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Building2 className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المستحقات</p>
                <p className="text-2xl font-bold">{totalRemaining.toLocaleString()} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="بحث برقم الفاتورة أو اسم المورد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v: 'all' | 'paid' | 'partial' | 'unpaid') => setFilterStatus(v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفواتير</SelectItem>
                <SelectItem value="paid">مدفوعة</SelectItem>
                <SelectItem value="partial">مدفوعة جزئياً</SelectItem>
                <SelectItem value="unpaid">غير مدفوعة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>فواتير الشراء</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الفاتورة</TableHead>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">عدد الأصناف</TableHead>
                <TableHead className="text-right">الإجمالي</TableHead>
                <TableHead className="text-right">المدفوع</TableHead>
                <TableHead className="text-right">المتبقي</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-mono font-medium">{purchase.invoiceNumber}</TableCell>
                  <TableCell>{purchase.supplierName}</TableCell>
                  <TableCell>{purchase.createdAt.toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>{purchase.items.length}</TableCell>
                  <TableCell>{purchase.total.toFixed(2)} ر.س</TableCell>
                  <TableCell className="text-green-500">{purchase.paidAmount.toFixed(2)} ر.س</TableCell>
                  <TableCell className={purchase.remainingAmount > 0 ? "text-orange-500" : ""}>
                    {purchase.remainingAmount.toFixed(2)} ر.س
                  </TableCell>
                  <TableCell>{getStatusBadge(purchase.paymentStatus)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => viewInvoice(purchase)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>تفاصيل الفاتورة</span>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 print:p-4" id="print-invoice">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">رقم الفاتورة</p>
                  <p className="font-bold">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">التاريخ</p>
                  <p>{selectedInvoice.createdAt.toLocaleDateString('ar-SA')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المورد</p>
                  <p className="font-medium">{selectedInvoice.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">حالة الدفع</p>
                  {getStatusBadge(selectedInvoice.paymentStatus)}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">التكلفة</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.cost.toFixed(2)} ر.س</TableCell>
                      <TableCell>{item.total.toFixed(2)} ر.س</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{selectedInvoice.subtotal.toFixed(2)} ر.س</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>الخصم:</span>
                    <span>-{selectedInvoice.discount.toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>الضريبة (15%):</span>
                  <span>{selectedInvoice.tax.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>الإجمالي:</span>
                  <span>{selectedInvoice.total.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-green-500">
                  <span>المدفوع:</span>
                  <span>{selectedInvoice.paidAmount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-orange-500">
                  <span>المتبقي:</span>
                  <span>{selectedInvoice.remainingAmount.toFixed(2)} ر.س</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">ملاحظات</p>
                  <p>{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Purchases;
