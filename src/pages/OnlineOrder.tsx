import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Store,
  Phone,
  MapPin,
  Send,
  Package,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartItem extends Product {
  quantity: number;
  total: number;
}

export default function OnlineOrder() {
  const { products, categories, settings } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Filter products with stock > 0
  const availableProducts = products.filter((p) => p.stock > 0);

  const filteredProducts = availableProducts.filter((product) => {
    const matchesSearch =
      product.name.includes(searchQuery) ||
      product.barcode.includes(searchQuery);
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('الكمية المطلوبة غير متوفرة');
          return prev;
        }
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
        { ...product, quantity: 1, total: product.price },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.stock) {
              toast.error('الكمية المطلوبة غير متوفرة');
              return item;
            }
            return { ...item, quantity: newQty, total: newQty * item.price };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const submitOrder = () => {
    if (!customerName || !customerPhone) {
      toast.error('يرجى إدخال الاسم ورقم الهاتف');
      return;
    }
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    // Here you would send the order to the backend
    toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً');
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">دُكاني</h1>
                <p className="text-xs text-muted-foreground">{settings.name}</p>
              </div>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    سلة التسوق
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-[calc(100vh-100px)] mt-4">
                  {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                        <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">سلتك فارغة</p>
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="flex-1">
                        <div className="space-y-3 pl-1">
                          {cart.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-3 rounded-xl border bg-card"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.price} {settings.currency} × {item.quantity}
                                </p>
                                <p className="text-sm font-semibold text-primary">
                                  {item.total.toFixed(2)} {settings.currency}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, -1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="border-t pt-4 mt-4 space-y-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>الإجمالي</span>
                          <span className="text-primary">
                            {cartTotal.toFixed(2)} {settings.currency}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <Input
                            placeholder="الاسم *"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                          />
                          <Input
                            placeholder="رقم الهاتف *"
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                          />
                          <Input
                            placeholder="العنوان (اختياري)"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                          />
                        </div>

                        <Button className="w-full h-12" onClick={submitOrder}>
                          <Send className="ml-2 h-5 w-5" />
                          إرسال الطلب
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 h-11 rounded-xl"
            />
          </div>
        </div>

        {/* Categories */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 px-4 pb-3">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              className="rounded-full shrink-0"
              onClick={() => setSelectedCategory(null)}
            >
              الكل
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.name ? 'default' : 'outline'}
                size="sm"
                className="rounded-full shrink-0"
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </header>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد منتجات متاحة</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => {
              const inCart = cart.find((item) => item.id === product.id);
              return (
                <div
                  key={product.id}
                  className={cn(
                    'relative rounded-2xl border bg-card p-3 transition-all',
                    'hover:shadow-lg hover:border-primary/50',
                    'active:scale-[0.98]'
                  )}
                  onClick={() => addToCart(product)}
                >
                  {/* Stock Badge */}
                  <Badge
                    variant={product.stock <= product.minStock ? 'destructive' : 'secondary'}
                    className="absolute top-2 left-2 text-[10px]"
                  >
                    متوفر: {product.stock}
                  </Badge>

                  {/* Cart indicator */}
                  {inCart && (
                    <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {inCart.quantity}
                    </div>
                  )}

                  <div className="pt-6 space-y-2">
                    <Badge variant="outline" className="text-[10px]">
                      {product.category}
                    </Badge>
                    <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {product.price}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {settings.currency}
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full h-9 rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة للسلة
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Fixed Cart Button (Mobile) */}
      {cartCount > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <div className="fixed bottom-4 left-4 right-4 z-50">
              <Button className="w-full h-14 rounded-2xl shadow-2xl text-base">
                <ShoppingCart className="ml-2 h-5 w-5" />
                عرض السلة ({cartCount})
                <span className="mr-auto font-bold">
                  {cartTotal.toFixed(2)} {settings.currency}
                </span>
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md">
            {/* Same cart content as above - Sheet will reuse */}
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                سلة التسوق
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col h-[calc(100vh-100px)] mt-4">
              <ScrollArea className="flex-1">
                <div className="space-y-3 pl-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl border bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.price} {settings.currency} × {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {item.total.toFixed(2)} {settings.currency}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t pt-4 mt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary">
                    {cartTotal.toFixed(2)} {settings.currency}
                  </span>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="الاسم *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <Input
                    placeholder="رقم الهاتف *"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                  <Input
                    placeholder="العنوان (اختياري)"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>

                <Button className="w-full h-12" onClick={submitOrder}>
                  <Send className="ml-2 h-5 w-5" />
                  إرسال الطلب
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Store Info Footer */}
      <footer className="border-t bg-card mt-8 pb-24">
        <div className="container mx-auto px-4 py-6 space-y-3">
          <h3 className="font-semibold mb-3">معلومات المتجر</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="h-4 w-4" />
            <span>{settings.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{settings.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span dir="ltr">{settings.phone}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
