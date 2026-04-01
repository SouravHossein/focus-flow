import { useJourneyProgress, JOURNEY_TIERS, getTierFromAltitude, getNextTier } from '@/hooks/use-journey';
import { StreakDisplay } from './StreakDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Mountain, Clock, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export function JourneyMap() {
  const { data: journey, isLoading } = useJourneyProgress();

  const altitude = journey?.total_altitude || 0;
  const currentTier = getTierFromAltitude(altitude);
  const nextTier = getNextTier(altitude);
  const badges: string[] = Array.isArray(journey?.badges) ? (journey.badges as string[]) : [];

  if (isLoading) {
    return <div className="flex items-center justify-center p-12 text-muted-foreground">Loading journey...</div>;
  }

  return (
    <div className="mx-auto max-w-lg p-4 md:p-8">
      <h1 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
        <Mountain className="h-5 w-5 text-primary" />
        Your Journey
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Every session is a step forward</p>

      {/* Current position card */}
      <Card className="mb-6 border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold">{currentTier.emoji}</p>
              <p className="text-lg font-semibold mt-1">{currentTier.name}</p>
              <p className="text-xs text-muted-foreground">Altitude {altitude}</p>
            </div>
            <div className="text-right space-y-1">
              <StreakDisplay days={journey?.streak_days || 0} />
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3" />
                {journey?.total_focus_minutes || 0} min total
              </p>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>{currentTier.name}</span>
                <span>{nextTier.name} ({nextTier.min})</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((altitude - currentTier.min) / (nextTier.min - currentTier.min)) * 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {nextTier.min - altitude} sessions to {nextTier.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trail */}
      <div className="relative pl-8 space-y-0">
        {[...JOURNEY_TIERS].reverse().map((tier, i) => {
          const reached = altitude >= tier.min;
          const isCurrent = currentTier.name === tier.name;
          return (
            <div key={tier.name} className="relative pb-8 last:pb-0">
              {/* Vertical line */}
              {i < JOURNEY_TIERS.length - 1 && (
                <div className={cn(
                  'absolute left-[-20px] top-6 bottom-0 w-0.5',
                  reached ? 'bg-primary/40' : 'bg-muted'
                )} />
              )}
              {/* Dot */}
              <div className={cn(
                'absolute left-[-24px] top-1 w-3 h-3 rounded-full border-2',
                isCurrent ? 'bg-primary border-primary shadow-lg shadow-primary/30' :
                reached ? 'bg-primary/60 border-primary/60' : 'bg-muted border-muted-foreground/20'
              )} />
              {/* Content */}
              <div className={cn('transition-opacity', !reached && 'opacity-40')}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{tier.emoji}</span>
                  <span className={cn('text-sm font-medium', isCurrent && 'text-primary')}>{tier.name}</span>
                  <span className="text-[10px] text-muted-foreground">({tier.min}+)</span>
                </div>
                {reached && badges.includes(tier.badge) && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-primary/70 mt-0.5">
                    <Trophy className="h-3 w-3" />
                    {tier.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      {journey && (
        <div className="mt-8 grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{journey.total_altitude}</p>
              <p className="text-[10px] text-muted-foreground">Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{journey.best_streak}</p>
              <p className="text-[10px] text-muted-foreground">Best Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{Math.round((journey.total_focus_minutes || 0) / 60)}</p>
              <p className="text-[10px] text-muted-foreground">Hours</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
