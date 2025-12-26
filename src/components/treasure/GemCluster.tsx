import { useState } from 'react';
import { UserGem } from '@/hooks/useGemData';
import { cn } from '@/lib/utils';

interface GemClusterProps {
  gems: UserGem[];
  onClusterClick?: (gems: UserGem[]) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { container: 'w-12 h-12', gem: 'w-6 h-6' },
  md: { container: 'w-16 h-16', gem: 'w-8 h-8' },
  lg: { container: 'w-20 h-20', gem: 'w-10 h-10' },
};

// Mini brilliant-cut diamond component
const BrilliantGem = ({ 
  color, 
  size, 
  offset,
  delay,
  zIndex
}: { 
  color: string; 
  size: string;
  offset: { x: number; y: number; rotate: number };
  delay: number;
  zIndex: number;
}) => (
  <div
    className="absolute transition-all duration-300"
    style={{
      transform: `translate(${offset.x}px, ${offset.y}px) rotate(${offset.rotate}deg)`,
      zIndex,
      animationDelay: `${delay}ms`,
    }}
  >
    <svg viewBox="0 0 32 40" className={cn(size, 'drop-shadow-lg')}>
      <defs>
        <linearGradient id={`gem-gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`${color}ff`} />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor={`${color}aa`} />
        </linearGradient>
        <filter id={`gem-glow-${color}`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feFlood floodColor={color} floodOpacity="0.5" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Main gem body */}
      <path
        d="M16 2L4 12L16 38L28 12L16 2Z"
        fill={`url(#gem-gradient-${color})`}
        filter={`url(#gem-glow-${color})`}
        opacity="0.95"
      />
      
      {/* Crown facets */}
      <path
        d="M16 2L4 12H28L16 2Z"
        fill="rgba(255,255,255,0.25)"
      />
      
      {/* Left pavilion */}
      <path
        d="M4 12L16 38L16 12H4Z"
        fill="rgba(0,0,0,0.15)"
      />
      
      {/* Inner sparkle */}
      <path
        d="M16 8L10 12H22L16 8Z"
        fill="rgba(255,255,255,0.4)"
      />
      
      {/* Table highlight */}
      <ellipse
        cx="16"
        cy="7"
        rx="4"
        ry="2"
        fill="rgba(255,255,255,0.6)"
        className="animate-pulse"
        style={{ animationDuration: '2s' }}
      />
    </svg>
  </div>
);

// Calculate cluster positions based on gem count
const getClusterOffsets = (count: number): { x: number; y: number; rotate: number }[] => {
  if (count === 1) {
    return [{ x: 0, y: 0, rotate: 0 }];
  }
  if (count === 2) {
    return [
      { x: -6, y: 2, rotate: -8 },
      { x: 6, y: -2, rotate: 8 },
    ];
  }
  if (count === 3) {
    return [
      { x: 0, y: -4, rotate: 0 },
      { x: -8, y: 4, rotate: -12 },
      { x: 8, y: 4, rotate: 12 },
    ];
  }
  if (count === 4) {
    return [
      { x: -6, y: -4, rotate: -6 },
      { x: 6, y: -4, rotate: 6 },
      { x: -8, y: 5, rotate: -10 },
      { x: 8, y: 5, rotate: 10 },
    ];
  }
  // For 5+ gems, create a more dynamic cluster
  return [
    { x: 0, y: -6, rotate: 0 },
    { x: -10, y: 0, rotate: -15 },
    { x: 10, y: 0, rotate: 15 },
    { x: -6, y: 7, rotate: -8 },
    { x: 6, y: 7, rotate: 8 },
  ].slice(0, Math.min(count, 5));
};

export const GemCluster = ({ gems, onClusterClick, size = 'md' }: GemClusterProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const offsets = getClusterOffsets(gems.length);
  const primaryGem = gems[0];
  const color = primaryGem.genre?.color_hex || '#1E8C6A';
  const djName = primaryGem.dj?.stage_name || 'Unknown';

  const handleClick = () => {
    onClusterClick?.(gems);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative flex items-center justify-center transition-transform duration-300',
        sizes[size].container,
        isHovered && 'scale-110',
        onClusterClick && 'cursor-pointer'
      )}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-30 transition-opacity duration-300"
        style={{ 
          backgroundColor: color,
          opacity: isHovered ? 0.5 : 0.3,
        }}
      />
      
      {/* Gems */}
      {gems.slice(0, 5).map((gem, index) => (
        <BrilliantGem
          key={gem.id}
          color={gem.genre?.color_hex || color}
          size={sizes[size].gem}
          offset={offsets[index] || offsets[0]}
          delay={index * 100}
          zIndex={gems.length - index}
        />
      ))}

      {/* Count badge for 5+ gems */}
      {gems.length > 5 && (
        <div 
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white z-10"
          style={{ backgroundColor: color }}
        >
          {gems.length}
        </div>
      )}

      {/* Hover tooltip */}
      {isHovered && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs border border-border/30 z-20">
          {djName} × {gems.length}
        </div>
      )}
    </button>
  );
};
