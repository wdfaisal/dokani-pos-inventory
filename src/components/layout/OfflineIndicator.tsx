import React from 'react';
import { useOffline } from '@/contexts/OfflineContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Wifi, WifiOff, RefreshCw, Trash2, Cloud, CloudOff } from 'lucide-react';

const OfflineIndicator = () => {
  const {
    isOnline,
    isOfflineModeEnabled,
    pendingSyncCount,
    offlineData,
    toggleOfflineMode,
    syncPendingData,
    clearOfflineData,
  } = useOffline();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative gap-2"
        >
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          {isOfflineModeEnabled && (
            <CloudOff className="h-4 w-4 text-yellow-500" />
          )}
          {pendingSyncCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {pendingSyncCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end" dir="rtl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">حالة الاتصال</h4>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'متصل' : 'غير متصل'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">وضع أوفلاين</span>
            <Button
              variant={isOfflineModeEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={toggleOfflineMode}
            >
              {isOfflineModeEnabled ? (
                <>
                  <CloudOff className="h-4 w-4 ml-1" />
                  مفعّل
                </>
              ) : (
                <>
                  <Cloud className="h-4 w-4 ml-1" />
                  معطّل
                </>
              )}
            </Button>
          </div>

          {isOfflineModeEnabled && (
            <>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المنتجات المحفوظة:</span>
                  <span className="font-medium">{offlineData.products.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>التصنيفات المحفوظة:</span>
                  <span className="font-medium">{offlineData.categories.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>المبيعات المعلقة:</span>
                  <span className="font-medium text-yellow-600">{pendingSyncCount}</span>
                </div>
                {offlineData.lastSync && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>آخر مزامنة:</span>
                    <span>{new Date(offlineData.lastSync).toLocaleString('ar-SA')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={syncPendingData}
                  disabled={!isOnline || pendingSyncCount === 0}
                >
                  <RefreshCw className="h-4 w-4 ml-1" />
                  مزامنة
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearOfflineData}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default OfflineIndicator;
