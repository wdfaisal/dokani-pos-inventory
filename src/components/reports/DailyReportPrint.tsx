import { forwardRef } from 'react';
import { StoreSettings, Shift } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DailyReportData {
  date: Date;
  totalSales: number;
  cashSales: number;
  bankSales: number;
  fawrySales: number;
  totalExpenses: number;
  netRevenue: number;
  ordersCount: number;
  productsCount: number;
  avgOrderValue: number;
  shift?: Shift;
}

interface DailyReportPrintProps {
  data: DailyReportData;
  settings: StoreSettings;
  type: 'thermal' | 'a4';
}

export const DailyReportPrint = forwardRef<HTMLDivElement, DailyReportPrintProps>(
  ({ data, settings, type }, ref) => {
    const isThermal = type === 'thermal';

    if (isThermal) {
      return (
        <div
          ref={ref}
          dir="rtl"
          className="bg-white text-black p-2 font-mono"
          style={{
            width: '80mm',
            fontSize: '12px',
            lineHeight: '1.4',
          }}
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-black pb-2 mb-2">
            <div className="font-bold text-lg">{settings.name}</div>
            <div className="text-xs">{settings.address}</div>
            <div className="text-xs">هاتف: {settings.phone}</div>
          </div>

          {/* Title */}
          <div className="text-center font-bold mb-2 border-b border-dashed border-black pb-2">
            تقرير المبيعات اليومي
            <div className="text-sm font-normal">
              {format(data.date, 'EEEE dd MMMM yyyy', { locale: ar })}
            </div>
          </div>

          {/* Sales Summary */}
          <div className="mb-2 pb-2 border-b border-dashed border-black">
            <div className="font-bold mb-1">ملخص المبيعات</div>
            <div className="flex justify-between">
              <span>إجمالي المبيعات:</span>
              <span className="font-bold">{data.totalSales.toLocaleString()} {settings.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>عدد الطلبات:</span>
              <span>{data.ordersCount}</span>
            </div>
            <div className="flex justify-between">
              <span>المنتجات المباعة:</span>
              <span>{data.productsCount}</span>
            </div>
            <div className="flex justify-between">
              <span>متوسط قيمة الطلب:</span>
              <span>{data.avgOrderValue.toFixed(2)} {settings.currency}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-2 pb-2 border-b border-dashed border-black">
            <div className="font-bold mb-1">طرق الدفع</div>
            <div className="flex justify-between">
              <span>كاش:</span>
              <span>{data.cashSales.toLocaleString()} {settings.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>بنكك:</span>
              <span>{data.bankSales.toLocaleString()} {settings.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>فوري:</span>
              <span>{data.fawrySales.toLocaleString()} {settings.currency}</span>
            </div>
          </div>

          {/* Expenses */}
          <div className="mb-2 pb-2 border-b border-dashed border-black">
            <div className="font-bold mb-1">المصروفات</div>
            <div className="flex justify-between">
              <span>إجمالي المصروفات:</span>
              <span className="text-red-600">{data.totalExpenses.toLocaleString()} {settings.currency}</span>
            </div>
          </div>

          {/* Net Revenue */}
          <div className="mb-2 pb-2 border-b border-dashed border-black">
            <div className="flex justify-between font-bold text-lg">
              <span>صافي الإيراد:</span>
              <span>{data.netRevenue.toLocaleString()} {settings.currency}</span>
            </div>
          </div>

          {/* Shift Info */}
          {data.shift && (
            <div className="mb-2 pb-2 border-b border-dashed border-black">
              <div className="font-bold mb-1">معلومات الوردية</div>
              <div className="flex justify-between">
                <span>بداية الوردية:</span>
                <span>{format(new Date(data.shift.started_at), 'HH:mm', { locale: ar })}</span>
              </div>
              <div className="flex justify-between">
                <span>رصيد الافتتاح:</span>
                <span>{data.shift.opening_balance} {settings.currency}</span>
              </div>
              {data.shift.closing_balance && (
                <div className="flex justify-between">
                  <span>رصيد الإغلاق:</span>
                  <span>{data.shift.closing_balance} {settings.currency}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs mt-2">
            <div>تم طباعة التقرير في</div>
            <div>{format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ar })}</div>
          </div>
        </div>
      );
    }

    // A4 Format
    return (
      <div
        ref={ref}
        dir="rtl"
        className="bg-white text-black p-8"
        style={{
          width: '210mm',
          minHeight: '297mm',
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold">{settings.name}</h1>
          <p className="text-sm text-gray-600">{settings.address}</p>
          <p className="text-sm text-gray-600">هاتف: {settings.phone} | البريد: {settings.email}</p>
          {settings.taxNumber && (
            <p className="text-sm text-gray-600">الرقم الضريبي: {settings.taxNumber}</p>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold">تقرير المبيعات اليومي</h2>
          <p className="text-lg">{format(data.date, 'EEEE dd MMMM yyyy', { locale: ar })}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.totalSales.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">إجمالي المبيعات ({settings.currency})</div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.ordersCount}</div>
            <div className="text-sm text-gray-600">عدد الطلبات</div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{data.productsCount}</div>
            <div className="text-sm text-gray-600">المنتجات المباعة</div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {data.avgOrderValue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">متوسط الطلب ({settings.currency})</div>
          </div>
        </div>

        {/* Two Columns */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Payment Methods */}
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">طرق الدفع</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2">كاش</td>
                  <td className="py-2 text-left font-bold">
                    {data.cashSales.toLocaleString()} {settings.currency}
                  </td>
                  <td className="py-2 text-left text-gray-500">
                    ({((data.cashSales / data.totalSales) * 100 || 0).toFixed(1)}%)
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">بنكك</td>
                  <td className="py-2 text-left font-bold">
                    {data.bankSales.toLocaleString()} {settings.currency}
                  </td>
                  <td className="py-2 text-left text-gray-500">
                    ({((data.bankSales / data.totalSales) * 100 || 0).toFixed(1)}%)
                  </td>
                </tr>
                <tr>
                  <td className="py-2">فوري</td>
                  <td className="py-2 text-left font-bold">
                    {data.fawrySales.toLocaleString()} {settings.currency}
                  </td>
                  <td className="py-2 text-left text-gray-500">
                    ({((data.fawrySales / data.totalSales) * 100 || 0).toFixed(1)}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">الملخص المالي</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2">إجمالي المبيعات</td>
                  <td className="py-2 text-left font-bold text-green-600">
                    {data.totalSales.toLocaleString()} {settings.currency}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">المصروفات</td>
                  <td className="py-2 text-left font-bold text-red-600">
                    ({data.totalExpenses.toLocaleString()}) {settings.currency}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 font-bold text-lg">صافي الإيراد</td>
                  <td className="py-3 text-left font-bold text-lg text-blue-600">
                    {data.netRevenue.toLocaleString()} {settings.currency}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Shift Info */}
        {data.shift && (
          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">معلومات الوردية</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-gray-600 text-sm">بداية الوردية</div>
                <div className="font-bold">
                  {format(new Date(data.shift.started_at), 'HH:mm', { locale: ar })}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">رصيد الافتتاح</div>
                <div className="font-bold">
                  {data.shift.opening_balance} {settings.currency}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">عدد المعاملات</div>
                <div className="font-bold">{data.shift.transactions_count}</div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">إجمالي المبيعات</div>
                <div className="font-bold">{data.shift.total_sales} {settings.currency}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
          <p>تم إنشاء التقرير في {format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ar })}</p>
        </div>
      </div>
    );
  }
);

DailyReportPrint.displayName = 'DailyReportPrint';