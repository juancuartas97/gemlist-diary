import { cn } from '@/lib/utils';

interface FacetRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  readonly?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

// Mini gem SVG component
const MiniGem = ({ filled, color, size, onClick }: { 
  filled: boolean; 
  color: string; 
  size: string;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'transition-all duration-200',
      onClick && 'hover:scale-110 cursor-pointer',
      !onClick && 'cursor-default'
    )}
  >
    <svg
      viewBox="0 0 24 24"
      className={cn(size, 'transition-all duration-200')}
      style={{
        filter: filled ? `drop-shadow(0 0 4px ${color})` : 'none',
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

export const FacetRating = ({ 
  value, 
  onChange, 
  readonly = false, 
  color = '#1E8C6A',
  size = 'md' 
}: FacetRatingProps) => {
  const currentValue = value ?? 0;
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((gem) => (
        <MiniGem
          key={gem}
          filled={gem <= currentValue}
          color={color}
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
  color = '#1E8C6A'
}: FacetRatingsGroupProps) => {
  // Calculate aggregate rating
  const values = Object.values(ratings).filter(v => v !== null) as number[];
  const aggregate = values.length > 0 
    ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 
    : null;

  return (
    <div className="space-y-3">
      {Object.entries(ratings).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground w-28">
            {facetLabels[key]}
          </span>
          <FacetRating
            value={value}
            onChange={onChange ? (v) => onChange(key, v) : undefined}
            readonly={readonly}
            color={color}
            size="md"
          />
        </div>
      ))}
      
      {aggregate !== null && (
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <span className="text-sm font-medium text-foreground">
            Overall
          </span>
          <div className="flex items-center gap-2">
            <span 
              className="text-lg font-bold"
              style={{ color }}
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
