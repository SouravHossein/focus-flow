import { cn } from '@/lib/utils';
import { getTierFromAltitude } from '@/hooks/use-journey';

interface TierBadgeProps {
  altitude: number;
  className?: string;
}

export function TierBadge({ altitude, className }: TierBadgeProps) {
  const tier = getTierFromAltitude(altitude);
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary', className)}>
      {tier.emoji} {tier.name}
    </span>
  );
}
