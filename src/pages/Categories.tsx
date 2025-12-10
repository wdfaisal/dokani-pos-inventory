import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Tag, Search } from 'lucide-react';

const colorOptions = [
  '#8B5CF6', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4',
  '#EC4899', '#6366F1', '#84CC16', '#F97316', '#14B8A6', '#A855F7',
];

export default function Categories() {
  const { categories, setCategories, products } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    icon: 'Tag',
    color: '#8B5CF6',
  });

  const filteredCategories = categories.filter((cat) =>
    cat.name.includes(searchQuery) || cat.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: '', nameEn: '', icon: 'Tag', color: '#8B5CF6' });
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('يرجى إدخال اسم التصنيف');
      return;
    }

    const productsCount = products.filter((p) => p.category === formData.name).length;

    const categoryData: Category = {
      id: editingCategory?.id || Date.now().toString(),
      name: formData.name,
      nameEn: formData.nameEn || formData.name,
      icon: formData.icon,
      color: formData.color,
      productsCount: editingCategory?.productsCount || productsCount,
    };

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? categoryData : c))
      );
      toast.success('تم تعديل التصنيف بنجاح');
    } else {
      setCategories((prev) => [...prev, categoryData]);
      toast.success('تم إضافة التصنيف بنجاح');
    }

    setShowAddDialog(false);
    setEditingCategory(null);
    resetForm();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      nameEn: category.nameEn,
      icon: category.icon,
      color: category.color,
    });
    setShowAddDialog(true);
  };

  const handleDelete = (id: string) => {
    const category = categories.find((c) => c.id === id);
    const hasProducts = products.some((p) => p.category === category?.name);
    
    if (hasProducts) {
      toast.error('لا يمكن حذف تصنيف يحتوي على منتجات');
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success('تم حذف التصنيف');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">التصنيفات</h1>
          <p className="text-sm text-muted-foreground">
            إدارة تصنيفات المنتجات
          </p>
        </div>
        <Dialog
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) {
              setEditingCategory(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة تصنيف
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
              </DialogTitle>
              <DialogDescription>
                أدخل بيانات التصنيف
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم التصنيف *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم التصنيف بالعربي"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Category name in English"
                />
              </div>
              <div className="space-y-2">
                <Label>اللون</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingCategory(null);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
              <Button onClick={handleSave}>
                {editingCategory ? 'حفظ التعديلات' : 'إضافة التصنيف'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث في التصنيفات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCategories.map((category) => {
          const categoryProductsCount = products.filter((p) => p.category === category.name).length;
          
          return (
            <Card key={category.id} className="group relative overflow-hidden">
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: category.color }}
              />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Tag className="h-6 w-6" style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.nameEn}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="secondary">
                    {categoryProductsCount} منتج
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
