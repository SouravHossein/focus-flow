import { useFocusStore } from '@/stores/focus-store';
import { useJourneyProgress, getTierFromAltitude } from '@/hooks/use-journey';
import { CompanionAvatar } from './CompanionAvatar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle2, Mountain, ArrowRight } from 'lucide-react';

interface FocusRecapProps {
  onDone: () => void;
}

export function FocusRecap({ onDone }: FocusRecapProps) {
  const { focusMinutes, taskTitle } = useFocusStore();
  const { data: journey } = useJourneyProgress();
  const tier = journey ? getTierFromAltitude(journey.total_altitude) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(180deg, hsl(240 6% 10%) 0%, hsl(240 8% 6%) 100%)' }}
    >
      <CompanionAvatar phase="recap" size="lg" className="mb-6" />

      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-semibold text-white mb-2"
      >
        Checkpoint reached!
      </motion.h2>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/60 text-sm mb-8 text-center"
      >
        You focused for {focusMinutes} minutes. The path is open.
      </motion.p>

      {/* Stats */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8"
      >
        <div className="rounded-xl bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-white">{focusMinutes}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Minutes</p>
        </div>
        <div className="rounded-xl bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-white">{journey?.streak_days || 1}🔥</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Streak</p>
        </div>
      </motion.div>

      {/* Tier */}
      {tier && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 mb-4 text-white/70"
        >
          <Mountain className="h-4 w-4" />
          <span className="text-sm">{tier.emoji} {tier.name} — Altitude {journey?.total_altitude || 0}</span>
        </motion.div>
      )}

      {/* Task */}
      {taskTitle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 mb-8 text-white/50 text-xs"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{taskTitle}</span>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col gap-2 w-full max-w-xs"
      >
        <Button onClick={onDone} className="h-12 gap-2">
          <ArrowRight className="h-4 w-4" />
          Done
        </Button>
      </motion.div>
    </motion.div>
  );
}
