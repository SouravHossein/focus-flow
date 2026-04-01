import { useFocusStore } from '@/stores/focus-store';
import { useTodayFocusStats } from '@/hooks/use-focus-sessions';
import { useJourneyProgress, getTierFromAltitude } from '@/hooks/use-journey';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TierBadge } from '@/components/journey/TierBadge';
import { StreakDisplay } from '@/components/journey/StreakDisplay';
import { Mountain, Play, Clock, Target } from 'lucide-react';

export default function FocusPage() {
  const openPreSession = useFocusStore(s => s.openPreSession);
  const isActive = useFocusStore(s => s.phase !== 'idle');
  const { data: stats } = useTodayFocusStats();
  const { data: journey } = useJourneyProgress();
  const { profile } = useAuth();
  const dailyGoal = profile?.daily_focus_goal || 120;
  const todayMinutes = stats?.totalMinutes || 0;
  const goalProgress = Math.min(100, Math.round((todayMinutes / dailyGoal) * 100));

  return (
    <div className="mx-auto max-w-lg p-4 md:p-8">
      <h1 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
        <Mountain className="h-5 w-5 text-primary" />
        Focus
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Ready to climb?</p>

      {/* Big start button */}
      <Card className="mb-6 border-primary/20">
        <CardContent className="p-6 flex flex-col items-center">
          <Button
            size="lg"
            disabled={isActive}
            className="h-20 w-20 rounded-full text-xl shadow-lg shadow-primary/20"
            onClick={() => openPreSession()}
          >
            <Play className="h-8 w-8" />
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            {isActive ? 'Session in progress...' : 'Start a focus session'}
          </p>
        </CardContent>
      </Card>

      {/* Today stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{todayMinutes}</p>
            <p className="text-[10px] text-muted-foreground">Min today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Target className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{stats?.sessions || 0}</p>
            <p className="text-[10px] text-muted-foreground">Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <StreakDisplay days={journey?.streak_days || 0} className="justify-center" />
            <p className="text-[10px] text-muted-foreground mt-1">Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily goal progress */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Daily goal</span>
            <span className="font-medium">{todayMinutes}/{dailyGoal} min</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Journey tier */}
      {journey && (
        <div className="flex items-center justify-center gap-2">
          <TierBadge altitude={journey.total_altitude} />
          <span className="text-xs text-muted-foreground">Altitude {journey.total_altitude}</span>
        </div>
      )}
    </div>
  );
}
