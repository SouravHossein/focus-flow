import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { QuickAddDialog } from '@/components/tasks/QuickAddDialog';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';
import { CommandPalette } from '@/components/command/CommandPalette';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { JumpModeHUD } from '@/components/navigation/JumpModeHUD';
import { ShortcutReferenceModal } from '@/components/navigation/ShortcutReferenceModal';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { ReminderBell } from '@/components/reminders/ReminderBell';
import { PomodoroTimer } from '@/components/productivity/PomodoroTimer';
import { FocusScreen } from '@/components/focus/FocusScreen';
import { FocusPreSession } from '@/components/focus/FocusPreSession';
import { useFocusStore } from '@/stores/focus-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuth } from '@/contexts/AuthContext';
import { useJumpMode } from '@/hooks/useJumpMode';
import { useWorkspaces, useAcceptInvitation } from '@/hooks/use-workspaces';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

function applyTheme(theme: string) {
  document.documentElement.classList.remove('dark');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
}

export function AppLayout() {
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen);
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const focusPhase = useFocusStore((s) => s.phase);
  const openPreSession = useFocusStore((s) => s.openPreSession);
  const { profile } = useAuth();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize workspaces
  useWorkspaces();

  // Handle pending invite token from auth flow
  const acceptInvitation = useAcceptInvitation();
  useEffect(() => {
    const pendingToken = sessionStorage.getItem('pendingInviteToken');
    if (pendingToken) {
      sessionStorage.removeItem('pendingInviteToken');
      acceptInvitation.mutate(pendingToken, {
        onSuccess: () => toast({ title: 'Successfully joined workspace!' }),
        onError: (err) => toast({ title: 'Could not join workspace', description: err.message, variant: 'destructive' }),
      });
    }
  }, []);

  // Initialize jump mode
  useJumpMode();

  // Apply theme from profile on mount
  useEffect(() => {
    if (profile?.theme_preference) {
      applyTheme(profile.theme_preference);
    }
  }, [profile?.theme_preference]);

  // System theme listener
  useEffect(() => {
    if (profile?.theme_preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [profile?.theme_preference]);

  // Check onboarding
  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [profile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      // Escape closes drawers/dialogs
      if (e.key === 'Escape') {
        setTaskDetailId(null);
        setSearchOpen(false);
        setQuickAddOpen(false);
        return;
      }

      if (isInput) return;

      if (e.key === 'q' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setQuickAddOpen(true);
      }
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openPreSession();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setQuickAddOpen, setTaskDetailId, setSearchOpen, openPreSession]);

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-1" />
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-1">
              <PomodoroTimer />
              <ReminderBell />
            </div>
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
      <CommandPalette />
      <FocusPreSession />
      <JumpModeHUD />
      <ShortcutReferenceModal />
      {focusPhase !== 'idle' && <FocusScreen />}
    </SidebarProvider>
  );
}
