import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
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
import { PaymentMethod } from '@/types';

export default function Settings() {
  const { settings, setSettings, paymentMethods, setPaymentMethods } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    name: '',
    nameEn: '',
    icon: 'CreditCard',
    requiresTransactionId: true,
  });

  const handleSaveSettings = () => {
    setSettings(localSettings);
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  const handleAddPaymentMethod = () => {
    if (!newPaymentMethod.name) {
      toast.error('يرجى إدخال اسم طريقة الدفع');
      return;
    }

    const method: PaymentMethod = {
      id: Date.now().toString(),
      name: newPaymentMethod.name,
      nameEn: newPaymentMethod.nameEn || newPaymentMethod.name,
      icon: newPaymentMethod.icon,
      isActive: true,
      requiresTransactionId: newPaymentMethod.requiresTransactionId,
    };

    setPaymentMethods((prev) => [...prev, method]);
    setNewPaymentMethod({
      name: '',
      nameEn: '',
      icon: 'CreditCard',
      requiresTransactionId: true,
    });
    toast.success('تم إضافة طريقة الدفع');
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
    toast.success('تم حذف طريقة الدفع');
  };

  const handleTogglePaymentMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m))
    );
  };

  const getPaymentIcon = (iconName: string) => {
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
                      <SelectItem value="ر.س">ريال سعودي (ر.س)</SelectItem>
                      <SelectItem value="ج.م">جنيه مصري (ج.م)</SelectItem>
                      <SelectItem value="د.إ">درهم إماراتي (د.إ)</SelectItem>
                      <SelectItem value="د.ك">دينار كويتي (د.ك)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveSettings}>
                <Save className="ml-2 h-4 w-4" />
                حفظ التغييرات
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
              <Button onClick={handleSaveSettings}>
                <Save className="ml-2 h-4 w-4" />
                حفظ التغييرات
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
                            {method.requiresTransactionId
                              ? 'يتطلب رقم العملية'
                              : 'لا يتطلب رقم العملية'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={method.isActive}
                          onCheckedChange={() => handleTogglePaymentMethod(method.id)}
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
                      value={newPaymentMethod.nameEn}
                      onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          nameEn: e.target.value,
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
                        checked={newPaymentMethod.requiresTransactionId}
                        onCheckedChange={(checked) =>
                          setNewPaymentMethod({
                            ...newPaymentMethod,
                            requiresTransactionId: checked,
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
                    طلب بيانات العميل عند إنشاء الفاتورة
                  </p>
                </div>
                <Switch
                  checked={localSettings.enableCustomerInfo}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      enableCustomerInfo: checked,
                    })
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
                  className="max-w-[200px]"
                />
              </div>
              <Button onClick={handleSaveSettings}>
                <Save className="ml-2 h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Settings */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات اللغة</CardTitle>
              <CardDescription>تغيير لغة واجهة النظام</CardDescription>
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
                  <SelectTrigger className="max-w-[250px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveSettings}>
                <Save className="ml-2 h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
