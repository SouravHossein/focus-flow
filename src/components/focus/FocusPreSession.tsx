import { useState } from 'react';
import { useFocusStore } from '@/stores/focus-store';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/use-tasks';
import { useCreateFocusSession } from '@/hooks/use-focus-sessions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AmbientSoundPicker } from './AmbientSoundPicker';
import { Mountain, Play } from 'lucide-react';

const PRESETS = [
  { label: '25 / 5', focus: 25, brk: 5 },
  { label: '50 / 10', focus: 50, brk: 10 },
  { label: '90 / 20', focus: 90, brk: 20 },
];

export function FocusPreSession() {
  const { preSessionOpen, closePreSession, startSession, preSessionTaskId, preSessionTaskTitle } = useFocusStore();
  const { profile } = useAuth();
  const { data: tasks } = useTasks({});
  const createSession = useCreateFocusSession();

  const [focusMin, setFocusMin] = useState(profile?.focus_default_minutes || 25);
  const [breakMin, setBreakMin] = useState(profile?.break_default_minutes || 5);
  const [taskId, setTaskId] = useState<string | null>(preSessionTaskId);
  const [taskTitle, setTaskTitle] = useState<string | null>(preSessionTaskTitle);
  const [sound, setSound] = useState<string | null>(profile?.ambient_sound_preference || null);
  const [volume, setVolume] = useState(0.5);
  const [tag, setTag] = useState('');
  const [notes, setNotes] = useState('');

  // Sync preSession props when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (!open) closePreSession();
    else {
      setTaskId(preSessionTaskId);
      setTaskTitle(preSessionTaskTitle);
      setFocusMin(profile?.focus_default_minutes || 25);
      setBreakMin(profile?.break_default_minutes || 5);
    }
  };

  const handleStart = async () => {
    const session = await createSession.mutateAsync({
      task_id: taskId,
      duration_seconds: focusMin * 60,
      focus_minutes: focusMin,
      break_minutes: breakMin,
      session_type: 'focus',
      notes: notes || undefined,
      session_tag: tag || null,
      ambient_sound: sound,
      strict_mode: false,
    });

    startSession({
      taskId,
      taskTitle: taskTitle || activeTasks?.find(t => t.id === taskId)?.title || null,
      focusMinutes: focusMin,
      breakMinutes: breakMin,
      ambientSound: sound,
      strictMode: false,
      sessionTag: tag || null,
      notes,
    });

    useFocusStore.getState().setSessionId(session.id);
  };

  const activeTasks = tasks?.filter(t => !t.completed_at);

  return (
    <Dialog open={preSessionOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-primary" />
            Ready to climb?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Task selector */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Task (optional)</label>
            <Select value={taskId || '_none'} onValueChange={(v) => {
              setTaskId(v === '_none' ? null : v);
              setTaskTitle(activeTasks?.find(t => t.id === v)?.title || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="No task — free focus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">No task — free focus</SelectItem>
                {activeTasks?.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration presets */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Duration</label>
            <div className="flex gap-2">
              {PRESETS.map(p => (
                <Button
                  key={p.label}
                  variant={focusMin === p.focus ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => { setFocusMin(p.focus); setBreakMin(p.brk); }}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground">Focus (min)</label>
                <Input
                  type="number"
                  min={1}
                  max={180}
                  value={focusMin}
                  onChange={e => setFocusMin(Number(e.target.value))}
                  className="h-8"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground">Break (min)</label>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={breakMin}
                  onChange={e => setBreakMin(Number(e.target.value))}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          {/* Ambient sound */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Ambient Sound</label>
            <AmbientSoundPicker selected={sound} onSelect={setSound} volume={volume} onVolumeChange={setVolume} compact />
          </div>

          {/* Tag */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Session tag (optional)</label>
            <Select value={tag || '_none'} onValueChange={v => setTag(v === '_none' ? '' : v)}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                <SelectItem value="study">📚 Study</SelectItem>
                <SelectItem value="work">💼 Work</SelectItem>
                <SelectItem value="coding">💻 Coding</SelectItem>
                <SelectItem value="reading">📖 Reading</SelectItem>
                <SelectItem value="writing">✍️ Writing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start button */}
          <Button className="w-full h-12 text-base gap-2" onClick={handleStart} disabled={createSession.isPending}>
            <Play className="h-5 w-5" />
            Begin Session
          </Button>

          <p className="text-center text-xs text-muted-foreground">One session at a time. You've got this.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
