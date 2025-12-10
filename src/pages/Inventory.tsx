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
  Package, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  notes?: string;
  userId: string;
  createdAt: Date;
}

const Inventory = () => {
  const { toast } = useToast();
  const { products, setProducts } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const [movements, setMovements] = useState<StockMovement[]>([
    {
      id: "1",
      productId: "1",
      productName: "حليب طازج",
      type: "in",
      quantity: 50,
      previousStock: 100,
      newStock: 150,
      reference: "PO-001",
      userId: "1",
      createdAt: new Date(),
    },
    {
      id: "2",
      productId: "2",
      productName: "خبز أبيض",
      type: "out",
      quantity: 20,
      previousStock: 80,
      newStock: 60,
      notes: "تالف",
      userId: "1",
      createdAt: new Date(),
    },
  ]);

  const handleStockMovement = () => {
    if (!selectedProduct || !quantity) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار المنتج وإدخال الكمية",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كمية صحيحة",
        variant: "destructive",
      });
      return;
    }

    let newStock = product.stock;
    if (movementType === 'in') {
      newStock = product.stock + qty;
    } else if (movementType === 'out') {
      if (qty > product.stock) {
        toast({
          title: "خطأ",
          description: "الكمية المطلوبة أكبر من المخزون المتاح",
          variant: "destructive",
        });
        return;
      }
      newStock = product.stock - qty;
    } else {
      newStock = qty;
    }

    // Update product stock
    setProducts(products.map(p => 
      p.id === selectedProduct ? { ...p, stock: newStock } : p
    ));

    // Add movement record
    const movement: StockMovement = {
      id: Date.now().toString(),
      productId: selectedProduct,
      productName: product.name,
      type: movementType,
      quantity: qty,
      previousStock: product.stock,
      newStock,
      reference,
      notes,
      userId: "1",
      createdAt: new Date(),
    };
    setMovements([movement, ...movements]);

    toast({
      title: "تم تحديث المخزون",
      description: `${product.name}: ${product.stock} → ${newStock}`,
    });

    // Reset form
    setSelectedProduct("");
    setQuantity("");
    setReference("");
    setNotes("");
    setIsDialogOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);
    
    if (filterStock === 'low') {
      return matchesSearch && p.stock <= p.minStock && p.stock > 0;
    } else if (filterStock === 'out') {
      return matchesSearch && p.stock === 0;
    }
    return matchesSearch;
  });

  const lowStockCount = products.filter(p => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <ArrowUpCircle className="w-4 h-4 text-green-500" />;
      case 'out': return <ArrowDownCircle className="w-4 h-4 text-red-500" />;
      case 'adjustment': return <RotateCcw className="w-4 h-4 text-blue-500" />;
      case 'return': return <RotateCcw className="w-4 h-4 text-orange-500" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'in': return 'إضافة';
      case 'out': return 'صرف';
      case 'adjustment': return 'تعديل';
      case 'return': return 'مرتجع';
      default: return type;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المخزون</h1>
          <p className="text-muted-foreground">متابعة وتحديث مستويات المخزون</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              حركة مخزون
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة حركة مخزون</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>نوع الحركة</Label>
                <Select
                  value={movementType}
                  onValueChange={(value: 'in' | 'out' | 'adjustment') => setMovementType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">إضافة للمخزون</SelectItem>
                    <SelectItem value="out">صرف من المخزون</SelectItem>
                    <SelectItem value="adjustment">تعديل المخزون</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>المنتج</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} (المخزون: {p.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  {movementType === 'adjustment' ? 'المخزون الجديد' : 'الكمية'}
                </Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={movementType === 'adjustment' ? 'المخزون الفعلي' : 'أدخل الكمية'}
                />
              </div>
              <div>
                <Label>المرجع (اختياري)</Label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="رقم فاتورة الشراء أو المرجع"
                />
              </div>
              <div>
                <Label>ملاحظات</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="سبب الحركة أو ملاحظات إضافية"
                />
              </div>
              <Button onClick={handleStockMovement} className="w-full">
                تأكيد
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
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مخزون منخفض</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Package className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نفذ من المخزون</p>
                <p className="text-2xl font-bold">{outOfStockCount}</p>
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
                <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                <p className="text-2xl font-bold">{totalValue.toLocaleString()} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">مستويات المخزون</TabsTrigger>
          <TabsTrigger value="movements">سجل الحركات</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="بحث بالاسم أو الباركود..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={filterStock} onValueChange={(v: 'all' | 'low' | 'out') => setFilterStock(v)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المنتجات</SelectItem>
                    <SelectItem value="low">مخزون منخفض</SelectItem>
                    <SelectItem value="out">نفذ من المخزون</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stock Table */}
          <Card>
            <CardHeader>
              <CardTitle>مستويات المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-right">الباركود</TableHead>
                    <TableHead className="text-right">التصنيف</TableHead>
                    <TableHead className="text-right">المخزون</TableHead>
                    <TableHead className="text-right">الحد الأدنى</TableHead>
                    <TableHead className="text-right">التكلفة</TableHead>
                    <TableHead className="text-right">القيمة</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <span className={
                          product.stock === 0 ? "text-red-500 font-bold" :
                          product.stock <= product.minStock ? "text-orange-500 font-bold" : ""
                        }>
                          {product.stock} {product.unit}
                        </span>
                      </TableCell>
                      <TableCell>{product.minStock} {product.unit}</TableCell>
                      <TableCell>{product.cost.toFixed(2)} ر.س</TableCell>
                      <TableCell>{(product.cost * product.stock).toFixed(2)} ر.س</TableCell>
                      <TableCell>
                        {product.stock === 0 ? (
                          <Badge variant="destructive">نفذ</Badge>
                        ) : product.stock <= product.minStock ? (
                          <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                            منخفض
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                            متوفر
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل حركات المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">قبل</TableHead>
                    <TableHead className="text-right">بعد</TableHead>
                    <TableHead className="text-right">المرجع</TableHead>
                    <TableHead className="text-right">ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {movement.createdAt.toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell className="font-medium">{movement.productName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.type)}
                          {getMovementLabel(movement.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={
                          movement.type === 'in' ? "text-green-500" : 
                          movement.type === 'out' ? "text-red-500" : ""
                        }>
                          {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{movement.previousStock}</TableCell>
                      <TableCell>{movement.newStock}</TableCell>
                      <TableCell>{movement.reference || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {movement.notes || "-"}
                      </TableCell>
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
};

export default Inventory;
