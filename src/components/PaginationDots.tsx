import { cn } from '@/lib/utils';

interface PaginationDotsProps {
  total: number;
  current: number;
  onDotClick?: (index: number) => void;
}

export const PaginationDots = ({ total, current, onDotClick }: PaginationDotsProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onDotClick?.(i)}
          className={cn(
            'transition-all duration-300 rounded-full',
            i === current
              ? 'w-8 h-2 bg-primary shadow-neon'
              : 'w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground/60'
          )}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
};
