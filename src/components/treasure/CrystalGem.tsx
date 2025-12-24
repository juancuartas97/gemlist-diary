import { type SetEntry, gemColors } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface CrystalGemProps {
  gem: SetEntry;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const gemGlowColors: Record<string, string> = {
  Emerald: 'hsl(var(--gem-emerald))',
  Sapphire: 'hsl(var(--gem-sapphire))',
  Ruby: 'hsl(var(--gem-ruby))',
  Amethyst: 'hsl(var(--gem-amethyst))',
};

export const CrystalGem = ({ gem, delay = 0, size = 'md', showLabel = true }: CrystalGemProps) => {
  const glowColor = gemGlowColors[gem.gemType] || gemGlowColors.Emerald;
  
  const sizes = {
    sm: 'w-10 h-12',
    md: 'w-14 h-16',
    lg: 'w-18 h-20',
  };

  return (
    <div 
      className="crystal-gem-container group cursor-pointer flex flex-col items-center"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Gem Glow - Outer aura */}
      <div 
        className="absolute blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"
        style={{ 
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 60%)`,
          width: '120%',
          height: '120%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -40%)',
        }}
      />
      
      {/* Crystal Body */}
      <div className={cn(
        "crystal-gem relative transition-all duration-300",
        "group-hover:scale-110 group-hover:-translate-y-2",
        sizes[size]
      )}>
        {/* Glassmorphism Crystal with SVG */}
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-2xl">
          <defs>
            {/* Main glassmorphism gradient */}
            <linearGradient id={`glass-grad-${gem.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="20%" stopColor={glowColor} stopOpacity="0.4" />
              <stop offset="50%" stopColor={glowColor} stopOpacity="0.25" />
              <stop offset="80%" stopColor={glowColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0.2" />
            </linearGradient>
            
            {/* Inner color fill */}
            <linearGradient id={`inner-${gem.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
              <stop offset="50%" stopColor={glowColor} stopOpacity="0.5" />
              <stop offset="100%" stopColor={glowColor} stopOpacity="0.3" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id={`glow-${gem.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Glass blur effect */}
            <filter id={`blur-${gem.id}`}>
              <feGaussianBlur stdDeviation="0.5" />
            </filter>
          </defs>
          
          {/* Background glow shape */}
          <polygon 
            points="50,5 90,25 90,85 50,115 10,85 10,25" 
            fill={glowColor}
            fillOpacity="0.15"
            filter={`url(#glow-${gem.id})`}
          />
          
          {/* Main Crystal Shape - Glassmorphism body */}
          <polygon 
            points="50,5 90,25 90,85 50,115 10,85 10,25" 
            fill={`url(#glass-grad-${gem.id})`}
            stroke="white"
            strokeOpacity="0.3"
            strokeWidth="1"
            className="transition-all duration-300"
          />
          
          {/* Inner color core */}
          <polygon 
            points="50,15 80,30 80,80 50,105 20,80 20,30" 
            fill={`url(#inner-${gem.id})`}
          />
          
          {/* Top Facet - Bright highlight */}
          <polygon 
            points="50,5 90,25 50,45 10,25" 
            fill="white"
            fillOpacity="0.45"
          />
          
          {/* Left Facet - Subtle light */}
          <polygon 
            points="10,25 50,45 50,115 10,85" 
            fill="white"
            fillOpacity="0.15"
          />
          
          {/* Right Facet - Darker */}
          <polygon 
            points="90,25 90,85 50,115 50,45" 
            fill="black"
            fillOpacity="0.1"
          />
          
          {/* Center vertical highlight */}
          <polygon 
            points="45,45 55,45 55,100 50,115 45,100" 
            fill="white"
            fillOpacity="0.15"
          />
          
          {/* Sparkles */}
          <circle cx="35" cy="40" r="4" fill="white" fillOpacity="0.9">
            <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="65" cy="35" r="2.5" fill="white" fillOpacity="0.7">
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="60" r="2" fill="white" fillOpacity="0.5">
            <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
          
          {/* Edge highlight lines */}
          <line x1="50" y1="5" x2="90" y2="25" stroke="white" strokeOpacity="0.5" strokeWidth="1" />
          <line x1="50" y1="5" x2="10" y2="25" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
        </svg>
      </div>

      {/* Reflection on Surface */}
      <div 
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-8 blur-lg opacity-50"
        style={{ background: `radial-gradient(ellipse, ${glowColor} 0%, transparent 70%)` }}
      />

      {/* DJ Label - Always visible */}
      {showLabel && (
        <div className="mt-2 text-center">
          <span className="text-[11px] text-foreground/80 font-medium tracking-wide">{gem.djName}</span>
        </div>
      )}
    </div>
  );
};
