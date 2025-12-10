import { forwardRef } from 'react';
import { CartItem, StoreSettings, PaymentMethod } from '@/types';

interface ReceiptProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  settings: StoreSettings;
  paymentMethod: PaymentMethod | null;
  transactionId?: string;
  invoiceNumber: string;
}

export const ThermalReceipt = forwardRef<HTMLDivElement, ReceiptProps>(
  (
    {
      items,
      subtotal,
      discount,
      tax,
      total,
      settings,
      paymentMethod,
      transactionId,
      invoiceNumber,
    },
    ref
  ) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-SD');
    const timeStr = now.toLocaleTimeString('ar-SD', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div
        ref={ref}
        className="bg-white text-black p-4 font-mono text-sm"
        style={{
          width: '80mm',
          minHeight: 'auto',
          direction: 'rtl',
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold mb-1">Dokani - دُكاني</h1>
          <h2 className="text-lg font-semibold">{settings.name}</h2>
          <p className="text-xs">{settings.address}</p>
          <p className="text-xs">{settings.phone}</p>
          {settings.receiptHeader && (
            <p className="text-xs mt-2 italic">{settings.receiptHeader}</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Invoice Info */}
        <div className="flex justify-between text-xs mb-2">
          <span>رقم الفاتورة: {invoiceNumber}</span>
        </div>
        <div className="flex justify-between text-xs mb-2">
          <span>{dateStr}</span>
          <span>{timeStr}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Items Header */}
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="flex-1">المنتج</span>
          <span className="w-12 text-center">الكمية</span>
          <span className="w-16 text-left">السعر</span>
          <span className="w-20 text-left">الإجمالي</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-1" />

        {/* Items */}
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-xs py-1">
            <span className="flex-1 truncate">{item.name}</span>
            <span className="w-12 text-center">{item.quantity}</span>
            <span className="w-16 text-left">{item.price.toFixed(2)}</span>
            <span className="w-20 text-left">{item.total.toFixed(2)}</span>
          </div>
        ))}

        {/* Divider */}
        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Totals */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>المجموع الفرعي:</span>
            <span>
              {subtotal.toFixed(2)} {settings.currency}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span>الخصم:</span>
              <span>
                -{discount.toFixed(2)} {settings.currency}
              </span>
            </div>
          )}
          {settings.enableTax && tax > 0 && (
            <div className="flex justify-between">
              <span>الضريبة ({settings.taxRate}%):</span>
              <span>
                {tax.toFixed(2)} {settings.currency}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-double border-gray-400 my-2" />

        {/* Grand Total */}
        <div className="flex justify-between font-bold text-base mb-2">
          <span>الإجمالي:</span>
          <span>
            {total.toFixed(2)} {settings.currency}
          </span>
        </div>

        {/* Payment Info */}
        {paymentMethod && (
          <div className="text-xs space-y-1 mb-2">
            <div className="flex justify-between">
              <span>طريقة الدفع:</span>
              <span>{paymentMethod.name}</span>
            </div>
            {transactionId && (
              <div className="flex justify-between">
                <span>رقم العملية:</span>
                <span>{transactionId}</span>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Footer */}
        <div className="text-center text-xs">
          {settings.receiptFooter && (
            <p className="mb-2">{settings.receiptFooter}</p>
          )}
          <p className="font-semibold">شكراً لتسوقكم معنا</p>
          <p className="text-[10px] mt-2 text-gray-500">
            Powered by Dokani POS System
          </p>
        </div>
      </div>
    );
  }
);

ThermalReceipt.displayName = 'ThermalReceipt';
