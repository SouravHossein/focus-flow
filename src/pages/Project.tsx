import { useParams } from 'react-router-dom';
import { useTasks, useCreateTask } from '@/hooks/use-tasks';
import { useProjects, useDeleteProject } from '@/hooks/use-projects';
import { TaskList } from '@/components/tasks/TaskList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function ProjectPage() {
  const { projectId } = useParams();
  const { data: projects } = useProjects();
  const { data: tasks, isLoading } = useTasks({ projectId });
  const createTask = useCreateTask();
  const deleteProject = useDeleteProject();
  const [newTask, setNewTask] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const project = projects?.find((p) => p.id === projectId);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !projectId) return;
    await createTask.mutateAsync({ title: newTask.trim(), project_id: projectId });
    setNewTask('');
  };

  const handleDelete = async () => {
    if (!projectId) return;
    await deleteProject.mutateAsync(projectId);
    toast({ title: 'Project deleted' });
    navigate('/app/inbox');
  };

  if (!project && !isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {project && (
            <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: project.color }} />
          )}
          <h1 className="text-xl font-bold text-foreground">{project?.name}</h1>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <Input placeholder="Add a task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} className="flex-1" />
        <Button type="submit" size="icon" disabled={!newTask.trim() || createTask.isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <TaskList
        tasks={tasks}
        loading={isLoading}
        emptyTitle="No tasks in this project"
        emptyDescription="Add your first task above"
      />
    </div>
  );
}
