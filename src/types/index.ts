export interface Product {
  id: string;
  name: string;
  barcode: string;
  code: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  unit: string;
  isWeighted: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem extends Product {
  quantity: number;
  discount: number;
  total: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  isActive: boolean;
  requiresTransactionId: boolean;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime?: Date;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  totalSales: number;
  totalExpenses: number;
  cashSales: number;
  cardSales: number;
  otherSales: number;
  transactionsCount: number;
  status: 'open' | 'closed';
  notes?: string;
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
  role: 'admin' | 'cashier' | 'manager';
  permissions: string[];
  isActive: boolean;
  avatar?: string;
  createdAt: Date;
}

export interface StoreSettings {
  name: string;
  nameEn: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  taxNumber?: string;
  currency: string;
  taxRate: number;
  language: 'ar' | 'en';
  receiptHeader?: string;
  receiptFooter?: string;
  enableTax: boolean;
  enableDiscounts: boolean;
  enableCustomerInfo: boolean;
  lowStockThreshold: number;
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
  activeShift?: Shift;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  productsCount: number;
}
