import { useState } from 'react';
import { useTaskComments, useCreateComment, useDeleteComment } from '@/hooks/use-task-comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { data: comments, isLoading } = useTaskComments(taskId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await createComment.mutateAsync({ taskId, content: content.trim() });
    setContent('');
  };

  return (
    <div className="border-t pt-4">
      <h4 className="mb-2 text-sm font-medium">Comments</h4>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="group rounded-md bg-muted/50 px-3 py-2">
              <p className="text-sm text-foreground whitespace-pre-wrap">{c.content}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteComment.mutate({ id: c.id, taskId })}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-xs text-muted-foreground">No comments yet</p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[60px] resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 shrink-0 self-end" disabled={!content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
