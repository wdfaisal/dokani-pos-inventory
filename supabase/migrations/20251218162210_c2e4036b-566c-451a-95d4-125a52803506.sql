-- Drop and recreate the handle_new_user function to enforce 'cashier' role
-- This ensures server-side security regardless of client-supplied metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with user metadata
  INSERT INTO public.profiles (user_id, username, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', 'user_' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data ->> 'full_name', 'مستخدم جديد'),
    new.email
  );

  -- SECURITY: Always assign 'cashier' role - ignore any client-supplied role
  -- Admins must promote users through the user management interface
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'cashier');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;