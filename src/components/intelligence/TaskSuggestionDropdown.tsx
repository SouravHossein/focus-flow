import { cn } from '@/lib/utils';
import type { TaskSuggestion } from '@/lib/intelligence/suggestionEngine';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface Props {
  suggestions: TaskSuggestion[];
  selectedIndex: number;
  onSelect: (s: TaskSuggestion) => void;
}

export function TaskSuggestionDropdown({ suggestions, selectedIndex, onSelect }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md animate-in fade-in-0 zoom-in-95">
      {suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          className={cn(
            'flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-accent/50',
            i === selectedIndex && 'bg-accent'
          )}
          onMouseDown={(e) => { e.preventDefault(); onSelect(s); }}
        >
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium">{s.title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {s.projectName && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{s.projectName}</span>
              )}
              {s.labels.map((l) => (
                <span
                  key={l.id}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: l.color + '20', color: l.color }}
                >
                  {l.name}
                </span>
              ))}
              {s.priority < 4 && (
                <span className="text-[10px] text-muted-foreground">P{s.priority}</span>
              )}
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">{s.reason}</p>
            </TooltipContent>
          </Tooltip>
        </button>
      ))}
    </div>
  );
}
