import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  onItemClick: (item: string) => void; // เพิ่ม props นี้
  activeItem: string
}

export function MainLayout({ children, onItemClick, activeItem }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar 
        onItemClick={onItemClick}
        activeItem={activeItem}
        />
        <main className="min-w-0 flex-1 relative overflow-y-auto bg-background text-foreground p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
