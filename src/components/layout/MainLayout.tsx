import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed, isFullscreen } = useApp();

  if (isFullscreen) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'mr-[70px]' : 'mr-[240px]'
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
