import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'owner' | 'admin' | 'manager' | 'cashier';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  name_en: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  tax_number: string | null;
  currency: string;
  tax_rate: number;
  owner_id: string;
  subscription_status: string;
  settings: Record<string, unknown>;
  is_active: boolean;
}

export interface Permission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  currentStore: Store | null;
  stores: Store[];
  role: AppRole | null;
  permissions: Permission[];
  loading: boolean;
  signIn: (emailOrUsername: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata: { username: string; full_name: string; store_name: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  switchStore: (storeId: string) => Promise<void>;
  hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'delete') => boolean;
  isOwner: () => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default permissions based on role
const getDefaultPermissions = (role: AppRole): Permission[] => {
  const modules = ['dashboard', 'pos', 'products', 'categories', 'inventory', 'sales', 'purchases', 'suppliers', 'expenses', 'shifts', 'reports', 'users', 'settings'];
  
  return modules.map(module => {
    switch (role) {
      case 'owner':
      case 'admin':
        return { module, can_view: true, can_create: true, can_edit: true, can_delete: true };
      case 'manager':
        return { 
          module, 
          can_view: true, 
          can_create: !['users', 'settings'].includes(module), 
          can_edit: !['users', 'settings'].includes(module), 
          can_delete: ['products', 'categories', 'expenses'].includes(module) 
        };
      case 'cashier':
        return { 
          module, 
          can_view: ['dashboard', 'pos', 'products', 'shifts'].includes(module), 
          can_create: ['pos', 'shifts', 'expenses'].includes(module), 
          can_edit: false, 
          can_delete: false 
        };
      default:
        return { module, can_view: false, can_create: false, can_edit: false, can_delete: false };
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [role, setRole] = useState<AppRole | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setProfile(profileData as UserProfile);
      }

      // Fetch stores (owned + member of)
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true);

      if (storesError) {
        console.error('Error fetching stores:', storesError);
      } else if (storesData && storesData.length > 0) {
        setStores(storesData as Store[]);
        
        // Get saved store from localStorage or use first store
        const savedStoreId = localStorage.getItem('currentStoreId');
        const savedStore = storesData.find(s => s.id === savedStoreId);
        const storeToUse = savedStore || storesData[0];
        
        setCurrentStore(storeToUse as Store);
        localStorage.setItem('currentStoreId', storeToUse.id);

        // Determine role for this store
        if (storeToUse.owner_id === userId) {
          setRole('owner');
          setPermissions(getDefaultPermissions('owner'));
        } else {
          // Fetch role from store_members
          const { data: memberData } = await supabase
            .from('store_members')
            .select('role')
            .eq('store_id', storeToUse.id)
            .eq('user_id', userId)
            .eq('is_active', true)
            .maybeSingle();

          if (memberData) {
            const memberRole = memberData.role as AppRole;
            setRole(memberRole);
            setPermissions(getDefaultPermissions(memberRole));
          } else {
            setRole('cashier');
            setPermissions(getDefaultPermissions('cashier'));
          }
        }

        // Fetch custom permissions if any
        const { data: customPerms } = await supabase
          .from('permissions')
          .select('module, can_view, can_create, can_edit, can_delete')
          .eq('store_id', storeToUse.id)
          .eq('user_id', userId);

        if (customPerms && customPerms.length > 0) {
          setPermissions(prev => {
            const updated = [...prev];
            customPerms.forEach(cp => {
              const idx = updated.findIndex(p => p.module === cp.module);
              if (idx >= 0) {
                updated[idx] = cp as Permission;
              }
            });
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer data fetching to avoid deadlock
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setCurrentStore(null);
          setStores([]);
          setRole(null);
          setPermissions([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      let email = emailOrUsername;
      
      // Check if it's a username (no @ symbol)
      if (!emailOrUsername.includes('@')) {
        // Look up email by username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', emailOrUsername)
          .maybeSingle();

        if (profileError || !profileData || !profileData.email) {
          return { error: new Error('اسم المستخدم غير موجود') };
        }
        email = profileData.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { username: string; full_name: string; store_name: string }
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: metadata.username,
            full_name: metadata.full_name,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Create store for new user (after profile is created by trigger)
      if (signUpData.user) {
        // Wait a bit for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { error: storeError } = await supabase
          .from('stores')
          .insert({
            name: metadata.store_name,
            owner_id: signUpData.user.id,
            currency: 'SAR',
            tax_rate: 15,
          });

        if (storeError) {
          console.error('Error creating store:', storeError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('currentStoreId');
    setUser(null);
    setSession(null);
    setProfile(null);
    setCurrentStore(null);
    setStores([]);
    setRole(null);
    setPermissions([]);
  };

  const switchStore = async (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (!store || !user) return;

    setCurrentStore(store);
    localStorage.setItem('currentStoreId', storeId);

    // Update role for new store
    if (store.owner_id === user.id) {
      setRole('owner');
      setPermissions(getDefaultPermissions('owner'));
    } else {
      const { data: memberData } = await supabase
        .from('store_members')
        .select('role')
        .eq('store_id', storeId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (memberData) {
        const memberRole = memberData.role as AppRole;
        setRole(memberRole);
        setPermissions(getDefaultPermissions(memberRole));
      }
    }
  };

  const hasPermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    // Owners and admins have all permissions
    if (role === 'owner' || role === 'admin') return true;

    const permission = permissions.find(p => p.module === module);
    if (!permission) return false;

    switch (action) {
      case 'view':
        return permission.can_view;
      case 'create':
        return permission.can_create;
      case 'edit':
        return permission.can_edit;
      case 'delete':
        return permission.can_delete;
      default:
        return false;
    }
  };

  const isOwner = () => role === 'owner';
  const isAdmin = () => role === 'owner' || role === 'admin';
  const isManager = () => role === 'owner' || role === 'admin' || role === 'manager';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      currentStore,
      stores,
      role,
      permissions,
      loading,
      signIn,
      signUp,
      signOut,
      switchStore,
      hasPermission,
      isOwner,
      isAdmin,
      isManager,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
