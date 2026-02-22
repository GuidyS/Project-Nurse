import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

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
        <main className="flex-1 relative overflow-y-auto bg-slate-50 transition-all duration-300 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
