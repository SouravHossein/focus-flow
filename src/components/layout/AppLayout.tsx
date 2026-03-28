import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { QuickAddDialog } from '@/components/tasks/QuickAddDialog';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';
import { SearchDialog } from '@/components/search/SearchDialog';
import { useUIStore } from '@/stores/ui-store';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export function AppLayout() {
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'q' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setQuickAddOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setQuickAddOpen]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-12 items-center border-b bg-background/80 backdrop-blur-sm px-4">
            <SidebarTrigger className="mr-2" />
          </header>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile FAB */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg md:hidden"
        onClick={() => setQuickAddOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <QuickAddDialog />
      <TaskDetailDrawer />
      <SearchDialog />
    </SidebarProvider>
  );
}
