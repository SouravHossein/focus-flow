import { getViewsForContext, type ViewContext, type ViewId } from '@/lib/views/viewRegistry';
import { useViewPreferenceStore } from '@/stores/view-preference-store';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ViewSwitcherProps {
  context: ViewContext;
  contextId?: string | null;
}

export function ViewSwitcher({ context, contextId }: ViewSwitcherProps) {
  const views = getViewsForContext(context);
  const activeView = useViewPreferenceStore((s) => s.getViewType(context, contextId));
  const setViewType = useViewPreferenceStore((s) => s.setViewType);

  if (views.length <= 1) return null;

  return (
    <div className="flex gap-0.5 rounded-lg border p-0.5">
      {views.map((view) => (
        <Tooltip key={view.id}>
          <TooltipTrigger asChild>
            <Button
              variant={activeView === view.id ? 'secondary' : 'ghost'}
              size="sm"
              className={cn('h-7 w-7 p-0')}
              onClick={() => setViewType(context, contextId, view.id)}
            >
              <view.icon className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">{view.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
