import { cn } from '@/lib/utils';

interface GemIconProps {
  className?: string;
  glowing?: boolean;
  variant?: 'primary' | 'purple' | 'pink' | 'blue';
}

export const GemIcon = ({ className, glowing = true, variant = 'primary' }: GemIconProps) => {
  const colorClasses = {
    primary: 'fill-primary stroke-primary',
    purple: 'fill-secondary stroke-secondary',
    pink: 'fill-accent stroke-accent',
    blue: 'fill-gem-blue stroke-gem-blue',
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(
        'w-24 h-24',
        glowing && 'drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)]',
        className
      )}
    >
      {/* Main gem shape */}
      <polygon
        points="50,5 95,35 80,95 20,95 5,35"
        className={cn('fill-card/60 stroke-2', colorClasses[variant])}
        strokeOpacity={0.8}
        fillOpacity={0.3}
      />
      {/* Top facet */}
      <polygon
        points="50,5 75,25 50,40 25,25"
        className={cn('fill-current opacity-40', colorClasses[variant])}
      />
      {/* Left facet */}
      <polygon
        points="5,35 25,25 50,40 20,95"
        className={cn('fill-current opacity-20', colorClasses[variant])}
      />
      {/* Right facet */}
      <polygon
        points="95,35 75,25 50,40 80,95"
        className={cn('fill-current opacity-30', colorClasses[variant])}
      />
      {/* Center facet */}
      <polygon
        points="50,40 20,95 80,95"
        className={cn('fill-current opacity-50', colorClasses[variant])}
      />
      {/* Sparkle */}
      <circle
        cx="35"
        cy="30"
        r="3"
        className="fill-foreground/80 animate-pulse-glow"
      />
    </svg>
  );
};
