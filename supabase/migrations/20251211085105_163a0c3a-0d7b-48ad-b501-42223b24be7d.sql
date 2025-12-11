-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'accountant', 'supervisor', 'cashier');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create permissions table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  UNIQUE (role, module)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for permissions (everyone can read)
CREATE POLICY "Anyone can view permissions"
ON public.permissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage permissions"
ON public.permissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email
  );
  
  -- Assign default role (cashier) or specified role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'cashier')
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profile updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default permissions for each role
INSERT INTO public.permissions (role, module, can_view, can_create, can_edit, can_delete) VALUES
-- Admin has full access
('admin', 'dashboard', true, true, true, true),
('admin', 'pos', true, true, true, true),
('admin', 'products', true, true, true, true),
('admin', 'categories', true, true, true, true),
('admin', 'inventory', true, true, true, true),
('admin', 'suppliers', true, true, true, true),
('admin', 'purchases', true, true, true, true),
('admin', 'sales', true, true, true, true),
('admin', 'expenses', true, true, true, true),
('admin', 'reports', true, true, true, true),
('admin', 'shifts', true, true, true, true),
('admin', 'users', true, true, true, true),
('admin', 'settings', true, true, true, true),

-- Accountant
('accountant', 'dashboard', true, false, false, false),
('accountant', 'pos', false, false, false, false),
('accountant', 'products', true, false, false, false),
('accountant', 'categories', true, false, false, false),
('accountant', 'inventory', true, true, true, false),
('accountant', 'suppliers', true, true, true, false),
('accountant', 'purchases', true, true, true, false),
('accountant', 'sales', true, false, false, false),
('accountant', 'expenses', true, true, true, true),
('accountant', 'reports', true, true, false, false),
('accountant', 'shifts', true, false, false, false),
('accountant', 'users', false, false, false, false),
('accountant', 'settings', false, false, false, false),

-- Supervisor
('supervisor', 'dashboard', true, false, false, false),
('supervisor', 'pos', true, true, true, true),
('supervisor', 'products', true, true, true, false),
('supervisor', 'categories', true, true, true, false),
('supervisor', 'inventory', true, true, true, false),
('supervisor', 'suppliers', true, false, false, false),
('supervisor', 'purchases', true, true, false, false),
('supervisor', 'sales', true, true, true, true),
('supervisor', 'expenses', true, true, false, false),
('supervisor', 'reports', true, false, false, false),
('supervisor', 'shifts', true, true, true, false),
('supervisor', 'users', false, false, false, false),
('supervisor', 'settings', false, false, false, false),

-- Cashier
('cashier', 'dashboard', true, false, false, false),
('cashier', 'pos', true, true, false, false),
('cashier', 'products', true, false, false, false),
('cashier', 'categories', true, false, false, false),
('cashier', 'inventory', false, false, false, false),
('cashier', 'suppliers', false, false, false, false),
('cashier', 'purchases', false, false, false, false),
('cashier', 'sales', true, true, false, false),
('cashier', 'expenses', true, true, false, false),
('cashier', 'reports', false, false, false, false),
('cashier', 'shifts', true, true, false, false),
('cashier', 'users', false, false, false, false),
('cashier', 'settings', false, false, false, false);