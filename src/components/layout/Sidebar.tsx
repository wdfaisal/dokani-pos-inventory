import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  FileText,
  Clock,
  BarChart3,
  Tag,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Store,
  LogOut,
  Globe,
  Truck,
  Building2,
  Warehouse,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'لوحة التحكم', module: 'dashboard' },
  { path: '/pos', icon: ShoppingCart, label: 'نقطة البيع', module: 'pos' },
  { path: '/sales', icon: FileText, label: 'المبيعات', module: 'sales' },
  { path: '/online-orders', icon: Truck, label: 'طلبات الأون لاين', module: 'sales' },
  { path: '/products', icon: Package, label: 'المنتجات', module: 'products' },
  { path: '/categories', icon: Tag, label: 'التصنيفات', module: 'categories' },
  { path: '/inventory', icon: Warehouse, label: 'إدارة المخزون', module: 'inventory' },
  { path: '/suppliers', icon: Building2, label: 'الموردين', module: 'suppliers' },
  { path: '/purchases', icon: ShoppingBag, label: 'المشتريات', module: 'purchases' },
  { path: '/expenses', icon: Wallet, label: 'المصروفات', module: 'expenses' },
  { path: '/shifts', icon: Clock, label: 'الورديات', module: 'shifts' },
  { path: '/reports', icon: BarChart3, label: 'التقارير', module: 'reports' },
  { path: '/users', icon: Users, label: 'المستخدمين', module: 'users' },
  { path: '/settings', icon: Settings, label: 'الإعدادات', module: 'settings' },
];

const roleLabels: Record<string, string> = {
  admin: 'مدير النظام',
  accountant: 'محاسب',
  supervisor: 'مشرف',
  cashier: 'كاشير',
};

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();
  const { profile, role, signOut, hasPermission } = useAuth();

  const visibleMenuItems = menuItems.filter(item => hasPermission(item.module, 'view'));

  return (
    <aside
      className={cn(
        'fixed right-0 top-0 z-40 h-screen border-l border-sidebar-border bg-sidebar transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-[70px]' : 'w-[240px]'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">Dokani</span>
              <span className="text-[10px] text-muted-foreground">دُكاني</span>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-3 top-20 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar shadow-sm hover:bg-sidebar-accent"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {sidebarCollapsed ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            const linkContent = (
              <Link
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', sidebarCollapsed && 'mx-auto')} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );

            return (
              <li key={item.path}>
                {sidebarCollapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="left" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </li>
            );
          })}
        </ul>

        {/* External Store Link */}
        <div className="mt-4 pt-4 border-t border-sidebar-border">
          {!sidebarCollapsed && (
            <p className="px-3 mb-2 text-xs text-muted-foreground">روابط خارجية</p>
          )}
          <a
            href="/store"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Globe className={cn('h-5 w-5 shrink-0', sidebarCollapsed && 'mx-auto')} />
            {!sidebarCollapsed && <span>متجر العملاء</span>}
          </a>
        </div>
      </nav>

      {/* User Info */}
      <div className="border-t border-sidebar-border p-3">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-sm font-bold">
                {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'م'}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {profile?.full_name || profile?.username || 'مستخدم'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {role ? roleLabels[role] : 'كاشير'}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto cursor-pointer">
                <span className="text-sm font-bold">
                  {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'م'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="font-medium">{profile?.full_name || profile?.username}</p>
              <p className="text-xs text-muted-foreground">
                {role ? roleLabels[role] : 'كاشير'}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
