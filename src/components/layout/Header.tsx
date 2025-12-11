import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Clock, Calendar, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import OfflineIndicator from './OfflineIndicator';

const roleLabels: Record<string, string> = {
  admin: 'مدير',
  accountant: 'محاسب',
  supervisor: 'مشرف',
  cashier: 'كاشير',
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-600 border-red-500/20',
  accountant: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  supervisor: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  cashier: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { profile, role, signOut } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(currentTime, 'EEEE، d MMMM yyyy', { locale: ar })}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-foreground">
          <Clock className="h-4 w-4" />
          <span>{format(currentTime, 'HH:mm:ss')}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <OfflineIndicator />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {profile ? getInitials(profile.full_name || profile.username) : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">
                  {profile?.full_name || profile?.username || 'مستخدم'}
                </span>
                {role && (
                  <Badge variant="outline" className={`text-xs px-1 py-0 ${roleColors[role]}`}>
                    {roleLabels[role]}
                  </Badge>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive focus:text-destructive"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
