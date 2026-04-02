import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { parseTaskInput, type ParsedTaskInput, type ParsedToken } from '@/lib/nlp/parseTaskInput';
import { TaskSuggestionDropdown } from './TaskSuggestionDropdown';
import { useTaskSuggestions } from '@/hooks/useTaskSuggestions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface NLPTaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onParsed: (parsed: ParsedTaskInput) => void;
  onSubmit?: () => void;
  onTemplateTriggered?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

const TOKEN_COLORS: Record<string, string> = {
  date: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  time: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  priority: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  label: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  project: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  recurrence: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
};

export function NLPTaskInput({
  value,
  onChange,
  onParsed,
  onSubmit,
  onTemplateTriggered,
  autoFocus,
  placeholder = 'Task name (try "Buy milk tomorrow p1 #shopping")',
  className,
}: NLPTaskInputProps) {
  const [parsed, setParsed] = useState<ParsedTaskInput | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useTaskSuggestions(value);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        const result = parseTaskInput(value);
        setParsed(result);
        onParsed(result);
      } else {
        setParsed(null);
      }
    }, 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, onParsed]);

  useEffect(() => {
    setShowSuggestions(value.length >= 2 && suggestions.length > 0);
    setSelectedSuggestion(-1);
  }, [value, suggestions.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion((prev) => Math.max(prev - 1, -1));
        return;
      }
      if (e.key === 'Enter' && selectedSuggestion >= 0) {
        e.preventDefault();
        const s = suggestions[selectedSuggestion];
        onChange(s.title);
        setShowSuggestions(false);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }
    if (e.key === 'Enter') {
      onSubmit?.();
    }
    // Template trigger
    if (value === '' && e.key === '/') {
      onTemplateTriggered?.();
    }
  };

  const formatTokenValue = (token: ParsedToken): string => {
    switch (token.type) {
      case 'date': return format(token.value as Date, 'MMM d');
      case 'time': return token.value;
      case 'priority': return `P${token.value}`;
      case 'label': return `#${token.value}`;
      case 'project': return token.value;
      case 'recurrence': return token.text;
      default: return token.text;
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => value.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={cn('text-base', className)}
      />

      {/* Token preview chips */}
      {parsed && parsed.tokens.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {parsed.tokens.map((token, i) => (
            <Badge
              key={i}
              variant="secondary"
              className={cn('text-[10px] px-1.5 py-0 h-5 font-normal', TOKEN_COLORS[token.type])}
            >
              {formatTokenValue(token)}
            </Badge>
          ))}
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <TaskSuggestionDropdown
          suggestions={suggestions}
          selectedIndex={selectedSuggestion}
          onSelect={(s) => {
            onChange(s.title);
            setShowSuggestions(false);
          }}
        />
      )}
    </div>
  );
}
