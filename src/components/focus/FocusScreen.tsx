import { useEffect, useRef } from 'react';
import { useFocusStore } from '@/stores/focus-store';
import { useCompleteFocusSession } from '@/hooks/use-focus-sessions';
import { useAdvanceJourney } from '@/hooks/use-journey';
import { AltitudeRing } from './AltitudeRing';
import { CompanionAvatar } from './CompanionAvatar';
import { FocusRecap } from './FocusRecap';
import { Button } from '@/components/ui/button';
import { Pause, Play, Square, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Procedural white noise via Web Audio API
function useAmbientSound(sound: string | null, volume: number, isRunning: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (!sound || !isRunning) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      return;
    }

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);
    gainRef.current = gain;

    // Generate noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (sound === 'white-noise') {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else {
      // Brown noise for other sounds (more natural)
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(gain);
    src.start();
    sourceRef.current = src;

    return () => {
      src.stop();
      ctx.close();
      audioCtxRef.current = null;
    };
  }, [sound, isRunning]);

  // Update volume
  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }, [volume]);
}

export function FocusScreen() {
  const {
    phase, timerSeconds, isRunning, isPaused,
    taskTitle, focusMinutes, breakMinutes,
    ambientSound, ambientVolume, sessionId, notes,
    pause, resume, endSession, skipBreak, reset,
  } = useFocusStore();

  const completeSession = useCompleteFocusSession();
  const advanceJourney = useAdvanceJourney();

  useAmbientSound(ambientSound, ambientVolume, isRunning && !isPaused);

  const totalSeconds = phase === 'focus' ? focusMinutes * 60 : breakMinutes * 60;
  const progress = totalSeconds > 0 ? 1 - timerSeconds / totalSeconds : 0;
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  const handleEnd = async () => {
    endSession();
    if (sessionId) {
      await completeSession.mutateAsync({ id: sessionId, notes: notes || undefined });
      await advanceJourney.mutateAsync(focusMinutes);
    }
  };

  const handleRecapDone = () => reset();

  if (phase === 'idle') return null;

  if (phase === 'recap') {
    return <FocusRecap onDone={handleRecapDone} />;
  }

  const isFocus = phase === 'focus';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{
          background: isFocus
            ? 'linear-gradient(180deg, hsl(240 6% 10%) 0%, hsl(240 8% 6%) 100%)'
            : 'linear-gradient(180deg, hsl(180 15% 12%) 0%, hsl(200 10% 8%) 100%)',
        }}
      >
        {/* Task title */}
        {taskTitle && (
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 0.7 }}
            className="text-sm text-white/70 mb-6 text-center px-4 max-w-xs truncate"
          >
            {taskTitle}
          </motion.p>
        )}

        {/* Phase label */}
        <motion.p
          key={phase}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-xs uppercase tracking-widest mb-4"
          style={{ color: isFocus ? 'hsl(var(--primary))' : 'hsl(var(--success))' }}
        >
          {isFocus ? 'Focus' : 'Break'}
        </motion.p>

        {/* Timer ring */}
        <AltitudeRing progress={progress} size={260} strokeWidth={5} phase={isFocus ? 'focus' : 'break'}>
          <span className="text-5xl font-light text-white tabular-nums tracking-tight">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <CompanionAvatar phase={phase} size="sm" className="mt-3" />
        </AltitudeRing>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-10">
          {isFocus ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                onClick={isPaused ? resume : pause}
              >
                {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full text-white/50 hover:text-white hover:bg-white/10"
                onClick={handleEnd}
              >
                <Square className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                onClick={isPaused ? resume : pause}
              >
                {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full text-white/50 hover:text-white hover:bg-white/10"
                onClick={skipBreak}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Microcopy */}
        <p className="mt-8 text-xs text-white/30">
          {isFocus ? (isPaused ? 'Paused — take a breath' : 'Small steps build the summit') : 'Break well. Return stronger.'}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
