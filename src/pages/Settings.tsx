import { useState } from 'react';
import { useApp, PaymentMethod } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Store,
  Receipt,
  CreditCard,
  Shield,
  Globe,
  Save,
  Plus,
  Trash2,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const { settings, paymentMethods, refreshPaymentMethods } = useApp();
  const { currentStore } = useAuth();
  const [localSettings, setLocalSettings] = useState(settings);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    name: '',
    name_en: '',
    icon: 'CreditCard',
    requires_reference: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    if (!currentStore) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          name: localSettings.name,
          name_en: localSettings.nameEn,
          address: localSettings.address,
          phone: localSettings.phone,
          email: localSettings.email,
          tax_number: localSettings.taxNumber,
          currency: localSettings.currency,
          tax_rate: localSettings.taxRate,
        })
        .eq('id', currentStore.id);

      if (error) throw error;
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.name) {
      toast.error('يرجى إدخال اسم طريقة الدفع');
      return;
    }

    if (!currentStore) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert({
          name: newPaymentMethod.name,
          name_en: newPaymentMethod.name_en || newPaymentMethod.name,
          icon: newPaymentMethod.icon,
          is_active: true,
          requires_reference: newPaymentMethod.requires_reference,
          store_id: currentStore.id,
        });

      if (error) throw error;

      await refreshPaymentMethods();
      setNewPaymentMethod({
        name: '',
        name_en: '',
        icon: 'CreditCard',
        requires_reference: true,
      });
      toast.success('تم إضافة طريقة الدفع');
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('حدث خطأ أثناء الإضافة');
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await refreshPaymentMethods();
      toast.success('تم حذف طريقة الدفع');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleTogglePaymentMethod = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      await refreshPaymentMethods();
    } catch (error) {
      console.error('Error toggling payment method:', error);
      toast.error('حدث خطأ');
    }
  };

  const getPaymentIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'Banknote':
        return Banknote;
      case 'CreditCard':
        return CreditCard;
      case 'Smartphone':
        return Smartphone;
      default:
        return CreditCard;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
        <p className="text-sm text-muted-foreground">
          تخصيص إعدادات النظام والمتجر
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            المتجر
          </TabsTrigger>
          <TabsTrigger value="receipt" className="gap-2">
            <Receipt className="h-4 w-4" />
            الفاتورة
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            طرق الدفع
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Shield className="h-4 w-4" />
            النظام
          </TabsTrigger>
          <TabsTrigger value="language" className="gap-2">
            <Globe className="h-4 w-4" />
            اللغة
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>معلومات المتجر</CardTitle>
              <CardDescription>
                بيانات المتجر الأساسية التي تظهر في الفواتير والتقارير
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">اسم المتجر (عربي)</Label>
                  <Input
                    id="storeName"
                    value={localSettings.name}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeNameEn">اسم المتجر (إنجليزي)</Label>
                  <Input
                    id="storeNameEn"
                    value={localSettings.nameEn}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, nameEn: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  value={localSettings.address}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, address: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={localSettings.phone}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={localSettings.email}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                  <Input
                    id="taxNumber"
                    value={localSettings.taxNumber || ''}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, taxNumber: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">العملة</Label>
                  <Select
                    value={localSettings.currency}
                    onValueChange={(value) =>
                      setLocalSettings({ ...localSettings, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                      <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                      <SelectItem value="KWD">دينار كويتي (KWD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveSettings} disabled={saving}>
                <Save className="ml-2 h-4 w-4" />
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipt Settings */}
        <TabsContent value="receipt">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الفاتورة</CardTitle>
              <CardDescription>
                تخصيص مظهر ومحتوى الفاتورة المطبوعة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiptHeader">رأس الفاتورة</Label>
                <Textarea
                  id="receiptHeader"
                  value={localSettings.receiptHeader || ''}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      receiptHeader: e.target.value,
                    })
                  }
                  placeholder="نص يظهر في أعلى الفاتورة"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptFooter">ذيل الفاتورة</Label>
                <Textarea
                  id="receiptFooter"
                  value={localSettings.receiptFooter || ''}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      receiptFooter: e.target.value,
                    })
                  }
                  placeholder="نص يظهر في أسفل الفاتورة"
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">نسبة الضريبة (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={localSettings.taxRate}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        taxRate: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">تفعيل الضريبة</p>
                  <p className="text-sm text-muted-foreground">
                    إضافة الضريبة تلقائياً للفواتير
                  </p>
                </div>
                <Switch
                  checked={localSettings.enableTax}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, enableTax: checked })
                  }
                />
              </div>
              <Button onClick={handleSaveSettings} disabled={saving}>
                <Save className="ml-2 h-4 w-4" />
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods */}
        <TabsContent value="payment">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>طرق الدفع المتاحة</CardTitle>
                <CardDescription>إدارة طرق الدفع المستخدمة في النظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => {
                  const Icon = getPaymentIcon(method.icon);
                  return (
                    <div
                      key={method.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {method.requires_reference
                              ? 'يتطلب رقم العملية'
                              : 'لا يتطلب رقم العملية'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={method.is_active}
                          onCheckedChange={() => handleTogglePaymentMethod(method.id, method.is_active)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إضافة طريقة دفع جديدة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>الاسم (عربي)</Label>
                    <Input
                      value={newPaymentMethod.name}
                      onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          name: e.target.value,
                        })
                      }
                      placeholder="مثال: تحويل بنكي"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الاسم (إنجليزي)</Label>
                    <Input
                      value={newPaymentMethod.name_en}
                      onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          name_en: e.target.value,
                        })
                      }
                      placeholder="Bank Transfer"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>الأيقونة</Label>
                    <Select
                      value={newPaymentMethod.icon}
                      onValueChange={(value) =>
                        setNewPaymentMethod({ ...newPaymentMethod, icon: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Banknote">نقد</SelectItem>
                        <SelectItem value="CreditCard">بطاقة</SelectItem>
                        <SelectItem value="Smartphone">جوال</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newPaymentMethod.requires_reference}
                        onCheckedChange={(checked) =>
                          setNewPaymentMethod({
                            ...newPaymentMethod,
                            requires_reference: checked,
                          })
                        }
                      />
                      <Label>يتطلب رقم العملية</Label>
                    </div>
                  </div>
                </div>
                <Button onClick={handleAddPaymentMethod}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة طريقة الدفع
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات النظام</CardTitle>
              <CardDescription>تخصيص سلوك النظام والميزات المتاحة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">تفعيل الخصومات</p>
                  <p className="text-sm text-muted-foreground">
                    السماح بتطبيق خصومات على المنتجات والفواتير
                  </p>
                </div>
                <Switch
                  checked={localSettings.enableDiscounts}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, enableDiscounts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">معلومات العميل</p>
                  <p className="text-sm text-muted-foreground">
                    طلب اسم ورقم هاتف العميل عند البيع
                  </p>
                </div>
                <Switch
                  checked={localSettings.enableCustomerInfo}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, enableCustomerInfo: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStock">حد تنبيه المخزون المنخفض</Label>
                <Input
                  id="lowStock"
                  type="number"
                  value={localSettings.lowStockThreshold}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      lowStockThreshold: parseInt(e.target.value) || 10,
                    })
                  }
                />
              </div>
              <Button onClick={handleSaveSettings} disabled={saving}>
                <Save className="ml-2 h-4 w-4" />
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Settings */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات اللغة</CardTitle>
              <CardDescription>تخصيص لغة واجهة النظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>لغة الواجهة</Label>
                <Select
                  value={localSettings.language}
                  onValueChange={(value: 'ar' | 'en') =>
                    setLocalSettings({ ...localSettings, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveSettings} disabled={saving}>
                <Save className="ml-2 h-4 w-4" />
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}