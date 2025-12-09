import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function LowStockAlert() {
  const { products, settings } = useApp();

  const lowStockProducts = products.filter(
    (p) => p.stock <= p.minStock
  );

  if (lowStockProducts.length === 0) {
    return (
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            عناصر غير متوفرة في المخزون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              لا توجد عناصر غير متوفرة حالياً
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up border-warning/30 bg-warning/5">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2 text-warning">
          <AlertTriangle className="h-5 w-5" />
          تنبيه المخزون
        </CardTitle>
        <Link to="/inventory">
          <Button variant="outline" size="sm">
            عرض الكل
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockProducts.slice(0, 5).map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-lg bg-card p-3 border"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Package className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    الكود: {product.code}
                  </p>
                </div>
              </div>
              <Badge
                variant={product.stock === 0 ? 'destructive' : 'secondary'}
                className="font-medium"
              >
                {product.stock === 0 ? 'نفذ' : `${product.stock} متبقي`}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
