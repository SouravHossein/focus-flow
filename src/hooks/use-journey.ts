import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const JOURNEY_TIERS = [
  { name: 'Valley', min: 0, badge: 'First Steps', emoji: '🏕️' },
  { name: 'Forest', min: 10, badge: 'Trail Finder', emoji: '🌲' },
  { name: 'Hills', min: 30, badge: 'Steady Climber', emoji: '⛰️' },
  { name: 'Ridge', min: 60, badge: 'Ridge Walker', emoji: '🏔️' },
  { name: 'Snow Line', min: 100, badge: 'Above the Clouds', emoji: '❄️' },
  { name: 'Peak', min: 150, badge: 'Peak Seeker', emoji: '🗻' },
  { name: 'Summit', min: 250, badge: 'Summit Master', emoji: '🏆' },
] as const;

export function getTierFromAltitude(altitude: number) {
  for (let i = JOURNEY_TIERS.length - 1; i >= 0; i--) {
    if (altitude >= JOURNEY_TIERS[i].min) return JOURNEY_TIERS[i];
  }
  return JOURNEY_TIERS[0];
}

export function getNextTier(altitude: number) {
  for (const tier of JOURNEY_TIERS) {
    if (altitude < tier.min) return tier;
  }
  return null;
}

export function useJourneyProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['journey-progress', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_progress')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAdvanceJourney() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (focusMinutes: number) => {
      if (!user) throw new Error('Not authenticated');
      // Get or create journey progress
      const { data: existing } = await supabase
        .from('journey_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const today = new Date().toISOString().slice(0, 10);
      const newAltitude = (existing?.total_altitude || 0) + 1;
      const newTotalMinutes = (existing?.total_focus_minutes || 0) + focusMinutes;
      const tier = getTierFromAltitude(newAltitude);

      // Streak logic
      let streakDays = existing?.streak_days || 0;
      let bestStreak = existing?.best_streak || 0;
      const lastDate = existing?.last_focus_date;

      if (lastDate === today) {
        // Same day, no streak change
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        if (lastDate === yesterdayStr) {
          streakDays += 1;
        } else {
          streakDays = 1;
        }
      }
      if (streakDays > bestStreak) bestStreak = streakDays;

      // Check for new badges
      const badges: string[] = Array.isArray(existing?.badges) ? [...(existing.badges as string[])] : [];
      if (!badges.includes(tier.badge)) badges.push(tier.badge);

      if (existing) {
        const { error } = await supabase
          .from('journey_progress')
          .update({
            total_altitude: newAltitude,
            current_tier: tier.name.toLowerCase().replace(' ', '_'),
            streak_days: streakDays,
            best_streak: bestStreak,
            total_focus_minutes: newTotalMinutes,
            last_focus_date: today,
            badges,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('journey_progress')
          .insert({
            user_id: user.id,
            total_altitude: 1,
            current_tier: 'valley',
            streak_days: 1,
            best_streak: 1,
            total_focus_minutes: focusMinutes,
            last_focus_date: today,
            badges: ['First Steps'],
          });
        if (error) throw error;
      }

      return { newAltitude, tier, streakDays, badges };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journey-progress'] });
    },
  });
}
