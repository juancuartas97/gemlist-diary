import { cn } from '@/lib/utils';

interface FacetRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

// Color scale from red (1) to green (5)
const getRatingColor = (rating: number): string => {
  const colors = [
    '#EF4444', // 1 - Red
    '#F97316', // 2 - Orange
    '#EAB308', // 3 - Yellow
    '#84CC16', // 4 - Lime
    '#22C55E', // 5 - Green
  ];
  return colors[rating - 1] || '#6B7280';
};

// Mini gem SVG component with color scale
const MiniGem = ({ filled, rating, size, onClick }: { 
  filled: boolean; 
  rating: number;
  size: string;
  onClick?: () => void;
}) => {
  const color = filled ? getRatingColor(rating) : undefined;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'transition-all duration-200 p-1.5 rounded-lg',
        onClick && 'hover:scale-110 hover:bg-white/5 cursor-pointer active:scale-95',
        !onClick && 'cursor-default'
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn(size, 'transition-all duration-200')}
        style={{
          filter: filled ? `drop-shadow(0 0 6px ${color})` : 'none',
        }}
      >
        {/* Diamond shape */}
        <path
          d="M12 2L3 9L12 22L21 9L12 2Z"
          fill={filled ? color : 'transparent'}
          stroke={filled ? color : 'hsl(var(--muted-foreground) / 0.3)'}
          strokeWidth="1.5"
          opacity={filled ? 1 : 0.4}
        />
        {/* Top facet highlight */}
        <path
          d="M12 2L3 9H21L12 2Z"
          fill={filled ? 'rgba(255,255,255,0.3)' : 'transparent'}
        />
        {/* Center line */}
        <path
          d="M12 9V22"
          stroke={filled ? 'rgba(255,255,255,0.2)' : 'transparent'}
          strokeWidth="0.5"
        />
      </svg>
    </button>
  );
};

export const FacetRating = ({ 
  value, 
  onChange, 
  readonly = false, 
  size = 'md' 
}: FacetRatingProps) => {
  const currentValue = value ?? 0;
  
  return (
    <div className="flex items-center gap-0">
      {[1, 2, 3, 4, 5].map((gem) => (
        <MiniGem
          key={gem}
          filled={gem <= currentValue}
          rating={gem}
          size={sizes[size]}
          onClick={!readonly ? () => onChange?.(gem) : undefined}
        />
      ))}
    </div>
  );
};

interface FacetRatingsGroupProps {
  ratings: {
    sound_quality: number | null;
    energy: number | null;
    performance: number | null;
    crowd: number | null;
  };
  onChange?: (category: string, value: number) => void;
  readonly?: boolean;
  color?: string;
}

const facetLabels: Record<string, string> = {
  sound_quality: 'Sound Quality',
  energy: 'Energy',
  performance: 'Performance',
  crowd: 'Crowd',
};

export const FacetRatingsGroup = ({ 
  ratings, 
  onChange, 
  readonly = false,
}: FacetRatingsGroupProps) => {
  // Calculate aggregate rating
  const values = Object.values(ratings).filter(v => v !== null) as number[];
  const aggregate = values.length > 0 
    ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 
    : null;

  const aggregateColor = aggregate ? getRatingColor(Math.round(aggregate)) : '#6B7280';

  return (
    <div className="space-y-4">
      {Object.entries(ratings).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground min-w-[100px]">
            {facetLabels[key]}
          </span>
          <FacetRating
            value={value}
            onChange={onChange ? (v) => onChange(key, v) : undefined}
            readonly={readonly}
            size="md"
          />
        </div>
      ))}
      
      {aggregate !== null && (
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <span className="text-sm font-medium text-foreground">
            Overall
          </span>
          <div className="flex items-center gap-2">
            <span 
              className="text-xl font-bold"
              style={{ color: aggregateColor }}
            >
              {aggregate.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">/ 5</span>
          </div>
        </div>
      )}
    </div>
  );
};
