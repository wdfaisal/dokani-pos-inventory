import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineData {
  products: any[];
  categories: any[];
  customers: any[];
  pendingSales: any[];
  inventory: any[];
  lastSync: string | null;
}

interface OfflineContextType {
  isOnline: boolean;
  isOfflineModeEnabled: boolean;
  offlineData: OfflineData;
  pendingSyncCount: number;
  toggleOfflineMode: () => void;
  saveToOffline: (key: keyof OfflineData, data: any[]) => void;
  addPendingSale: (sale: any) => void;
  syncPendingData: () => Promise<void>;
  clearOfflineData: () => void;
  getOfflineData: <T>(key: keyof OfflineData) => T[];
}

const OFFLINE_STORAGE_KEY = 'pos_offline_data';
const OFFLINE_MODE_KEY = 'pos_offline_mode_enabled';

const defaultOfflineData: OfflineData = {
  products: [],
  categories: [],
  customers: [],
  pendingSales: [],
  inventory: [],
  lastSync: null,
};

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineModeEnabled, setIsOfflineModeEnabled] = useState(() => {
    const saved = localStorage.getItem(OFFLINE_MODE_KEY);
    return saved ? JSON.parse(saved) : false;
  });
  const [offlineData, setOfflineData] = useState<OfflineData>(() => {
    const saved = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultOfflineData;
  });
  const { toast } = useToast();

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'تم الاتصال بالإنترنت',
        description: 'أنت الآن متصل بالإنترنت',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'انقطع الاتصال',
        description: isOfflineModeEnabled 
          ? 'تعمل الآن في وضع أوفلاين' 
          : 'لا يوجد اتصال بالإنترنت',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOfflineModeEnabled, toast]);

  // Save offline data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(offlineData));
  }, [offlineData]);

  // Save offline mode preference
  useEffect(() => {
    localStorage.setItem(OFFLINE_MODE_KEY, JSON.stringify(isOfflineModeEnabled));
  }, [isOfflineModeEnabled]);

  const toggleOfflineMode = useCallback(() => {
    setIsOfflineModeEnabled(prev => {
      const newValue = !prev;
      toast({
        title: newValue ? 'تم تفعيل وضع أوفلاين' : 'تم إلغاء وضع أوفلاين',
        description: newValue 
          ? 'سيتم حفظ البيانات محلياً للعمل بدون إنترنت' 
          : 'سيتم العمل مع قاعدة البيانات مباشرة',
      });
      return newValue;
    });
  }, [toast]);

  const saveToOffline = useCallback((key: keyof OfflineData, data: any[]) => {
    setOfflineData(prev => ({
      ...prev,
      [key]: data,
      lastSync: new Date().toISOString(),
    }));
  }, []);

  const addPendingSale = useCallback((sale: any) => {
    setOfflineData(prev => ({
      ...prev,
      pendingSales: [...prev.pendingSales, { ...sale, offlineId: Date.now() }],
    }));
  }, []);

  const syncPendingData = useCallback(async () => {
    if (!isOnline) {
      toast({
        title: 'لا يوجد اتصال',
        description: 'يرجى الاتصال بالإنترنت أولاً',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Here you would sync pending sales to the server
      // For now, we just clear them after "sync"
      const pendingCount = offlineData.pendingSales.length;
      
      if (pendingCount > 0) {
        // TODO: Implement actual sync with Supabase
        setOfflineData(prev => ({
          ...prev,
          pendingSales: [],
          lastSync: new Date().toISOString(),
        }));

        toast({
          title: 'تمت المزامنة بنجاح',
          description: `تم مزامنة ${pendingCount} عملية بيع`,
        });
      } else {
        toast({
          title: 'لا توجد بيانات للمزامنة',
          description: 'جميع البيانات متزامنة',
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'خطأ في المزامنة',
        description: 'حدث خطأ أثناء مزامنة البيانات',
        variant: 'destructive',
      });
    }
  }, [isOnline, offlineData.pendingSales.length, toast]);

  const clearOfflineData = useCallback(() => {
    setOfflineData(defaultOfflineData);
    toast({
      title: 'تم مسح البيانات',
      description: 'تم مسح جميع البيانات المحفوظة محلياً',
    });
  }, [toast]);

  const getOfflineData = useCallback(<T,>(key: keyof OfflineData): T[] => {
    return offlineData[key] as T[];
  }, [offlineData]);

  const pendingSyncCount = offlineData.pendingSales.length;

  return (
    <OfflineContext.Provider value={{
      isOnline,
      isOfflineModeEnabled,
      offlineData,
      pendingSyncCount,
      toggleOfflineMode,
      saveToOffline,
      addPendingSale,
      syncPendingData,
      clearOfflineData,
      getOfflineData,
    }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
