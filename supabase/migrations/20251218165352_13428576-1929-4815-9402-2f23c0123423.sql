-- =============================================
-- DOKANI POS - Multi-tenant SaaS Database Schema
-- =============================================

-- Create app_role enum for RBAC
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'manager', 'cashier');

-- =============================================
-- CORE TABLES
-- =============================================

-- Subscription Plans for SaaS
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  max_users INTEGER NOT NULL DEFAULT 3,
  max_products INTEGER NOT NULL DEFAULT 100,
  max_stores INTEGER NOT NULL DEFAULT 1,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stores (Multi-tenant)
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  tax_number TEXT,
  currency TEXT NOT NULL DEFAULT 'SAR',
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan_id UUID REFERENCES public.subscription_plans(id),
  subscription_status TEXT NOT NULL DEFAULT 'trial', -- trial, active, cancelled, expired
  subscription_expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Store Members (links users to stores with roles)
CREATE TABLE public.store_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'cashier',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, user_id)
);

-- Permissions
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false,
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, user_id, module)
);

-- =============================================
-- INVENTORY TABLES
-- =============================================

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT,
  icon TEXT DEFAULT '📦',
  color TEXT DEFAULT '#3B82F6',
  parent_id UUID REFERENCES public.categories(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  name_en TEXT,
  barcode TEXT,
  sku TEXT,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  max_stock INTEGER,
  unit TEXT NOT NULL DEFAULT 'piece',
  is_weighted BOOLEAN NOT NULL DEFAULT false,
  weight_unit TEXT DEFAULT 'kg',
  image_url TEXT,
  production_date DATE,
  expiry_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Suppliers
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  tax_number TEXT,
  notes TEXT,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Purchases
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  purchase_number TEXT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, partial, paid
  status TEXT NOT NULL DEFAULT 'pending', -- pending, received, cancelled
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Purchase Items
CREATE TABLE public.purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SALES TABLES
-- =============================================

-- Payment Methods
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT,
  icon TEXT DEFAULT '💳',
  requires_reference BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shifts
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  opening_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_balance DECIMAL(10,2),
  expected_balance DECIMAL(10,2),
  difference DECIMAL(10,2),
  total_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_expenses DECIMAL(10,2) NOT NULL DEFAULT 0,
  cash_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
  card_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
  other_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
  transactions_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open', -- open, closed
  notes TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sales
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.shifts(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  invoice_number TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  change_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'completed', -- completed, cancelled, refunded
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sale Items
CREATE TABLE public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Expenses
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.shifts(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory Transactions (for stock tracking)
CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL, -- purchase, sale, adjustment, transfer
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SECURITY FUNCTIONS
-- =============================================

-- Check if user is member of a store
CREATE OR REPLACE FUNCTION public.is_store_member(_user_id UUID, _store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.store_members
    WHERE user_id = _user_id
      AND store_id = _store_id
      AND is_active = true
  ) OR EXISTS (
    SELECT 1 FROM public.stores
    WHERE id = _store_id
      AND owner_id = _user_id
  );
$$;

-- Check user role in store
CREATE OR REPLACE FUNCTION public.get_store_role(_user_id UUID, _store_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.store_members WHERE user_id = _user_id AND store_id = _store_id AND is_active = true),
    (SELECT 'owner'::app_role FROM public.stores WHERE id = _store_id AND owner_id = _user_id)
  );
$$;

-- Check if user has specific role or higher
CREATE OR REPLACE FUNCTION public.has_store_role(_user_id UUID, _store_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stores WHERE id = _store_id AND owner_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.store_members
    WHERE user_id = _user_id
      AND store_id = _store_id
      AND is_active = true
      AND (
        CASE _role
          WHEN 'cashier' THEN role IN ('owner', 'admin', 'manager', 'cashier')
          WHEN 'manager' THEN role IN ('owner', 'admin', 'manager')
          WHEN 'admin' THEN role IN ('owner', 'admin')
          WHEN 'owner' THEN role = 'owner'
        END
      )
  );
$$;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Handle new user - create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'مستخدم جديد'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_store_members_updated_at BEFORE UPDATE ON public.store_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Subscription Plans - Public read
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);

-- Stores
CREATE POLICY "Users can view their stores" ON public.stores FOR SELECT USING (public.is_store_member(auth.uid(), id));
CREATE POLICY "Users can create stores" ON public.stores FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update stores" ON public.stores FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete stores" ON public.stores FOR DELETE USING (owner_id = auth.uid());

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Store Members
CREATE POLICY "Members can view store members" ON public.store_members FOR SELECT USING (public.is_store_member(auth.uid(), store_id));
CREATE POLICY "Admins can manage members" ON public.store_members FOR INSERT WITH CHECK (public.has_store_role(auth.uid(), store_id, 'admin'));
CREATE POLICY "Admins can update members" ON public.store_members FOR UPDATE USING (public.has_store_role(auth.uid(), store_id, 'admin'));
CREATE POLICY "Admins can delete members" ON public.store_members FOR DELETE USING (public.has_store_role(auth.uid(), store_id, 'admin'));

-- Permissions
CREATE POLICY "Members can view permissions" ON public.permissions FOR SELECT USING (public.is_store_member(auth.uid(), store_id));
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (public.has_store_role(auth.uid(), store_id, 'admin'));

-- Categories
CREATE POLICY "Members can view categories" ON public.categories FOR SELECT USING (public.is_store_member(auth.uid(), store_id));
CREATE POLICY "Managers can create categories" ON public.categories FOR INSERT WITH CHECK (public.has_store_role(auth.uid(), store_id, 'manager'));
CREATE POLICY "Managers can update categories" ON public.categories FOR UPDATE USING (public.has_store_role(auth.uid(), store_id, 'manager'));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.has_store_role(auth.uid(), store_id, 'admin'));

-- Products
CREATE POLICY "Members can view products" ON public.products FOR SELECT USING (public.is_store_member(auth.uid(), store_id));
CREATE POLICY "Managers can create products" ON public.products FOR INSERT WITH CHECK (public.has_store_role(auth.uid(), store_id, 'manager'));
CREATE POLICY "Managers can update products" ON public.products FOR UPDATE USING (public.has_store_role(auth.uid(), store_id, 'manager'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.has_store_role(auth.uid(), store_id, 'admin'));

-- Suppliers
CREATE POLICY "Members can view suppliers" ON public.suppliers FOR SELECT USING (public.is_store_member(auth.uid(), store_id));
CREATE POLICY "Managers can manage suppliers" ON public.suppliers FOR ALL USING (public.has_store_role(auth.uid(), store_id, 'manager'));

-- Purchases
CREATE POLICY "Members can view purchases" ON public.purchases FOR SELECT USING (public.is_store_member(auth.uid(), store_id));
CREATE POLICY "Managers can create purchases" ON public.purchases FOR INSERT WITH CHECK (public.has_store_role(auth.uid(), store_id, 'manager'));
CREATE POLICY "Managers can update purchases" ON public.purchases FOR UPDATE USING (public.has_store_role(auth.uid(), store_id, 'manager'));

-- Purchase Items
CREATE POLICY "Members can view purchase items" ON public.purchase_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.purchases p WHERE p.id = purchase_id AND public.is_store_member(auth.uid(), p.store_id)));
CREATE POLICY "Managers can manage purchase items" ON public.purchase_items FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.purchases p WHERE p.id = purchase_id AND public.has_store_role(auth.uid(), p.store_id, 'manager')));

-- Payment Methods
CREATE POLICY "Members can view payment methods" ON public.payment_methods FOR SELECT USING (public.is_store_member(auth.uid(), store_id));
CREATE POLICY "Admins can manage payment methods" ON public.payment_methods FOR ALL USING (public.has_store_role(auth.uid(), store_id, 'admin'));

-- Shifts
CREATE POLICY "Members can view shifts" ON public.shifts FOR SELECT USING (public.is_store_member(auth.uid(), store_id));
CREATE POLICY "Cashiers can create shifts" ON public.shifts FOR INSERT WITH CHECK (public.is_store_member(auth.uid(), store_id) AND auth.uid() = user_id);
CREATE POLICY "Users can update own shifts" ON public.shifts FOR UPDATE USING (auth.uid() = user_id OR public.has_store_role(auth.uid(), store_id, 'manager'));

-- Sales
CREATE POLICY "Members can view sales" ON public.sales FOR SELECT USING (public.is_store_member(auth.uid(), store_id));
CREATE POLICY "Cashiers can create sales" ON public.sales FOR INSERT WITH CHECK (public.is_store_member(auth.uid(), store_id));
CREATE POLICY "Managers can update sales" ON public.sales FOR UPDATE USING (public.has_store_role(auth.uid(), store_id, 'manager'));

-- Sale Items
CREATE POLICY "Members can view sale items" ON public.sale_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND public.is_store_member(auth.uid(), s.store_id)));
CREATE POLICY "Cashiers can create sale items" ON public.sale_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND public.is_store_member(auth.uid(), s.store_id)));

-- Expenses
CREATE POLICY "Members can view expenses" ON public.expenses FOR SELECT USING (public.is_store_member(auth.uid(), store_id));
CREATE POLICY "Cashiers can create expenses" ON public.expenses FOR INSERT WITH CHECK (public.is_store_member(auth.uid(), store_id));
CREATE POLICY "Managers can update expenses" ON public.expenses FOR UPDATE USING (public.has_store_role(auth.uid(), store_id, 'manager'));
CREATE POLICY "Admins can delete expenses" ON public.expenses FOR DELETE USING (public.has_store_role(auth.uid(), store_id, 'admin'));

-- Inventory Transactions
CREATE POLICY "Members can view inventory transactions" ON public.inventory_transactions FOR SELECT USING (public.is_store_member(auth.uid(), store_id));
CREATE POLICY "Members can create inventory transactions" ON public.inventory_transactions FOR INSERT WITH CHECK (public.is_store_member(auth.uid(), store_id));

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_stores_owner ON public.stores(owner_id);
CREATE INDEX idx_store_members_user ON public.store_members(user_id);
CREATE INDEX idx_store_members_store ON public.store_members(store_id);
CREATE INDEX idx_products_store ON public.products(store_id);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_barcode ON public.products(store_id, barcode);
CREATE INDEX idx_categories_store ON public.categories(store_id);
CREATE INDEX idx_sales_store ON public.sales(store_id);
CREATE INDEX idx_sales_shift ON public.sales(shift_id);
CREATE INDEX idx_sales_date ON public.sales(store_id, created_at);
CREATE INDEX idx_shifts_store ON public.shifts(store_id);
CREATE INDEX idx_shifts_user ON public.shifts(user_id);
CREATE INDEX idx_expenses_store ON public.expenses(store_id);
CREATE INDEX idx_inventory_transactions_product ON public.inventory_transactions(product_id);

-- =============================================
-- DEFAULT DATA
-- =============================================

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, name_ar, description, price, max_users, max_products, max_stores, features) VALUES
('Free', 'مجاني', 'خطة مجانية للبدء', 0, 1, 50, 1, '["pos_basic", "reports_basic"]'),
('Starter', 'المبتدئ', 'للمتاجر الصغيرة', 99, 3, 500, 1, '["pos_full", "reports_full", "inventory"]'),
('Professional', 'المحترف', 'للمتاجر المتوسطة', 199, 10, 5000, 3, '["pos_full", "reports_full", "inventory", "suppliers", "multi_store"]'),
('Enterprise', 'المؤسسات', 'للشركات الكبيرة', 499, 50, 50000, 10, '["all_features", "api_access", "priority_support"]');