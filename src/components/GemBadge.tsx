import { cn } from '@/lib/utils';
import type { GemType } from '@/lib/storage';

interface GemBadgeProps {
  type: GemType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const gemStyles: Record<GemType, { bg: string; text: string; glow: string }> = {
  Amethyst: {
    bg: 'bg-secondary/20',
    text: 'text-secondary',
    glow: 'shadow-[0_0_12px_hsl(var(--secondary)/0.5)]',
  },
  Emerald: {
    bg: 'bg-primary/20',
    text: 'text-primary',
    glow: 'shadow-[0_0_12px_hsl(var(--primary)/0.5)]',
  },
  Sapphire: {
    bg: 'bg-gem-blue/20',
    text: 'text-gem-blue',
    glow: 'shadow-[0_0_12px_hsl(var(--gem-blue)/0.5)]',
  },
  Ruby: {
    bg: 'bg-gem-ruby/20',
    text: 'text-gem-ruby',
    glow: 'shadow-[0_0_12px_hsl(var(--gem-ruby)/0.5)]',
  },
};

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const GemBadge = ({ type, size = 'md', showLabel = false }: GemBadgeProps) => {
  const style = gemStyles[type];
  
  return (
    <div className={cn('flex items-center gap-2', showLabel && 'glass-button px-2 py-1 rounded-lg')}>
      <div
        className={cn(
          'rounded-md flex items-center justify-center',
          style.bg,
          style.glow,
          sizes[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className={cn('w-3/4 h-3/4', style.text)}
          fill="currentColor"
        >
          <polygon points="12,2 22,9 18,22 6,22 2,9" />
        </svg>
      </div>
      {showLabel && (
        <span className={cn('text-sm font-medium', style.text)}>{type}</span>
      )}
    </div>
  );
};
