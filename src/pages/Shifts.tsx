import { useState, useEffect } from 'react';
import { useApp, Shift } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
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
import { supabase } from '@/integrations/supabase/client';

export default function Shifts() {
  const { currentShift, setCurrentShift, openShift, closeShift, settings } = useApp();
  const { currentStore, user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch shifts history
  useEffect(() => {
    if (currentStore) {
      fetchShifts();
    }
  }, [currentStore]);

  const fetchShifts = async () => {
    if (!currentStore) return;

    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('store_id', currentStore.id)
      .eq('status', 'closed')
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching shifts:', error);
      return;
    }

    setShifts(data || []);
  };

  const handleOpenShift = async () => {
    const balance = parseFloat(openingBalance) || 0;
    setLoading(true);

    const result = await openShift(balance);

    if (result) {
      setShowOpenDialog(false);
      setOpeningBalance('');
    }

    setLoading(false);
  };

  const handleCloseShift = async () => {
    if (!currentShift) return;

    const closing = parseFloat(closingBalance) || 0;
    setLoading(true);

    await closeShift(closing);
    await fetchShifts();

    setShowCloseDialog(false);
    setClosingBalance('');
    setLoading(false);
  };

  const formatDuration = (startedAt: string, closedAt?: string | null) => {
    const startTime = new Date(startedAt);
    const endTime = closedAt ? new Date(closedAt) : new Date();
    const diff = endTime.getTime() - startTime.getTime();
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
                  {currentShift.opening_balance} {settings.currency}
                </p>
              </div>
              <div className="rounded-lg bg-card p-4 text-center border">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-success" />
                <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-xl font-bold text-success">
                  {currentShift.total_sales} {settings.currency}
                </p>
              </div>
              <div className="rounded-lg bg-card p-4 text-center border">
                <Receipt className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">عدد العمليات</p>
                <p className="text-xl font-bold">{currentShift.transactions_count}</p>
              </div>
              <div className="rounded-lg bg-card p-4 text-center border">
                <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">مدة الوردية</p>
                <p className="text-xl font-bold">
                  {formatDuration(currentShift.started_at)}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">مبيعات كاش</p>
                <p className="font-bold">
                  {currentShift.cash_sales} {settings.currency}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">مبيعات بطاقة</p>
                <p className="font-bold">
                  {currentShift.card_sales} {settings.currency}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">مبيعات أخرى</p>
                <p className="font-bold">
                  {currentShift.other_sales} {settings.currency}
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
              {shifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">لا توجد ورديات سابقة</p>
                  </TableCell>
                </TableRow>
              ) : (
                shifts.map((shift) => (
                  <TableRow
                    key={shift.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedShift(shift)}
                  >
                    <TableCell>
                      {format(new Date(shift.started_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                    </TableCell>
                    <TableCell>{formatDuration(shift.started_at, shift.closed_at)}</TableCell>
                    <TableCell>
                      {shift.opening_balance} {settings.currency}
                    </TableCell>
                    <TableCell className="text-success font-medium">
                      {shift.total_sales} {settings.currency}
                    </TableCell>
                    <TableCell>
                      {shift.closing_balance} {settings.currency}
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
                        {shift.difference !== null
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
                ))
              )}
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
            <Button onClick={handleOpenShift} disabled={loading}>
              <Play className="ml-2 h-4 w-4" />
              {loading ? 'جاري الفتح...' : 'فتح الوردية'}
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
                    {currentShift.opening_balance} {settings.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>إجمالي المبيعات:</span>
                  <span className="font-medium text-success">
                    {currentShift.total_sales} {settings.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>مبيعات الكاش:</span>
                  <span className="font-medium">
                    {currentShift.cash_sales} {settings.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>المصروفات:</span>
                  <span className="font-medium text-destructive">
                    {currentShift.total_expenses} {settings.currency}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm font-bold">
                  <span>الرصيد المتوقع:</span>
                  <span>
                    {currentShift.opening_balance +
                      currentShift.cash_sales -
                      currentShift.total_expenses}{' '}
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
            <Button variant="destructive" onClick={handleCloseShift} disabled={loading}>
              <Square className="ml-2 h-4 w-4" />
              {loading ? 'جاري الإغلاق...' : 'إغلاق الوردية'}
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
                  <p className="text-xs text-muted-foreground">تاريخ البداية</p>
                  <p className="font-medium">
                    {format(new Date(selectedShift.started_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">المدة</p>
                  <p className="font-medium">
                    {formatDuration(selectedShift.started_at, selectedShift.closed_at)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">رصيد البداية</p>
                  <p className="font-medium">
                    {selectedShift.opening_balance} {settings.currency}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">رصيد الإغلاق</p>
                  <p className="font-medium">
                    {selectedShift.closing_balance} {settings.currency}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-medium">تفاصيل المبيعات</h4>
                <div className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">مبيعات كاش</span>
                    <span className="font-medium">
                      {selectedShift.cash_sales} {settings.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">مبيعات بطاقة</span>
                    <span className="font-medium">
                      {selectedShift.card_sales} {settings.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">مبيعات أخرى</span>
                    <span className="font-medium">
                      {selectedShift.other_sales} {settings.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="font-medium">إجمالي المبيعات</span>
                    <span className="font-bold text-success">
                      {selectedShift.total_sales} {settings.currency}
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-medium">المصروفات والفارق</h4>
                <div className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المصروفات</span>
                    <span className="font-medium text-destructive">
                      {selectedShift.total_expenses} {settings.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الرصيد المتوقع</span>
                    <span className="font-medium">
                      {selectedShift.expected_balance} {settings.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
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
                      {selectedShift.difference !== null
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