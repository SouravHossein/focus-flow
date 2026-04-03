import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { TaskCheckbox } from '@/components/tasks/TaskCheckbox';
import { useUIStore } from '@/stores/ui-store';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { multiColumnSort, type SortColumn } from '@/lib/views/table/tableSorting';
import type { ViewProps } from '@/lib/views/types';

const COLUMNS = [
  { key: 'title', label: 'Title', width: 'flex-1 min-w-[12rem]' },
  { key: 'priority', label: 'Priority', width: 'w-24' },
  { key: 'due_date', label: 'Due Date', width: 'w-28' },
  { key: 'created_at', label: 'Created', width: 'w-28 hidden md:flex' },
] as const;

export function TableView({ tasks, onTaskUpdate, onTaskComplete, isLoading }: ViewProps) {
  const [sorts, setSorts] = useState<SortColumn[]>([]);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const setTaskDetailId = useUIStore((s) => s.setTaskDetailId);

  const sorted = useMemo(() => multiColumnSort(tasks, sorts), [tasks, sorts]);

  const toggleSort = useCallback((field: string) => {
    setSorts((prev) => {
      const existing = prev.find((s) => s.field === field);
      if (!existing) return [{ field, direction: 'asc' as const }];
      if (existing.direction === 'asc') return prev.map((s) => s.field === field ? { ...s, direction: 'desc' as const } : s);
      return prev.filter((s) => s.field !== field);
    });
  }, []);

  const handleInlineEdit = (taskId: string, field: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    setEditingCell({ id: taskId, field });
    setEditValue(String((task as any)[field] || ''));
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const updates: Record<string, any> = {};
    if (editingCell.field === 'title') updates.title = editValue;
    onTaskUpdate(editingCell.id, updates);
    setEditingCell(null);
  };

  if (isLoading) {
    return <div className="space-y-2"><Skeleton className="h-10 w-full" />{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}</div>;
  }

  if (sorted.length === 0) {
    return <div className="py-16 text-center text-sm text-muted-foreground">No tasks to display</div>;
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="flex items-center bg-muted/50 border-b">
        <div className="w-8 shrink-0" />
        {COLUMNS.map((col) => {
          const sort = sorts.find((s) => s.field === col.key);
          return (
            <button
              key={col.key}
              className={cn('flex items-center gap-1 px-2 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground', col.width)}
              onClick={() => toggleSort(col.key)}
            >
              {col.label}
              {sort && (sort.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
          );
        })}
        <div className="w-10 shrink-0" />
      </div>

      {/* Rows */}
      <div className="divide-y">
        {sorted.map((task) => (
          <div key={task.id} className="flex items-center hover:bg-accent/30 group">
            <div className="w-8 flex items-center justify-center shrink-0" onClick={(e) => e.stopPropagation()}>
              <TaskCheckbox
                checked={!!task.completed_at}
                priority={task.priority}
                onToggle={() => onTaskComplete(task.id, !task.completed_at)}
              />
            </div>

            {/* Title */}
            <div className={cn('px-2 py-1.5', COLUMNS[0].width)}>
              {editingCell?.id === task.id && editingCell?.field === 'title' ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
                  className="h-7 text-sm"
                  autoFocus
                />
              ) : (
                <span
                  className={cn('text-sm cursor-pointer', task.completed_at && 'line-through text-muted-foreground')}
                  onDoubleClick={() => handleInlineEdit(task.id, 'title')}
                >
                  {task.title}
                </span>
              )}
            </div>

            {/* Priority */}
            <div className={cn('px-2', COLUMNS[1].width)}>
              <Select
                value={String(task.priority)}
                onValueChange={(v) => onTaskUpdate(task.id, { priority: Number(v) })}
              >
                <SelectTrigger className="h-6 w-16 text-[10px] border-none bg-transparent">
                  <span>{['', '🔴 P1', '🟠 P2', '🔵 P3', '⚪ P4'][task.priority] || '⚪ P4'}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">🔴 P1</SelectItem>
                  <SelectItem value="2">🟠 P2</SelectItem>
                  <SelectItem value="3">🔵 P3</SelectItem>
                  <SelectItem value="4">⚪ P4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className={cn('px-2 text-xs text-muted-foreground', COLUMNS[2].width)}>
              {task.due_date ? format(new Date(task.due_date), 'MMM d') : '—'}
            </div>

            {/* Created */}
            <div className={cn('px-2 text-xs text-muted-foreground', COLUMNS[3].width)}>
              {format(new Date(task.created_at), 'MMM d')}
            </div>

            {/* Open detail */}
            <div className="w-10 shrink-0 flex justify-center">
              <button
                className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setTaskDetailId(task.id)}
              >
                →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
