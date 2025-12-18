import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types that match our Supabase schema
export interface Product {
  id: string;
  name: string;
  name_en: string | null;
  barcode: string | null;
  sku: string | null;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category_id: string | null;
  categoryName?: string;
  unit: string;
  is_weighted: boolean;
  image_url: string | null;
  production_date: string | null;
  expiry_date: string | null;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  name_en: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  name_en: string | null;
  icon: string | null;
  is_active: boolean;
  requires_reference: boolean;
  sort_order: number;
}

export interface Shift {
  id: string;
  user_id: string;
  store_id: string;
  started_at: string;
  closed_at: string | null;
  opening_balance: number;
  closing_balance: number | null;
  expected_balance: number | null;
  difference: number | null;
  total_sales: number;
  total_expenses: number;
  cash_sales: number;
  card_sales: number;
  other_sales: number;
  transactions_count: number;
  status: string;
  notes: string | null;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  reference: string | null;
  shift_id: string | null;
  user_id: string;
  store_id: string;
  created_at: string;
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

interface AppContextType {
  settings: StoreSettings;
  currentShift: Shift | null;
  setCurrentShift: React.Dispatch<React.SetStateAction<Shift | null>>;
  paymentMethods: PaymentMethod[];
  products: Product[];
  categories: Category[];
  expenses: Expense[];
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshPaymentMethods: () => Promise<void>;
  refreshCurrentShift: () => Promise<void>;
  openShift: (openingBalance: number) => Promise<Shift | null>;
  closeShift: (closingBalance: number, notes?: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'user_id' | 'store_id'>) => Promise<void>;
  createSale: (saleData: {
    items: Array<{ product_id: string; product_name: string; quantity: number; unit_price: number; discount: number; total: number }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paid_amount: number;
    change_amount: number;
    payment_method_id: string | null;
    payment_reference?: string;
    customer_name?: string;
    customer_phone?: string;
  }) => Promise<{ invoice_number: string } | null>;
}

const defaultSettings: StoreSettings = {
  name: 'دُكاني',
  nameEn: 'Dokani',
  address: '',
  phone: '',
  email: '',
  currency: 'SAR',
  taxRate: 15,
  language: 'ar',
  receiptHeader: 'مرحباً بكم',
  receiptFooter: 'شكراً لتسوقكم معنا',
  enableTax: true,
  enableDiscounts: true,
  enableCustomerInfo: false,
  lowStockThreshold: 10,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, currentStore } = useAuth();
  
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Update settings when store changes
  useEffect(() => {
    if (currentStore) {
      setSettings({
        name: currentStore.name,
        nameEn: currentStore.name_en || currentStore.name,
        logo: currentStore.logo_url || undefined,
        address: currentStore.address || '',
        phone: currentStore.phone || '',
        email: currentStore.email || '',
        taxNumber: currentStore.tax_number || undefined,
        currency: currentStore.currency,
        taxRate: currentStore.tax_rate,
        language: 'ar',
        receiptHeader: 'مرحباً بكم',
        receiptFooter: 'شكراً لتسوقكم معنا',
        enableTax: true,
        enableDiscounts: true,
        enableCustomerInfo: false,
        lowStockThreshold: 10,
      });
    }
  }, [currentStore]);

  const refreshProducts = useCallback(async () => {
    if (!currentStore) return;
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name)
      `)
      .eq('store_id', currentStore.id)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    setProducts(data.map(p => ({
      ...p,
      minStock: p.min_stock,
      categoryName: p.categories?.name || '',
    })));
  }, [currentStore]);

  const refreshCategories = useCallback(async () => {
    if (!currentStore) return;
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', currentStore.id)
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    setCategories(data);
  }, [currentStore]);

  const refreshPaymentMethods = useCallback(async () => {
    if (!currentStore) return;
    
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('store_id', currentStore.id)
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching payment methods:', error);
      return;
    }

    setPaymentMethods(data);
  }, [currentStore]);

  const refreshCurrentShift = useCallback(async () => {
    if (!currentStore || !user) return;
    
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('store_id', currentStore.id)
      .eq('user_id', user.id)
      .eq('status', 'open')
      .maybeSingle();

    if (error) {
      console.error('Error fetching shift:', error);
      return;
    }

    setCurrentShift(data);
  }, [currentStore, user]);

  const openShift = async (openingBalance: number): Promise<Shift | null> => {
    if (!currentStore || !user) return null;

    const { data, error } = await supabase
      .from('shifts')
      .insert({
        store_id: currentStore.id,
        user_id: user.id,
        opening_balance: openingBalance,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Error opening shift:', error);
      toast.error('فشل في فتح الوردية');
      return null;
    }

    setCurrentShift(data);
    toast.success('تم فتح الوردية بنجاح');
    return data;
  };

  const closeShift = async (closingBalance: number, notes?: string) => {
    if (!currentShift) return;

    const expectedBalance = currentShift.opening_balance + currentShift.cash_sales - currentShift.total_expenses;
    const difference = closingBalance - expectedBalance;

    const { error } = await supabase
      .from('shifts')
      .update({
        closing_balance: closingBalance,
        expected_balance: expectedBalance,
        difference,
        closed_at: new Date().toISOString(),
        status: 'closed',
        notes,
      })
      .eq('id', currentShift.id);

    if (error) {
      console.error('Error closing shift:', error);
      toast.error('فشل في إغلاق الوردية');
      return;
    }

    setCurrentShift(null);
    toast.success('تم إغلاق الوردية بنجاح');
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'user_id' | 'store_id'>) => {
    if (!currentStore || !user) return;

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expense,
        store_id: currentStore.id,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      toast.error('فشل في إضافة المصروف');
      return;
    }

    setExpenses(prev => [data, ...prev]);

    // Update shift expenses
    if (currentShift && expense.shift_id === currentShift.id) {
      const { error: shiftError } = await supabase
        .from('shifts')
        .update({
          total_expenses: currentShift.total_expenses + expense.amount,
        })
        .eq('id', currentShift.id);

      if (!shiftError) {
        setCurrentShift(prev => prev ? {
          ...prev,
          total_expenses: prev.total_expenses + expense.amount,
        } : null);
      }
    }

    toast.success('تم إضافة المصروف بنجاح');
  };

  const createSale = async (saleData: {
    items: Array<{ product_id: string; product_name: string; quantity: number; unit_price: number; discount: number; total: number }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paid_amount: number;
    change_amount: number;
    payment_method_id: string | null;
    payment_reference?: string;
    customer_name?: string;
    customer_phone?: string;
  }): Promise<{ invoice_number: string } | null> => {
    if (!currentStore || !user || !currentShift) return null;

    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

    // Create sale
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        store_id: currentStore.id,
        user_id: user.id,
        shift_id: currentShift.id,
        invoice_number: invoiceNumber,
        subtotal: saleData.subtotal,
        discount: saleData.discount,
        tax: saleData.tax,
        total: saleData.total,
        paid_amount: saleData.paid_amount,
        change_amount: saleData.change_amount,
        payment_method_id: saleData.payment_method_id,
        payment_reference: saleData.payment_reference,
        customer_name: saleData.customer_name,
        customer_phone: saleData.customer_phone,
        status: 'completed',
      })
      .select()
      .single();

    if (saleError) {
      console.error('Error creating sale:', saleError);
      toast.error('فشل في إتمام عملية البيع');
      return null;
    }

    // Create sale items
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleData.items.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        total: item.total,
      })));

    if (itemsError) {
      console.error('Error creating sale items:', itemsError);
    }

    // Update product stock - direct update
    for (const item of saleData.items) {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        await supabase
          .from('products')
          .update({ stock: Math.max(0, product.stock - item.quantity) })
          .eq('id', item.product_id);
      }
    }

    // Update shift totals
    const paymentMethod = paymentMethods.find(m => m.id === saleData.payment_method_id);
    const isCash = paymentMethod?.name === 'كاش' || paymentMethod?.name_en?.toLowerCase() === 'cash';
    const isCard = paymentMethod?.name === 'بنكك' || paymentMethod?.name_en?.toLowerCase() === 'bank';

    await supabase
      .from('shifts')
      .update({
        total_sales: currentShift.total_sales + saleData.total,
        cash_sales: currentShift.cash_sales + (isCash ? saleData.total : 0),
        card_sales: currentShift.card_sales + (isCard ? saleData.total : 0),
        other_sales: currentShift.other_sales + (!isCash && !isCard ? saleData.total : 0),
        transactions_count: currentShift.transactions_count + 1,
      })
      .eq('id', currentShift.id);

    // Update local shift state
    setCurrentShift(prev => prev ? {
      ...prev,
      total_sales: prev.total_sales + saleData.total,
      cash_sales: prev.cash_sales + (isCash ? saleData.total : 0),
      card_sales: prev.card_sales + (isCard ? saleData.total : 0),
      other_sales: prev.other_sales + (!isCash && !isCard ? saleData.total : 0),
      transactions_count: prev.transactions_count + 1,
    } : null);

    // Refresh products to get updated stock
    refreshProducts();

    return { invoice_number: invoiceNumber };
  };

  // Initial data load
  useEffect(() => {
    if (currentStore && user) {
      setLoading(true);
      Promise.all([
        refreshProducts(),
        refreshCategories(),
        refreshPaymentMethods(),
        refreshCurrentShift(),
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentStore, user, refreshProducts, refreshCategories, refreshPaymentMethods, refreshCurrentShift]);

  return (
    <AppContext.Provider
      value={{
        settings,
        currentShift,
        setCurrentShift,
        paymentMethods,
        products,
        categories,
        expenses,
        sidebarCollapsed,
        setSidebarCollapsed,
        isFullscreen,
        setIsFullscreen,
        loading,
        refreshProducts,
        refreshCategories,
        refreshPaymentMethods,
        refreshCurrentShift,
        openShift,
        closeShift,
        addExpense,
        createSale,
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
