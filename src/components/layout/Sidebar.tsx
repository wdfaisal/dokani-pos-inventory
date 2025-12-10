import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
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
  Warehouse,
  ChevronLeft,
  ChevronRight,
  Store,
  LogOut,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { path: '/pos', icon: ShoppingCart, label: 'نقطة البيع' },
  { path: '/products', icon: Package, label: 'المنتجات' },
  { path: '/categories', icon: Tag, label: 'التصنيفات' },
  { path: '/inventory', icon: Warehouse, label: 'المخزون' },
  { path: '/invoices', icon: FileText, label: 'الفواتير' },
  { path: '/shifts', icon: Clock, label: 'الورديات' },
  { path: '/reports', icon: BarChart3, label: 'التقارير' },
  { path: '/users', icon: Users, label: 'المستخدمين' },
  { path: '/settings', icon: Settings, label: 'الإعدادات' },
  { path: '/order', icon: Globe, label: 'الطلب أون لاين' },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed, settings, currentUser } = useApp();

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
          {menuItems.map((item) => {
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
      </nav>

      {/* User Info */}
      <div className="border-t border-sidebar-border p-3">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-sm font-bold">
                {currentUser?.name?.charAt(0) || 'م'}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {currentUser?.name || 'مستخدم'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {currentUser?.role === 'admin' ? 'مدير النظام' : 'كاشير'}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto cursor-pointer">
                <span className="text-sm font-bold">
                  {currentUser?.name?.charAt(0) || 'م'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="font-medium">{currentUser?.name}</p>
              <p className="text-xs text-muted-foreground">
                {currentUser?.role === 'admin' ? 'مدير النظام' : 'كاشير'}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
