import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Barcode,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
      barcode: '',
      code: '',
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      category: '',
      unit: 'قطعة',
      isWeighted: false,
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      barcode: formData.barcode || `BAR${Date.now()}`,
      code: formData.code || `P${Date.now().toString().slice(-4)}`,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost) || 0,
      stock: parseInt(formData.stock) || 0,
      minStock: parseInt(formData.minStock) || 5,
      category: formData.category,
      unit: formData.unit,
      isWeighted: formData.isWeighted,
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
    });
    setShowAddDialog(true);
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('تم حذف المنتج');
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
          <DialogContent className="max-w-lg">
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
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                    placeholder="رقم الباركود"
                  />
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
                          {product.unit}
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
