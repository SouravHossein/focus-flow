import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { BoardColumn } from './BoardColumn';
import { BoardToolbar } from './BoardToolbar';
import { groupTasks, type GroupMode } from '@/lib/views/board/boardGrouping';
import { Skeleton } from '@/components/ui/skeleton';
import type { ViewProps } from '@/lib/views/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function BoardView({ tasks, sections, onTaskUpdate, onTaskComplete, isLoading }: ViewProps) {
  const [groupMode, setGroupMode] = useState<GroupMode>('status');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const columns = groupTasks(tasks, groupMode, sections);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const overId = over.id as string;

      // Check if dropped on a column
      const targetColumn = columns.find((c) => c.id === overId);
      if (targetColumn && groupMode === 'priority') {
        const priorityMap: Record<string, number> = { p1: 1, p2: 2, p3: 3, p4: 4 };
        const newPriority = priorityMap[targetColumn.id];
        if (newPriority) onTaskUpdate(taskId, { priority: newPriority });
      } else if (targetColumn && groupMode === 'status') {
        if (targetColumn.id === '__unsectioned__') {
          onTaskUpdate(taskId, { section_id: null });
        } else if (targetColumn.id !== 'todo' && targetColumn.id !== 'done') {
          onTaskUpdate(taskId, { section_id: targetColumn.id });
        }
      }
    },
    [columns, groupMode, onTaskUpdate]
  );

  if (isLoading) {
    return (
      <div className="flex gap-4 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-72 shrink-0 rounded-xl bg-muted/40 p-3 space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <BoardToolbar groupMode={groupMode} onGroupModeChange={setGroupMode} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {columns.map((col) => (
              <BoardColumn key={col.id} column={col} onComplete={onTaskComplete} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DndContext>
    </div>
  );
}
