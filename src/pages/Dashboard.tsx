import { useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { isToday, isPast, subDays, startOfDay, format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

const PRIORITY_COLORS = ['hsl(4,90%,58%)', 'hsl(25,95%,53%)', 'hsl(217,91%,60%)', 'hsl(220,10%,70%)'];

export default function DashboardPage() {
  const { data: allTasks } = useTasks({ includeCompleted: true });
  const { data: projects } = useProjects();

  const tasks = allTasks || [];
  const completedToday = tasks.filter((t) => t.completed_at && isToday(new Date(t.completed_at))).length;
  const overdue = tasks.filter((t) => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)) && !t.completed_at).length;
  const dueToday = tasks.filter((t) => t.due_date && isToday(new Date(t.due_date)) && !t.completed_at).length;
  const totalActive = tasks.filter((t) => !t.completed_at).length;

  // Completion trend (last 7 days)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(day);
    const count = tasks.filter((t) => {
      if (!t.completed_at) return false;
      const comp = startOfDay(new Date(t.completed_at));
      return comp.getTime() === dayStart.getTime();
    }).length;
    return { day: format(day, 'EEE'), count };
  });

  // Priority distribution
  const priorityData = [1, 2, 3, 4].map((p) => ({
    name: `P${p}`,
    value: tasks.filter((t) => !t.completed_at && t.priority === p).length,
    color: PRIORITY_COLORS[p - 1],
  })).filter((d) => d.value > 0);

  // Overdue tasks list
  const overdueTasks = tasks.filter((t) => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)) && !t.completed_at).slice(0, 5);

  // Streak calculation
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = startOfDay(subDays(new Date(), i));
    const hasCompletion = tasks.some((t) => t.completed_at && startOfDay(new Date(t.completed_at)).getTime() === day.getTime());
    if (hasCompletion) streak++;
    else break;
  }

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

      {/* Streak */}
      {streak > 0 && (
        <Card className="mt-4">
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm font-medium">{streak}-day streak!</p>
              <p className="text-xs text-muted-foreground">Keep completing tasks every day</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Completion trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={trendData}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                  cursor={{ fill: 'hsl(var(--accent))' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Priority distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8">No active tasks</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Needs attention */}
      {overdueTasks.length > 0 && (
        <Card className="mt-4 border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Needs attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {overdueTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{t.title}</span>
                  <span className="text-xs text-destructive shrink-0 ml-2">
                    {t.due_date && format(new Date(t.due_date), 'MMM d')}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Project progress */}
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
