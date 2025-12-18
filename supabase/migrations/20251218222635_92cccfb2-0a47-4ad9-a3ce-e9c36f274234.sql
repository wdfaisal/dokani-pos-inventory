-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view their stores" ON public.stores;

-- Create a new policy that allows owners and members to view stores
CREATE POLICY "Users can view their stores" ON public.stores
FOR SELECT USING (
  owner_id = auth.uid() OR is_store_member(auth.uid(), id)
);