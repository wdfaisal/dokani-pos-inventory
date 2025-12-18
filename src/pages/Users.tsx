import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Users as UsersIcon,
  Search,
  Edit2,
  Shield,
  UserCheck,
  UserX,
  Crown,
  Eye,
  Store,
} from 'lucide-react';

interface UserWithRole {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  role: AppRole;
}

const roleLabels: Record<AppRole, string> = {
  owner: 'مالك',
  admin: 'مدير',
  manager: 'مشرف',
  cashier: 'كاشير',
};

const roleIcons: Record<AppRole, React.ReactNode> = {
  owner: <Crown className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
  manager: <Eye className="h-4 w-4" />,
  cashier: <Store className="h-4 w-4" />,
};

const roleColors: Record<AppRole, string> = {
  owner: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  admin: 'bg-red-500/10 text-red-600 border-red-500/20',
  manager: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  cashier: 'bg-green-500/10 text-green-600 border-green-500/20',
};

const Users = () => {
  const { hasPermission, currentStore } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);

  useEffect(() => {
    if (currentStore) {
      fetchUsers();
    }
  }, [currentStore]);

  const fetchUsers = async () => {
    if (!currentStore) return;
    
    try {
      setLoading(true);
      
      // Fetch store members with profiles
      const { data: members, error: membersError } = await supabase
        .from('store_members')
        .select('user_id, role, is_active')
        .eq('store_id', currentStore.id);

      if (membersError) throw membersError;

      // Get owner info
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentStore.owner_id)
        .maybeSingle();

      // Fetch profiles for members
      const memberUserIds = members?.map(m => m.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', [...memberUserIds, currentStore.owner_id]);

      if (profilesError) throw profilesError;

      // Combine data
      const usersWithRoles: UserWithRole[] = [];
      
      // Add owner first
      if (ownerProfile) {
        usersWithRoles.push({
          ...ownerProfile,
          role: 'owner' as AppRole,
        });
      }

      // Add members
      members?.forEach(member => {
        const profile = profiles?.find(p => p.user_id === member.user_id);
        if (profile && profile.user_id !== currentStore.owner_id) {
          usersWithRoles.push({
            ...profile,
            role: member.role as AppRole,
            is_active: member.is_active,
          });
        }
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل المستخدمين',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !currentStore) return;

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: selectedUser.full_name,
          phone: selectedUser.phone,
        })
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      // Update role in store_members (not for owner)
      if (selectedUser.role !== 'owner') {
        const { error: roleError } = await supabase
          .from('store_members')
          .update({ role: selectedUser.role, is_active: selectedUser.is_active })
          .eq('store_id', currentStore.id)
          .eq('user_id', selectedUser.user_id);

        if (roleError) throw roleError;
      }

      toast({
        title: 'تم التحديث',
        description: 'تم تحديث بيانات المستخدم بنجاح',
      });

      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث المستخدم',
        variant: 'destructive',
      });
    }
  };

  const toggleUserStatus = async (user: UserWithRole) => {
    if (!currentStore || user.role === 'owner') return;
    
    try {
      const { error } = await supabase
        .from('store_members')
        .update({ is_active: !user.is_active })
        .eq('store_id', currentStore.id)
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: user.is_active ? 'تم إلغاء التفعيل' : 'تم التفعيل',
        description: `تم ${user.is_active ? 'إلغاء تفعيل' : 'تفعيل'} حساب ${user.full_name}`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تغيير حالة المستخدم',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    admins: users.filter((u) => u.role === 'admin' || u.role === 'owner').length,
    cashiers: users.filter((u) => u.role === 'cashier').length,
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UsersIcon className="h-8 w-8 text-primary" />
            إدارة المستخدمين
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة حسابات المستخدمين والصلاحيات
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <UserCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المستخدمين النشطين</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/10">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المديرين</p>
              <p className="text-2xl font-bold">{stats.admins}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <Store className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الكاشير</p>
              <p className="text-2xl font-bold">{stats.cashiers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن مستخدم..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="جميع الأدوار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>المستخدمين ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا يوجد مستخدمين
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.full_name}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleColors[user.role]}>
                        <span className="ml-1">{roleIcons[user.role]}</span>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'نشط' : 'معطل'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {hasPermission('users', 'edit') && user.role !== 'owner' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserStatus(user)}
                            >
                              {user.is_active ? (
                                <UserX className="h-4 w-4 text-destructive" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم الكامل</Label>
                <Input
                  value={selectedUser.full_name}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, full_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  value={selectedUser.phone || ''}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>الدور</Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value: AppRole) =>
                    setSelectedUser({ ...selectedUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels)
                      .filter(([value]) => value !== 'owner')
                      .map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>الحساب نشط</Label>
                <Switch
                  checked={selectedUser.is_active}
                  onCheckedChange={(checked) =>
                    setSelectedUser({ ...selectedUser, is_active: checked })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleUpdateUser}>حفظ التغييرات</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
