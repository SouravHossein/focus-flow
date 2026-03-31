import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const PRESETS = [
  { label: 'Focus', minutes: 25 },
  { label: 'Short Break', minutes: 5 },
  { label: 'Long Break', minutes: 15 },
];

export function PomodoroTimer() {
  const [open, setOpen] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [activePreset, setActivePreset] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds((s) => s - 1), 1000);
    } else {
      clearTimer();
      if (seconds === 0 && running) {
        setRunning(false);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('TaskFlow', { body: `${PRESETS[activePreset].label} session complete!` });
        }
      }
    }
    return clearTimer;
  }, [running, seconds, clearTimer, activePreset]);

  const selectPreset = (i: number) => {
    setActivePreset(i);
    setSeconds(PRESETS[i].minutes * 60);
    setRunning(false);
    clearTimer();
  };

  const reset = () => {
    setSeconds(PRESETS[activePreset].minutes * 60);
    setRunning(false);
    clearTimer();
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = 1 - seconds / (PRESETS[activePreset].minutes * 60);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Timer className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-center">Focus Timer</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center gap-1 mb-4">
          {PRESETS.map((p, i) => (
            <Button
              key={p.label}
              size="sm"
              variant={activePreset === i ? 'default' : 'outline'}
              className="text-xs h-7"
              onClick={() => selectPreset(i)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" strokeWidth="4" className="stroke-muted" />
              <circle
                cx="50" cy="50" r="45" fill="none" strokeWidth="4"
                className="stroke-primary"
                strokeDasharray={`${progress * 283} 283`}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setRunning(!running)}
              className="h-10 w-10"
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="outline" onClick={reset} className="h-10 w-10">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
