import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Store as StoreIcon,
  Phone,
  MapPin,
  X,
  Package,
  Filter
} from 'lucide-react';
import { CartItem } from '@/types';
import { toast } from 'sonner';

export default function Store() {
  const { settings, products, categories } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Filter products with stock > 0
  const availableProducts = useMemo(() => {
    return products.filter(product => {
      const hasStock = product.stock > 0;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.barcode || '').includes(searchQuery) ||
        (product.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
      return hasStock && matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('الكمية المطلوبة غير متوفرة');
          return prev;
        }
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, discount: 0, total: product.price }];
    });
    toast.success('تمت الإضافة إلى السلة');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item;
          const product = products.find(p => p.id === productId);
          if (product && newQty > product.stock) {
            toast.error('الكمية المطلوبة غير متوفرة');
            return item;
          }
          return { ...item, quantity: newQty, total: newQty * item.price };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const submitOrder = () => {
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }
    if (!customerName || !customerPhone) {
      toast.error('يرجى إدخال بيانات التواصل');
      return;
    }
    // Here you would submit the order to backend
    toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً');
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setShowCart(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <StoreIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">{settings.name}</h1>
                <p className="text-xs text-muted-foreground">تسوق اونلاين</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="relative"
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Store Info */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span dir="ltr">{settings.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="sticky top-[65px] z-40 bg-background/95 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 h-12 text-lg"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="shrink-0"
            >
              الكل
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.name)}
                className="shrink-0"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-6">
        {availableProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">لا توجد منتجات متاحة</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {availableProducts.map(product => {
              const inCart = cart.find(item => item.id === product.id);
              return (
                <div
                  key={product.id}
                  className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div className="aspect-square bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center relative">
                    <Package className="w-12 h-12 text-muted-foreground/30" />
                    {product.stock <= product.minStock && (
                      <Badge className="absolute top-2 right-2 bg-orange-500/90 text-white text-xs">
                        كمية محدودة
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-primary font-bold text-lg">
                        {product.price.toFixed(2)} <span className="text-xs">{settings.currency}</span>
                      </p>
                      <span className="text-xs text-muted-foreground">{product.unit}</span>
                    </div>
                    {inCart ? (
                      <div className="flex items-center justify-between bg-secondary/50 rounded-xl p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(product.id, -1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold">{inCart.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(product.id, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full gap-2"
                        size="sm"
                        onClick={() => addToCart(product)}
                      >
                        <Plus className="w-4 h-4" />
                        أضف للسلة
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="absolute inset-y-0 left-0 w-full max-w-md bg-background shadow-xl flex flex-col animate-in slide-in-from-left">
            {/* Cart Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">سلة التسوق ({cartCount})</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">السلة فارغة</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-3 bg-secondary/30 rounded-xl p-3">
                    <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-primary font-bold">{item.price.toFixed(2)} {settings.currency}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-medium w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive mr-auto"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">{item.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Info & Checkout */}
            {cart.length > 0 && (
              <div className="border-t p-4 space-y-3 bg-background">
                <Input
                  placeholder="الاسم"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Input
                  placeholder="رقم الهاتف"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  dir="ltr"
                  className="text-right"
                />
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium">الإجمالي</span>
                  <span className="text-xl font-bold text-primary">{cartTotal.toFixed(2)} {settings.currency}</span>
                </div>
                <Button className="w-full h-12 text-lg" onClick={submitOrder}>
                  إرسال الطلب
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  سيتم التواصل معك لتأكيد الطلب وترتيب التوصيل
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Cart Button (Mobile) */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden">
          <Button 
            className="w-full h-14 text-lg gap-2 shadow-lg"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            عرض السلة ({cartCount})
            <span className="mr-auto font-bold">{cartTotal.toFixed(2)} {settings.currency}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
