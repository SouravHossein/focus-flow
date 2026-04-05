import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { useLabels } from '@/hooks/use-labels';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Download, Trash2, FileText, Building2 } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { data: allTasks } = useTasks({ includeCompleted: true });
  const { data: projects } = useProjects();
  const { data: labels } = useLabels();
  const { toast } = useToast();
  const [theme, setTheme] = useState(profile?.theme_preference || 'system');
  const [dateFormat, setDateFormat] = useState(profile?.date_format || 'MMM d, yyyy');
  const [weekStart, setWeekStart] = useState(String(profile?.week_start ?? 0));

  useEffect(() => {
    if (profile) {
      setTheme(profile.theme_preference);
      setDateFormat(profile.date_format);
      setWeekStart(String(profile.week_start));
    }
  }, [profile]);

  const applyTheme = (t: string) => {
    document.documentElement.classList.remove('dark');
    if (t === 'dark') document.documentElement.classList.add('dark');
    else if (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      theme_preference: theme,
      date_format: dateFormat,
      week_start: Number(weekStart),
    }).eq('id', user.id);

    if (error) {
      toast({ title: 'Error saving', description: error.message, variant: 'destructive' });
    } else {
      applyTheme(theme);
      await refreshProfile();
      toast({ title: 'Settings saved' });
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    const data = {
      tasks: allTasks || [],
      projects: projects || [],
      labels: labels || [],
      exportedAt: new Date().toISOString(),
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskflow-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const tasks = data.tasks;
      const headers = ['title', 'description', 'priority', 'due_date', 'completed_at', 'project_id', 'created_at'];
      const csvRows = [headers.join(',')];
      tasks.forEach((t: any) => {
        csvRows.push(headers.map((h) => `"${(t[h] || '').toString().replace(/"/g, '""')}"`).join(','));
      });
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskflow-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({ title: `Data exported as ${format.toUpperCase()}` });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    // Delete user data (tasks, projects, labels, profile) then sign out
    await supabase.from('tasks').delete().eq('user_id', user.id);
    await supabase.from('projects').delete().eq('user_id', user.id);
    await supabase.from('labels').delete().eq('user_id', user.id);
    await supabase.from('saved_filters').delete().eq('user_id', user.id);
    await supabase.from('profiles').delete().eq('id', user.id);
    toast({ title: 'Account data deleted' });
    await signOut();
  };

  return (
    <div className="mx-auto max-w-xl p-4 md:p-8">
      <h1 className="text-xl font-bold text-foreground mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Manage workspace members, invitations, and permissions</p>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/app/settings/workspace')}>
              <Building2 className="h-3.5 w-3.5" />
              Workspace settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Create reusable task templates to speed up your workflow</p>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/app/settings/templates')}>
              <FileText className="h-3.5 w-3.5" />
              Manage templates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Date & Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Date format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MMM d, yyyy">Mar 28, 2026</SelectItem>
                  <SelectItem value="dd/MM/yyyy">28/03/2026</SelectItem>
                  <SelectItem value="MM/dd/yyyy">03/28/2026</SelectItem>
                  <SelectItem value="yyyy-MM-dd">2026-03-28</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Week starts on</Label>
              <Select value={weekStart} onValueChange={setWeekStart}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Export your tasks, projects, and labels</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportData('json')}>
                <Download className="h-3.5 w-3.5" />
                Export JSON
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportData('csv')}>
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="w-full">
              Sign out
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your tasks, projects, labels, and settings. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full">
          Save preferences
        </Button>
      </div>
    </div>
  );
}
