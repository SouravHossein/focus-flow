import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
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
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">{user?.email}</span>
            </div>
            <Button variant="destructive" size="sm" onClick={signOut} className="w-full">
              Sign out
            </Button>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full">
          Save preferences
        </Button>
      </div>
    </div>
  );
}
