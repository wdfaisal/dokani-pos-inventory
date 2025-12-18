// Re-export types from AppContext for backward compatibility
export type { Product, Category, PaymentMethod, Shift, Expense, StoreSettings } from '@/contexts/AppContext';

// Cart item extends the database Product with cart-specific fields
export interface CartItem {
  id: string;
  name: string;
  barcode: string | null;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category_id: string | null;
  categoryName?: string;
  unit: string;
  is_weighted: boolean;
  quantity: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  shiftId: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  transactionId?: string;
  amountPaid: number;
  change: number;
  status: 'completed' | 'cancelled' | 'refunded';
  createdAt: Date;
  customerName?: string;
  customerPhone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'manager' | 'owner';
  permissions: string[];
  isActive: boolean;
  avatar?: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: Date;
  module: string;
}

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayRevenue: number;
  todayExpenses: number;
  lowStockItems: number;
}
