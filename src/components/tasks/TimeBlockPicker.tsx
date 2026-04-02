import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  blockDate?: string;
  startTime?: string;
  endTime?: string;
  onSave: (block: { block_date: string; start_time: string; end_time: string }) => void;
  onRemove?: () => void;
}

export function TimeBlockPicker({ blockDate, startTime, endTime, onSave, onRemove }: Props) {
  const [date, setDate] = useState(blockDate || format(new Date(), 'yyyy-MM-dd'));
  const [start, setStart] = useState(startTime || '09:00');
  const [end, setEnd] = useState(endTime || '09:30');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {startTime ? `${startTime.slice(0, 5)} – ${endTime?.slice(0, 5)}` : 'Time block'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-3" align="end">
        <div>
          <Label className="text-xs">Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-7 text-xs mt-1" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-xs">Start</Label>
            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="h-7 text-xs mt-1" />
          </div>
          <div className="flex-1">
            <Label className="text-xs">End</Label>
            <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="h-7 text-xs mt-1" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => onSave({ block_date: date, start_time: start, end_time: end })}>
            Save
          </Button>
          {onRemove && (
            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={onRemove}>
              Remove
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
