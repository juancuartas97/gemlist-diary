import { type SetEntry } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface GemStackProps {
  artistName: string;
  gems: SetEntry[];
}

const gemGlowColors: Record<string, string> = {
  Emerald: 'hsl(var(--gem-emerald))',
  Sapphire: 'hsl(var(--gem-sapphire))',
  Ruby: 'hsl(var(--gem-ruby))',
  Amethyst: 'hsl(var(--gem-amethyst))',
};

export const GemStack = ({ artistName, gems }: GemStackProps) => {
  const count = gems.length;
  const primaryGem = gems[0];
  const glowColor = gemGlowColors[primaryGem.gemType] || gemGlowColors.Emerald;
  
  return (
    <div className="gem-stack-container group cursor-pointer relative">
      {/* Intense Stack Glow */}
      <div 
        className="absolute inset-0 blur-2xl opacity-70 group-hover:opacity-90 transition-opacity duration-500"
        style={{ 
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 60%)`,
          transform: 'scale(2)',
        }}
      />
      
      {/* Floating Label */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
        <div className="stack-label px-3 py-1 rounded-full text-xs font-bold tracking-wide"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: `0 0 20px ${glowColor}40`,
          }}
        >
          <span className="text-foreground/90">{artistName}</span>
          <span className="text-primary ml-1">(x{count})</span>
        </div>
      </div>

      {/* Stacked Coins/Chips */}
      <div className="relative w-16 h-20">
        {gems.slice(0, Math.min(count, 5)).map((gem, i) => (
          <div
            key={gem.id}
            className="gem-chip absolute left-0 right-0 transition-all duration-300 group-hover:-translate-y-1"
            style={{
              bottom: `${i * 6}px`,
              zIndex: i,
              transform: `translateY(${-i * 2}px)`,
            }}
          >
            {/* Chip Body */}
            <div 
              className="w-16 h-4 rounded-full relative overflow-hidden"
              style={{
                background: `linear-gradient(180deg, 
                  hsl(var(--gem-${primaryGem.gemType.toLowerCase()}) / 0.9) 0%, 
                  hsl(var(--gem-${primaryGem.gemType.toLowerCase()}) / 0.6) 50%,
                  hsl(var(--gem-${primaryGem.gemType.toLowerCase()}) / 0.3) 100%
                )`,
                boxShadow: `
                  0 2px 4px rgba(0,0,0,0.3),
                  inset 0 1px 0 rgba(255,255,255,0.3),
                  0 0 15px ${glowColor}40
                `,
              }}
            >
              {/* Highlight */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full" />
              
              {/* Edge Detail */}
              <div className="absolute inset-x-1 bottom-0 h-[1px] bg-black/20" />
            </div>
          </div>
        ))}

        {/* Top Gem Crown */}
        <div 
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8"
          style={{ zIndex: 10 }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id={`stack-gem-${artistName}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                <stop offset="50%" stopColor={glowColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={glowColor} stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <polygon 
              points="50,5 90,30 90,70 50,95 10,70 10,30" 
              fill={`url(#stack-gem-${artistName})`}
              style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
            />
            <polygon 
              points="50,5 90,30 50,45 10,30" 
              fill="white"
              fillOpacity="0.4"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
