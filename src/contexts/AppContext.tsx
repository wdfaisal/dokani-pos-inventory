import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StoreSettings, User, Shift, PaymentMethod, Product, Category } from '@/types';

interface AppContextType {
  settings: StoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  currentShift: Shift | null;
  setCurrentShift: React.Dispatch<React.SetStateAction<Shift | null>>;
  paymentMethods: PaymentMethod[];
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultSettings: StoreSettings = {
  name: 'دُكاني سوبر ماركت',
  nameEn: 'Dokani Supermarket',
  address: 'الخرطوم، السودان',
  phone: '+249 912 345 678',
  email: 'info@dokani.com',
  currency: 'ج.س',
  taxRate: 15,
  language: 'ar',
  receiptHeader: 'مرحباً بكم في دُكاني',
  receiptFooter: 'شكراً لتسوقكم معنا',
  enableTax: true,
  enableDiscounts: true,
  enableCustomerInfo: false,
  lowStockThreshold: 10,
};

const defaultPaymentMethods: PaymentMethod[] = [
  { id: '1', name: 'كاش', nameEn: 'Cash', icon: 'Banknote', isActive: true, requiresTransactionId: false },
  { id: '2', name: 'بنكك', nameEn: 'Bank', icon: 'CreditCard', isActive: true, requiresTransactionId: true },
  { id: '3', name: 'فوري', nameEn: 'Fawry', icon: 'Smartphone', isActive: true, requiresTransactionId: true },
];

const defaultCategories: Category[] = [
  { id: '1', name: 'مشروبات', nameEn: 'Beverages', icon: 'Coffee', color: '#8B5CF6', productsCount: 25 },
  { id: '2', name: 'منتجات الألبان', nameEn: 'Dairy', icon: 'Milk', color: '#3B82F6', productsCount: 18 },
  { id: '3', name: 'خضروات وفواكه', nameEn: 'Produce', icon: 'Apple', color: '#22C55E', productsCount: 32 },
  { id: '4', name: 'مخبوزات', nameEn: 'Bakery', icon: 'Croissant', color: '#F59E0B', productsCount: 12 },
  { id: '5', name: 'لحوم ودواجن', nameEn: 'Meat', icon: 'Beef', color: '#EF4444', productsCount: 15 },
  { id: '6', name: 'منظفات', nameEn: 'Cleaning', icon: 'Sparkles', color: '#06B6D4', productsCount: 20 },
];

const sampleProducts: Product[] = [
  { id: '1', name: 'حليب المراعي طازج 1 لتر', barcode: '6281007012345', code: 'P001', price: 6.5, cost: 5.0, stock: 50, minStock: 10, category: 'منتجات الألبان', unit: 'قطعة', isWeighted: false, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'خبز أبيض', barcode: '6281007012346', code: 'P002', price: 3.0, cost: 2.0, stock: 30, minStock: 5, category: 'مخبوزات', unit: 'قطعة', isWeighted: false, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'بيبسي 330 مل', barcode: '6281007012347', code: 'P003', price: 2.5, cost: 1.8, stock: 100, minStock: 20, category: 'مشروبات', unit: 'قطعة', isWeighted: false, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'تفاح أحمر', barcode: '6281007012348', code: 'P004', price: 8.0, cost: 5.5, stock: 25, minStock: 5, category: 'خضروات وفواكه', unit: 'كيلو', isWeighted: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '5', name: 'دجاج طازج', barcode: '6281007012349', code: 'P005', price: 18.0, cost: 14.0, stock: 15, minStock: 5, category: 'لحوم ودواجن', unit: 'كيلو', isWeighted: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '6', name: 'صابون غسيل', barcode: '6281007012350', code: 'P006', price: 12.0, cost: 9.0, stock: 8, minStock: 10, category: 'منظفات', unit: 'قطعة', isWeighted: false, createdAt: new Date(), updatedAt: new Date() },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: '1',
    name: 'أحمد محمد',
    email: 'admin@dokani.com',
    role: 'admin',
    permissions: ['all'],
    isActive: true,
    createdAt: new Date(),
  });
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(defaultPaymentMethods);
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <AppContext.Provider
      value={{
        settings,
        setSettings,
        currentUser,
        setCurrentUser,
        currentShift,
        setCurrentShift,
        paymentMethods,
        setPaymentMethods,
        products,
        setProducts,
        categories,
        setCategories,
        sidebarCollapsed,
        setSidebarCollapsed,
        isFullscreen,
        setIsFullscreen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
