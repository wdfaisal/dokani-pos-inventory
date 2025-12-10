import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Barcode,
  Filter,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Generate a random barcode
const generateBarcode = () => {
  const prefix = '628';
  const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return prefix + random;
};

// Generate scale barcode (PLU format)
const generateScaleBarcode = (code: string, price: number) => {
  const pluCode = code.replace(/\D/g, '').padStart(5, '0').slice(0, 5);
  const priceStr = Math.round(price * 100).toString().padStart(5, '0').slice(0, 5);
  const checkDigit = (parseInt(pluCode) + parseInt(priceStr)) % 10;
  return `20${pluCode}${priceStr}${checkDigit}`;
};

export default function Products() {
  const { products, setProducts, categories, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    code: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    category: '',
    unit: 'قطعة',
    isWeighted: false,
    productionDate: '',
    expiryDate: '',
    scaleBarcode: '',
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.includes(searchQuery) ||
      product.barcode.includes(searchQuery) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      barcode: generateBarcode(),
      code: `P${Date.now().toString().slice(-4)}`,
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      category: '',
      unit: 'قطعة',
      isWeighted: false,
      productionDate: '',
      expiryDate: '',
      scaleBarcode: '',
    });
  };

  // Auto-generate barcode when dialog opens for new product
  useEffect(() => {
    if (showAddDialog && !editingProduct) {
      setFormData(prev => ({
        ...prev,
        barcode: generateBarcode(),
        code: `P${Date.now().toString().slice(-4)}`,
      }));
    }
  }, [showAddDialog, editingProduct]);

  // Auto-generate scale barcode when price or code changes for weighted products
  useEffect(() => {
    if (formData.isWeighted && formData.code && formData.price) {
      const scaleBarcode = generateScaleBarcode(formData.code, parseFloat(formData.price) || 0);
      setFormData(prev => ({ ...prev, scaleBarcode }));
    }
  }, [formData.isWeighted, formData.code, formData.price]);

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      barcode: formData.barcode || generateBarcode(),
      code: formData.code || `P${Date.now().toString().slice(-4)}`,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost) || 0,
      stock: parseInt(formData.stock) || 0,
      minStock: parseInt(formData.minStock) || 5,
      category: formData.category,
      unit: formData.unit,
      isWeighted: formData.isWeighted,
      productionDate: formData.productionDate ? new Date(formData.productionDate) : undefined,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      scaleBarcode: formData.isWeighted ? formData.scaleBarcode : undefined,
      createdAt: editingProduct?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? productData : p))
      );
      toast.success('تم تعديل المنتج بنجاح');
    } else {
      setProducts((prev) => [...prev, productData]);
      toast.success('تم إضافة المنتج بنجاح');
    }

    setShowAddDialog(false);
    setEditingProduct(null);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      barcode: product.barcode,
      code: product.code,
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      category: product.category,
      unit: product.unit,
      isWeighted: product.isWeighted,
      productionDate: product.productionDate ? format(new Date(product.productionDate), 'yyyy-MM-dd') : '',
      expiryDate: product.expiryDate ? format(new Date(product.expiryDate), 'yyyy-MM-dd') : '',
      scaleBarcode: product.scaleBarcode || '',
    });
    setShowAddDialog(true);
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('تم حذف المنتج');
  };

  const regenerateBarcode = () => {
    setFormData(prev => ({ ...prev, barcode: generateBarcode() }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المنتجات</h1>
          <p className="text-sm text-muted-foreground">
            إدارة منتجات المتجر والأسعار والمخزون
          </p>
        </div>
        <Dialog
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) {
              setEditingProduct(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </DialogTitle>
              <DialogDescription>
                أدخل بيانات المنتج في الحقول التالية
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المنتج *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="اسم المنتج"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">التصنيف *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">الباركود</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) =>
                        setFormData({ ...formData, barcode: e.target.value })
                      }
                      placeholder="رقم الباركود"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={regenerateBarcode}
                      title="توليد باركود جديد"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">كود المنتج</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="كود المنتج"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">سعر البيع *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">سعر التكلفة</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">الكمية المتوفرة</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">الحد الأدنى للتنبيه</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({ ...formData, minStock: e.target.value })
                    }
                    placeholder="5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productionDate">تاريخ الإنتاج</Label>
                  <Input
                    id="productionDate"
                    type="date"
                    value={formData.productionDate}
                    onChange={(e) =>
                      setFormData({ ...formData, productionDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">تاريخ الانتهاء</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">وحدة القياس</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) =>
                      setFormData({ ...formData, unit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="قطعة">قطعة</SelectItem>
                      <SelectItem value="كيلو">كيلو</SelectItem>
                      <SelectItem value="لتر">لتر</SelectItem>
                      <SelectItem value="علبة">علبة</SelectItem>
                      <SelectItem value="كرتون">كرتون</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>منتج موزون</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={formData.isWeighted}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isWeighted: checked })
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      يُباع بالوزن
                    </span>
                  </div>
                </div>
              </div>
              {formData.isWeighted && (
                <div className="space-y-2">
                  <Label htmlFor="scaleBarcode">باركود الميزان (PLU)</Label>
                  <Input
                    id="scaleBarcode"
                    value={formData.scaleBarcode}
                    onChange={(e) =>
                      setFormData({ ...formData, scaleBarcode: e.target.value })
                    }
                    placeholder="يتم توليده تلقائياً"
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    يتم توليد باركود الميزان تلقائياً بناءً على كود المنتج والسعر
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingProduct(null);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
              <Button onClick={handleSave}>
                {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الباركود أو الكود..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="ml-2 h-4 w-4" />
            <SelectValue placeholder="كل التصنيفات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>الباركود / الكود</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>المخزون</TableHead>
                <TableHead>تاريخ الانتهاء</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.unit} {product.isWeighted && '(موزون)'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs">
                        <Barcode className="h-3 w-3" />
                        {product.barcode}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {product.code}
                      </p>
                      {product.scaleBarcode && (
                        <p className="text-xs text-primary">
                          PLU: {product.scaleBarcode}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {product.price} {settings.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      تكلفة: {product.cost} {settings.currency}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{product.stock}</p>
                    <p className="text-xs text-muted-foreground">
                      حد أدنى: {product.minStock}
                    </p>
                  </TableCell>
                  <TableCell>
                    {product.expiryDate ? (
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(product.expiryDate), 'dd/MM/yyyy')}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.stock === 0 ? (
                      <Badge variant="destructive">نفذ</Badge>
                    ) : product.stock <= product.minStock ? (
                      <Badge
                        variant="secondary"
                        className="bg-warning/10 text-warning"
                      >
                        منخفض
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-success/10 text-success"
                      >
                        متوفر
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
