import { cn } from '@/lib/utils';

interface AltitudeRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  className?: string;
  phase?: 'focus' | 'break';
}

export function AltitudeRing({
  progress,
  size = 240,
  strokeWidth = 6,
  children,
  className,
  phase = 'focus',
}: AltitudeRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <div className={cn('relative flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={phase === 'focus' ? 'hsl(var(--primary))' : 'hsl(var(--success))'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
          style={{
            filter: phase === 'focus'
              ? 'drop-shadow(0 0 8px hsl(var(--primary) / 0.4))'
              : 'drop-shadow(0 0 8px hsl(var(--success) / 0.3))',
          }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
