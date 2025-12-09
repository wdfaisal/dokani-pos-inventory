import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Shift } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Clock,
  Play,
  Square,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Sample shifts history
const sampleShifts: Shift[] = [
  {
    id: '1',
    userId: '1',
    userName: 'أحمد محمد',
    startTime: new Date(Date.now() - 86400000 * 2),
    endTime: new Date(Date.now() - 86400000 * 2 + 28800000),
    openingBalance: 500,
    closingBalance: 1850,
    expectedBalance: 1820,
    difference: 30,
    totalSales: 1420,
    totalExpenses: 100,
    cashSales: 1020,
    cardSales: 300,
    otherSales: 100,
    transactionsCount: 45,
    status: 'closed',
  },
  {
    id: '2',
    userId: '1',
    userName: 'أحمد محمد',
    startTime: new Date(Date.now() - 86400000),
    endTime: new Date(Date.now() - 86400000 + 32400000),
    openingBalance: 600,
    closingBalance: 2150,
    expectedBalance: 2180,
    difference: -30,
    totalSales: 1680,
    totalExpenses: 100,
    cashSales: 1280,
    cardSales: 280,
    otherSales: 120,
    transactionsCount: 52,
    status: 'closed',
  },
];

export default function Shifts() {
  const { currentShift, setCurrentShift, currentUser, settings } = useApp();
  const [shifts] = useState<Shift[]>(sampleShifts);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const handleOpenShift = () => {
    const balance = parseFloat(openingBalance) || 0;
    const newShift: Shift = {
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
      status: 'open',
    };
    setCurrentShift(newShift);
    setShowOpenDialog(false);
    setOpeningBalance('');
    toast.success('تم فتح الوردية بنجاح');
  };

  const handleCloseShift = () => {
    if (!currentShift) return;

    const closing = parseFloat(closingBalance) || 0;
    const expected =
      currentShift.openingBalance +
      currentShift.cashSales -
      currentShift.totalExpenses;
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

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diff = endTime.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} ساعة و ${minutes} دقيقة`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الورديات</h1>
          <p className="text-sm text-muted-foreground">
            إدارة ورديات العمل وحركة الصندوق
          </p>
        </div>
        {!currentShift ? (
          <Button onClick={() => setShowOpenDialog(true)}>
            <Play className="ml-2 h-4 w-4" />
            فتح وردية جديدة
          </Button>
        ) : (
          <Button variant="destructive" onClick={() => setShowCloseDialog(true)}>
            <Square className="ml-2 h-4 w-4" />
            إغلاق الوردية
          </Button>
        )}
      </div>

      {/* Current Shift */}
      {currentShift && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                الوردية الحالية
              </CardTitle>
              <Badge>مفتوحة</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-card p-4 text-center border">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">رصيد البداية</p>
                <p className="text-xl font-bold">
                  {currentShift.openingBalance} {settings.currency}
                </p>
              </div>
              <div className="rounded-lg bg-card p-4 text-center border">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-success" />
                <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-xl font-bold text-success">
                  {currentShift.totalSales} {settings.currency}
                </p>
              </div>
              <div className="rounded-lg bg-card p-4 text-center border">
                <Receipt className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">عدد العمليات</p>
                <p className="text-xl font-bold">{currentShift.transactionsCount}</p>
              </div>
              <div className="rounded-lg bg-card p-4 text-center border">
                <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">مدة الوردية</p>
                <p className="text-xl font-bold">
                  {formatDuration(currentShift.startTime)}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">مبيعات كاش</p>
                <p className="font-bold">
                  {currentShift.cashSales} {settings.currency}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">مبيعات بطاقة</p>
                <p className="font-bold">
                  {currentShift.cardSales} {settings.currency}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">مبيعات أخرى</p>
                <p className="font-bold">
                  {currentShift.otherSales} {settings.currency}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shifts History */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الورديات السابقة</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>تاريخ البداية</TableHead>
                <TableHead>المدة</TableHead>
                <TableHead>رصيد البداية</TableHead>
                <TableHead>المبيعات</TableHead>
                <TableHead>رصيد الإغلاق</TableHead>
                <TableHead>الفارق</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow
                  key={shift.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedShift(shift)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{shift.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(shift.startTime, 'dd/MM/yyyy HH:mm', { locale: ar })}
                  </TableCell>
                  <TableCell>{formatDuration(shift.startTime, shift.endTime)}</TableCell>
                  <TableCell>
                    {shift.openingBalance} {settings.currency}
                  </TableCell>
                  <TableCell className="text-success font-medium">
                    {shift.totalSales} {settings.currency}
                  </TableCell>
                  <TableCell>
                    {shift.closingBalance} {settings.currency}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        shift.difference && shift.difference > 0
                          ? 'text-success'
                          : shift.difference && shift.difference < 0
                          ? 'text-destructive'
                          : ''
                      }
                    >
                      {shift.difference !== undefined
                        ? `${shift.difference > 0 ? '+' : ''}${shift.difference} ${settings.currency}`
                        : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={shift.status === 'open' ? 'default' : 'secondary'}>
                      {shift.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              <Label htmlFor="opening">رصيد البداية ({settings.currency})</Label>
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
            <Button onClick={handleOpenShift}>
              <Play className="ml-2 h-4 w-4" />
              فتح الوردية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Shift Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إغلاق الوردية</DialogTitle>
            <DialogDescription>أدخل رصيد إغلاق الصندوق لإنهاء الوردية</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentShift && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>رصيد البداية:</span>
                  <span className="font-medium">
                    {currentShift.openingBalance} {settings.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>إجمالي المبيعات:</span>
                  <span className="font-medium text-success">
                    {currentShift.totalSales} {settings.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>مبيعات الكاش:</span>
                  <span className="font-medium">
                    {currentShift.cashSales} {settings.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>المصروفات:</span>
                  <span className="font-medium text-destructive">
                    {currentShift.totalExpenses} {settings.currency}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm font-bold">
                  <span>الرصيد المتوقع:</span>
                  <span>
                    {currentShift.openingBalance +
                      currentShift.cashSales -
                      currentShift.totalExpenses}{' '}
                    {settings.currency}
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="closing">رصيد الإغلاق الفعلي ({settings.currency})</Label>
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
              <Square className="ml-2 h-4 w-4" />
              إغلاق الوردية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Details Dialog */}
      <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل الوردية</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">الموظف</p>
                  <p className="font-medium">{selectedShift.userName}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">المدة</p>
                  <p className="font-medium">
                    {formatDuration(selectedShift.startTime, selectedShift.endTime)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">رصيد البداية</p>
                  <p className="font-medium">
                    {selectedShift.openingBalance} {settings.currency}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">رصيد الإغلاق</p>
                  <p className="font-medium">
                    {selectedShift.closingBalance} {settings.currency}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-medium">تفاصيل المبيعات</h4>
                <div className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">مبيعات كاش</span>
                    <span className="font-medium">
                      {selectedShift.cashSales} {settings.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">مبيعات بطاقة</span>
                    <span className="font-medium">
                      {selectedShift.cardSales} {settings.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">مبيعات أخرى</span>
                    <span className="font-medium">
                      {selectedShift.otherSales} {settings.currency}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium">إجمالي المبيعات</span>
                    <span className="font-bold text-success">
                      {selectedShift.totalSales} {settings.currency}
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-medium">حساب الصندوق</h4>
                <div className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الرصيد المتوقع</span>
                    <span className="font-medium">
                      {selectedShift.expectedBalance} {settings.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الرصيد الفعلي</span>
                    <span className="font-medium">
                      {selectedShift.closingBalance} {settings.currency}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium">الفارق</span>
                    <span
                      className={`font-bold ${
                        selectedShift.difference && selectedShift.difference > 0
                          ? 'text-success'
                          : selectedShift.difference && selectedShift.difference < 0
                          ? 'text-destructive'
                          : ''
                      }`}
                    >
                      {selectedShift.difference !== undefined
                        ? `${selectedShift.difference > 0 ? '+' : ''}${selectedShift.difference} ${settings.currency}`
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
