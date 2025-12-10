import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Clock, Calendar } from 'lucide-react';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
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
  );
}
