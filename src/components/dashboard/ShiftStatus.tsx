import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Square, DollarSign } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function ShiftStatus() {
  const { currentShift, setCurrentShift, currentUser } = useApp();
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');

  const handleOpenShift = () => {
    const balance = parseFloat(openingBalance) || 0;
    const newShift = {
      id: Date.now().toString(),
      userId: currentUser?.id || '1',
      userName: currentUser?.name || 'مستخدم',
      startTime: new Date(),
      openingBalance: balance,
      totalSales: 0,
      totalExpenses: 0,
      cashSales: 0,
      cardSales: 0,
      otherSales: 0,
      transactionsCount: 0,
      status: 'open' as const,
    };
    setCurrentShift(newShift);
    setShowOpenDialog(false);
    setOpeningBalance('');
    toast.success('تم فتح الوردية بنجاح');
  };

  const handleCloseShift = () => {
    if (!currentShift) return;
    
    const closing = parseFloat(closingBalance) || 0;
    const expected = currentShift.openingBalance + currentShift.cashSales - currentShift.totalExpenses;
    const difference = closing - expected;

    setCurrentShift({
      ...currentShift,
      endTime: new Date(),
      closingBalance: closing,
      expectedBalance: expected,
      difference,
      status: 'closed',
    });
    setShowCloseDialog(false);
    setClosingBalance('');
    toast.success('تم إغلاق الوردية بنجاح');
    setTimeout(() => setCurrentShift(null), 2000);
  };

  const formatDuration = (start: Date) => {
    const diff = new Date().getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} ساعة و ${minutes} دقيقة`;
  };

  return (
    <>
      <Card className="animate-slide-up">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            حالة الوردية
          </CardTitle>
          <Badge variant={currentShift?.status === 'open' ? 'default' : 'secondary'}>
            {currentShift?.status === 'open' ? 'مفتوحة' : 'مغلقة'}
          </Badge>
        </CardHeader>
        <CardContent>
          {currentShift?.status === 'open' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">رصيد البداية</p>
                  <p className="text-lg font-bold text-foreground">
                    {currentShift.openingBalance} ر.س
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 text-center">
                  <p className="text-xs text-muted-foreground">المبيعات</p>
                  <p className="text-lg font-bold text-primary">
                    {currentShift.totalSales} ر.س
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">مدة الوردية:</span>
                <span className="font-medium">{formatDuration(currentShift.startTime)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">عدد العمليات:</span>
                <span className="font-medium">{currentShift.transactionsCount}</span>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowCloseDialog(true)}
              >
                <Square className="ml-2 h-4 w-4" />
                إغلاق الوردية
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <Clock className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                لا توجد وردية مفتوحة حالياً
              </p>
              <Button onClick={() => setShowOpenDialog(true)} className="w-full">
                <Play className="ml-2 h-4 w-4" />
                فتح وردية جديدة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open Shift Dialog */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>فتح وردية جديدة</DialogTitle>
            <DialogDescription>
              أدخل رصيد بداية الصندوق لبدء الوردية
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="opening">رصيد البداية (ر.س)</Label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="opening"
                  type="number"
                  placeholder="0.00"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpenDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleOpenShift}>فتح الوردية</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Shift Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إغلاق الوردية</DialogTitle>
            <DialogDescription>
              أدخل رصيد إغلاق الصندوق لإنهاء الوردية
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentShift && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>رصيد البداية:</span>
                  <span className="font-medium">{currentShift.openingBalance} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>إجمالي المبيعات:</span>
                  <span className="font-medium text-success">{currentShift.totalSales} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>المصروفات:</span>
                  <span className="font-medium text-destructive">{currentShift.totalExpenses} ر.س</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm font-bold">
                  <span>الرصيد المتوقع:</span>
                  <span>
                    {currentShift.openingBalance + currentShift.cashSales - currentShift.totalExpenses} ر.س
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="closing">رصيد الإغلاق الفعلي (ر.س)</Label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="closing"
                  type="number"
                  placeholder="0.00"
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleCloseShift}>
              إغلاق الوردية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
