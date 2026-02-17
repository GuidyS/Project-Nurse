import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  onItemClick: (item: string) => void; // เพิ่ม props นี้
}

export function MainLayout({ children, onItemClick }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar onItemClick={onItemClick} />
        <main className="flex-1 relative overflow-y-auto bg-slate-50 transition-all duration-300 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
