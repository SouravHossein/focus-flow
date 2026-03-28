import { useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { isToday, isPast, startOfDay } from 'date-fns';

export default function DashboardPage() {
  const { data: allTasks } = useTasks({ includeCompleted: true });
  const { data: projects } = useProjects();

  const tasks = allTasks || [];
  const completedToday = tasks.filter((t) => t.completed_at && isToday(new Date(t.completed_at))).length;
  const overdue = tasks.filter((t) => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)) && !t.completed_at).length;
  const dueToday = tasks.filter((t) => t.due_date && isToday(new Date(t.due_date)) && !t.completed_at).length;
  const totalActive = tasks.filter((t) => !t.completed_at).length;

  const stats = [
    { title: 'Completed today', value: completedToday, icon: CheckCircle2, color: 'text-success' },
    { title: 'Due today', value: dueToday, icon: Clock, color: 'text-warning' },
    { title: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-destructive' },
    { title: 'Active tasks', value: totalActive, icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="text-xl font-bold text-foreground mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Your productivity at a glance</p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.title}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {overdue > 0 && (
        <Card className="mt-6 border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Needs attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have {overdue} overdue task{overdue !== 1 ? 's' : ''}. Consider rescheduling or completing them.
            </p>
          </CardContent>
        </Card>
      )}

      {projects && projects.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-foreground mb-3">Project progress</h2>
          <div className="space-y-3">
            {projects.map((project) => {
              const projectTasks = tasks.filter((t) => t.project_id === project.id);
              const completed = projectTasks.filter((t) => t.completed_at).length;
              const total = projectTasks.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div key={project.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: project.color }} />
                      {project.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{completed}/{total}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: project.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
