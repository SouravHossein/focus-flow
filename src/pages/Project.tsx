import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigationStore } from '@/stores/navigation-store';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useToggleTask } from '@/hooks/use-tasks';
import { useProjects, useDeleteProject, useUpdateProject } from '@/hooks/use-projects';
import { useSections, useCreateSection, useDeleteSection } from '@/hooks/use-sections';
import { ViewSwitcher } from '@/components/views/ViewSwitcher';
import { ViewRouter } from '@/components/views/ViewRouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Plus, Trash2, Pencil, Archive, ArchiveRestore, FolderPlus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EditProjectDialog } from '@/components/projects/EditProjectDialog';

export default function ProjectPage() {
  const { projectId } = useParams();
  const { data: projects } = useProjects();
  const { data: tasks, isLoading } = useTasks({ projectId });
  const { data: sections } = useSections(projectId);
  const createTask = useCreateTask();
  const createSection = useCreateSection();
  const deleteSection = useDeleteSection();
  const deleteProject = useDeleteProject();
  const updateProject = useUpdateProject();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();
  const [newTask, setNewTask] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [showSectionInput, setShowSectionInput] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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

  const handleArchive = async () => {
    if (!projectId) return;
    await updateProject.mutateAsync({
      id: projectId,
      archived_at: project?.archived_at ? null : new Date().toISOString(),
    });
    toast({ title: project?.archived_at ? 'Project restored' : 'Project archived' });
    if (!project?.archived_at) navigate('/app/inbox');
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim() || !projectId) return;
    await createSection.mutateAsync({ name: newSectionName.trim(), project_id: projectId });
    setNewSectionName('');
    setShowSectionInput(false);
  };

  if (!project && !isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {project && <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: project.color }} />}
          <h1 className="text-xl font-bold text-foreground">{project?.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ViewSwitcher context="project" contextId={projectId} />
          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setEditDialogOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleArchive}>
            {project?.archived_at ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <Input placeholder="Add a task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} className="flex-1" />
        <Button type="submit" size="icon" disabled={!newTask.trim() || createTask.isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <ViewRouter
        tasks={tasks || []}
        context="project"
        contextId={projectId}
        onTaskUpdate={(id, data) => updateTask.mutate({ id, ...data })}
        onTaskDelete={(id) => deleteTask.mutate(id)}
        onTaskComplete={(id, completed) => toggleTask.mutate({ id, completed })}
        isLoading={isLoading}
        project={project}
        sections={sections}
        emptyTitle="No tasks in this project"
        emptyDescription="Add your first task above"
      />

      {/* Sections (only in list view) */}
      {sections?.map((section) => {
        const sectionTasks = tasks?.filter((t) => t.section_id === section.id);
        return (
          <div key={section.id} className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-foreground">{section.name}</h2>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteSection.mutate(section.id)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}

      {/* Add section */}
      <div className="mt-4">
        {showSectionInput ? (
          <form onSubmit={handleAddSection} className="flex gap-2">
            <Input placeholder="Section name" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} autoFocus className="flex-1" />
            <Button type="submit" size="sm" disabled={!newSectionName.trim()}>Add</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowSectionInput(false)}>Cancel</Button>
          </form>
        ) : (
          <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5" onClick={() => setShowSectionInput(true)}>
            <FolderPlus className="h-3.5 w-3.5" />
            Add section
          </Button>
        )}
      </div>

      <EditProjectDialog project={project || null} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
    </div>
  );
}
