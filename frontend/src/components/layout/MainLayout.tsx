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
      <div className="flex min-h-screen w-full">
        <AppSidebar 
        onItemClick={onItemClick}
        activeItem={activeItem}
        />
        <main className="min-w-0 flex-1 relative bg-background text-foreground p-6">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
