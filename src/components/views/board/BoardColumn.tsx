import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BoardCard } from './BoardCard';
import { cn } from '@/lib/utils';
import type { BoardColumn as BoardColumnType } from '@/lib/views/board/boardGrouping';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BoardColumnProps {
  column: BoardColumnType;
  onComplete: (id: string, completed: boolean) => void;
}

export function BoardColumn({ column, onComplete }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-xl bg-muted/40 border',
        isOver && 'border-primary/50 bg-primary/5'
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b">
        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: column.color }} />
        <span className="text-sm font-semibold truncate">{column.title}</span>
        <span className="ml-auto text-xs text-muted-foreground rounded-full bg-muted px-1.5 py-0.5">
          {column.tasks.length}
        </span>
      </div>
      <ScrollArea className="flex-1 max-h-[calc(100vh-14rem)]">
        <div ref={setNodeRef} className="flex flex-col gap-2 p-2 min-h-[4rem]">
          <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {column.tasks.map((task) => (
              <BoardCard key={task.id} task={task} onComplete={onComplete} />
            ))}
          </SortableContext>
          {column.tasks.length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground">No tasks</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
