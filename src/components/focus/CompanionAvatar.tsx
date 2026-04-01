import { cn } from '@/lib/utils';
import type { SessionPhase } from '@/stores/focus-store';

interface CompanionAvatarProps {
  phase: SessionPhase;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CompanionAvatar({ phase, size = 'md', className }: CompanionAvatarProps) {
  const sizeMap = { sm: 'w-8 h-8 text-lg', md: 'w-14 h-14 text-2xl', lg: 'w-20 h-20 text-4xl' };

  const emoji = phase === 'break' ? '🏮' : phase === 'recap' ? '✨' : '🔥';

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        sizeMap[size],
        phase === 'focus' && 'animate-pulse',
        phase === 'break' && 'opacity-60',
        phase === 'recap' && 'animate-bounce',
        className
      )}
    >
      <span role="img" aria-label="companion">{emoji}</span>
    </div>
  );
}
