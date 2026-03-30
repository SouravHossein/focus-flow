import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateProject } from '@/hooks/use-projects';
import { useCreateTask } from '@/hooks/use-tasks';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Sun, Moon, FolderOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user, refreshProfile } = useAuth();
  const createProject = useCreateProject();
  const createTask = useCreateTask();
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [projectName, setProjectName] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const applyTheme = (t: string) => {
    document.documentElement.classList.remove('dark');
    if (t === 'dark') document.documentElement.classList.add('dark');
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Save theme preference
      await supabase.from('profiles').update({
        theme_preference: theme,
        onboarding_completed: true,
      }).eq('id', user.id);

      // Create project if provided
      let projectId: string | null = null;
      if (projectName.trim()) {
        const p = await createProject.mutateAsync({ name: projectName.trim() });
        projectId = p.id;
      }

      // Create task if provided
      if (taskTitle.trim()) {
        await createTask.mutateAsync({
          title: taskTitle.trim(),
          project_id: projectId,
        });
      }

      await refreshProfile();
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center space-y-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <CheckSquare className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">Welcome to TaskFlow</h2>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Let's set up your workspace in a few quick steps.
      </p>
      <Button onClick={() => setStep(1)} className="mt-4">
        Get started
      </Button>
    </div>,

    // Step 1: Theme
    <div key="theme" className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Choose your theme</h2>
        <p className="text-sm text-muted-foreground mt-1">You can change this later in settings</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {([['light', Sun, 'Light'], ['dark', Moon, 'Dark']] as const).map(([t, Icon, label]) => (
          <button
            key={t}
            onClick={() => { setTheme(t); applyTheme(t); }}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border-2 p-6 transition-all',
              theme === t ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
            )}
          >
            <Icon className="h-8 w-8" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
      <Button onClick={() => setStep(2)} className="w-full">Continue</Button>
    </div>,

    // Step 2: First project
    <div key="project" className="space-y-6">
      <div className="text-center">
        <FolderOpen className="h-8 w-8 mx-auto text-primary mb-2" />
        <h2 className="text-xl font-bold text-foreground">Create your first project</h2>
        <p className="text-sm text-muted-foreground mt-1">Or skip and use the Inbox</p>
      </div>
      <Input
        placeholder="e.g. Work, Personal, School..."
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        autoFocus
      />
      <div className="flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={() => setStep(3)}>Skip</Button>
        <Button className="flex-1" onClick={() => setStep(3)} disabled={!projectName.trim()}>Continue</Button>
      </div>
    </div>,

    // Step 3: First task
    <div key="task" className="space-y-6">
      <div className="text-center">
        <Sparkles className="h-8 w-8 mx-auto text-primary mb-2" />
        <h2 className="text-xl font-bold text-foreground">Add your first task</h2>
        <p className="text-sm text-muted-foreground mt-1">What do you need to get done?</p>
      </div>
      <Input
        placeholder="e.g. Review project proposal"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        autoFocus
      />
      <Button onClick={handleFinish} className="w-full" disabled={saving}>
        {saving ? 'Setting up...' : 'Finish setup'}
      </Button>
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 shadow-xl">
        <CardContent className="p-8">
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-muted'
                )}
              />
            ))}
          </div>
          {steps[step]}
        </CardContent>
      </Card>
    </div>
  );
}
