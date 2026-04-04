import { useLocation, useParams, Link } from 'react-router-dom';
import { useProjects } from '@/hooks/use-projects';
import { useLabels } from '@/hooks/use-labels';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs() {
  const location = useLocation();
  const params = useParams();
  const { data: projects } = useProjects();
  const { data: labels } = useLabels();

  const crumbs = resolveCrumbs(location.pathname, params, projects, labels);

  if (crumbs.length <= 1) return null;

  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <BreadcrumbItem key={i}>
              {i > 0 && <BreadcrumbSeparator />}
              {isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.href || '/app/inbox'}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function resolveCrumbs(
  pathname: string,
  params: Record<string, string | undefined>,
  projects?: any[],
  labels?: any[]
): Crumb[] {
  const crumbs: Crumb[] = [{ label: 'Home', href: '/app/inbox' }];

  if (pathname.startsWith('/app/inbox')) {
    crumbs.push({ label: 'Inbox' });
  } else if (pathname.startsWith('/app/today')) {
    crumbs.push({ label: 'Today' });
  } else if (pathname.startsWith('/app/upcoming')) {
    crumbs.push({ label: 'Upcoming' });
  } else if (pathname.startsWith('/app/overdue')) {
    crumbs.push({ label: 'Overdue' });
  } else if (pathname.startsWith('/app/completed')) {
    crumbs.push({ label: 'Completed' });
  } else if (pathname.startsWith('/app/myday')) {
    crumbs.push({ label: 'My Day' });
  } else if (pathname.startsWith('/app/dashboard')) {
    crumbs.push({ label: 'Dashboard' });
  } else if (pathname.startsWith('/app/activity')) {
    crumbs.push({ label: 'Activity' });
  } else if (pathname.startsWith('/app/focus')) {
    crumbs.push({ label: 'Focus' });
  } else if (pathname.startsWith('/app/journey')) {
    crumbs.push({ label: 'Journey' });
  } else if (pathname.startsWith('/app/project/') && params.projectId) {
    const project = projects?.find((p) => p.id === params.projectId);
    crumbs.push({ label: project?.name || 'Project' });
  } else if (pathname.startsWith('/app/label/') && params.labelId) {
    const label = labels?.find((l) => l.id === params.labelId);
    crumbs.push({ label: 'Labels', href: '/app/inbox' });
    crumbs.push({ label: label?.name || 'Label' });
  } else if (pathname.startsWith('/app/filter/')) {
    crumbs.push({ label: 'Filters' });
  } else if (pathname.startsWith('/app/settings')) {
    crumbs.push({ label: 'Settings', href: '/app/settings' });
    if (pathname.includes('/templates')) {
      crumbs.push({ label: 'Templates' });
    }
  }

  return crumbs;
}
