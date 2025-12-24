import { type SetEntry, gemColors } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface CrystalGemProps {
  gem: SetEntry;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
}

const gemGlowColors: Record<string, string> = {
  Emerald: 'hsl(var(--gem-emerald))',
  Sapphire: 'hsl(var(--gem-sapphire))',
  Ruby: 'hsl(var(--gem-ruby))',
  Amethyst: 'hsl(var(--gem-amethyst))',
};

const gemGradients: Record<string, string> = {
  Emerald: 'from-emerald-300 via-emerald-500 to-emerald-700',
  Sapphire: 'from-blue-300 via-blue-500 to-blue-700',
  Ruby: 'from-red-300 via-red-500 to-red-700',
  Amethyst: 'from-purple-300 via-purple-500 to-purple-700',
};

export const CrystalGem = ({ gem, delay = 0, size = 'md' }: CrystalGemProps) => {
  const glowColor = gemGlowColors[gem.gemType] || gemGlowColors.Emerald;
  const gradient = gemGradients[gem.gemType] || gemGradients.Emerald;
  
  const sizes = {
    sm: 'w-10 h-12',
    md: 'w-14 h-16',
    lg: 'w-18 h-20',
  };

  return (
    <div 
      className="crystal-gem-container group cursor-pointer"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Gem Glow */}
      <div 
        className="absolute inset-0 blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"
        style={{ 
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          transform: 'translateY(20%) scale(1.5)'
        }}
      />
      
      {/* Crystal Body */}
      <div className={cn(
        "crystal-gem relative transition-all duration-300",
        "group-hover:scale-110 group-hover:-translate-y-2",
        sizes[size]
      )}>
        {/* Faceted Shape - Hexagonal Crystal */}
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`gem-grad-${gem.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="30%" stopColor={glowColor} stopOpacity="0.8" />
              <stop offset="70%" stopColor={glowColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor="black" stopOpacity="0.3" />
            </linearGradient>
            <filter id={`glow-${gem.id}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Main Crystal Shape */}
          <polygon 
            points="50,0 95,25 95,85 50,120 5,85 5,25" 
            fill={`url(#gem-grad-${gem.id})`}
            filter={`url(#glow-${gem.id})`}
            className="transition-all duration-300"
          />
          
          {/* Top Facet */}
          <polygon 
            points="50,0 95,25 50,40 5,25" 
            fill="white"
            fillOpacity="0.3"
          />
          
          {/* Left Facet */}
          <polygon 
            points="5,25 50,40 50,120 5,85" 
            fill="white"
            fillOpacity="0.1"
          />
          
          {/* Internal Sparkle */}
          <circle cx="40" cy="45" r="3" fill="white" fillOpacity="0.8" />
          <circle cx="60" cy="35" r="2" fill="white" fillOpacity="0.6" />
        </svg>
      </div>

      {/* Reflection on Surface */}
      <div 
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-6 blur-md opacity-40"
        style={{ background: `radial-gradient(ellipse, ${glowColor} 0%, transparent 70%)` }}
      />

      {/* Label */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[10px] text-foreground/70 font-medium">{gem.djName}</span>
      </div>
    </div>
  );
};
