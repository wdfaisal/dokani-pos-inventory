import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Package,
  FileText,
  Clock,
  Plus,
  BarChart3,
} from 'lucide-react';

const actions = [
  { icon: ShoppingCart, label: 'بدء البيع', path: '/pos', color: 'primary' },
  { icon: Plus, label: 'منتج جديد', path: '/products?new=true', color: 'success' },
  { icon: FileText, label: 'عرض الفواتير', path: '/invoices', color: 'default' },
  { icon: Clock, label: 'إدارة الورديات', path: '/shifts', color: 'warning' },
  { icon: BarChart3, label: 'التقارير', path: '/reports', color: 'default' },
  { icon: Package, label: 'جرد المخزون', path: '/inventory', color: 'default' },
];

export function QuickActions() {
  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.path} to={action.path}>
                <Button
                  variant={action.color === 'primary' ? 'default' : 'outline'}
                  className="w-full h-auto flex-col gap-2 py-4 hover:shadow-sm transition-all"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
