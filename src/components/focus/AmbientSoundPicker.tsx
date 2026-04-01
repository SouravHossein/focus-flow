import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX } from 'lucide-react';

export const AMBIENT_SOUNDS = [
  { id: 'silence', label: 'Silence', emoji: '🔇' },
  { id: 'rain', label: 'Rain', emoji: '🌧️' },
  { id: 'wind', label: 'Wind', emoji: '💨' },
  { id: 'fireplace', label: 'Fireplace', emoji: '🔥' },
  { id: 'coffee', label: 'Coffee Shop', emoji: '☕' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊' },
  { id: 'white-noise', label: 'White Noise', emoji: '📻' },
  { id: 'night', label: 'Night', emoji: '🌙' },
] as const;

interface AmbientSoundPickerProps {
  selected: string | null;
  onSelect: (sound: string | null) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  compact?: boolean;
}

export function AmbientSoundPicker({ selected, onSelect, volume, onVolumeChange, compact }: AmbientSoundPickerProps) {
  return (
    <div className="space-y-3">
      <div className={cn('grid gap-2', compact ? 'grid-cols-4' : 'grid-cols-4')}>
        {AMBIENT_SOUNDS.map((sound) => (
          <Button
            key={sound.id}
            variant={selected === sound.id ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'flex flex-col h-auto py-2 px-1 text-xs gap-1',
              selected === sound.id && 'ring-2 ring-primary/30'
            )}
            onClick={() => onSelect(sound.id === 'silence' ? null : sound.id === selected ? null : sound.id)}
          >
            <span className="text-base">{sound.emoji}</span>
            {!compact && <span className="text-[10px] leading-tight">{sound.label}</span>}
          </Button>
        ))}
      </div>
      {selected && selected !== 'silence' && (
        <div className="flex items-center gap-2">
          <VolumeX className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Slider
            value={[volume * 100]}
            onValueChange={([v]) => onVolumeChange(v / 100)}
            max={100}
            step={5}
            className="flex-1"
          />
          <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>
      )}
    </div>
  );
}
