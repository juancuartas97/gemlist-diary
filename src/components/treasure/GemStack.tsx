import { type SetEntry } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface GemStackProps {
  artistName: string;
  gems: SetEntry[];
}

const gemGlowColors: Record<string, { main: string; light: string; dark: string }> = {
  Emerald: { 
    main: 'hsl(var(--gem-emerald))', 
    light: 'hsl(145, 80%, 60%)', 
    dark: 'hsl(145, 90%, 25%)' 
  },
  Sapphire: { 
    main: 'hsl(var(--gem-sapphire))', 
    light: 'hsl(220, 90%, 65%)', 
    dark: 'hsl(220, 95%, 30%)' 
  },
  Ruby: { 
    main: 'hsl(var(--gem-ruby))', 
    light: 'hsl(350, 85%, 55%)', 
    dark: 'hsl(350, 90%, 25%)' 
  },
  Amethyst: { 
    main: 'hsl(var(--gem-amethyst))', 
    light: 'hsl(280, 80%, 65%)', 
    dark: 'hsl(280, 85%, 30%)' 
  },
};

export const GemStack = ({ artistName, gems }: GemStackProps) => {
  const count = gems.length;
  const primaryGem = gems[0];
  const colors = gemGlowColors[primaryGem.gemType] || gemGlowColors.Ruby;
  
  return (
    <div className="gem-stack-container group cursor-pointer relative">
      {/* Intense Stack Glow */}
      <div 
        className="absolute inset-0 blur-3xl opacity-70 group-hover:opacity-90 transition-opacity duration-500"
        style={{ 
          background: `radial-gradient(circle, ${colors.main} 0%, transparent 60%)`,
          transform: 'scale(2.5)',
        }}
      />
      
      {/* Floating Label */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
        <div className="stack-label px-3 py-1.5 rounded-full text-xs font-bold tracking-wide"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: `0 0 25px ${colors.main}50`,
          }}
        >
          <span className="text-foreground/90">{artistName}</span>
          <span className="text-primary ml-1.5 font-extrabold">(x{count})</span>
        </div>
      </div>

      {/* Stacked Brilliant Cut Gems */}
      <div className="relative w-20 h-24">
        {gems.slice(0, Math.min(count, 4)).map((gem, i) => (
          <div
            key={gem.id}
            className="absolute left-1/2 -translate-x-1/2 transition-all duration-300 group-hover:-translate-y-2"
            style={{
              bottom: `${i * 8}px`,
              zIndex: i,
              opacity: 1 - (i * 0.15),
              transform: `translateX(-50%) scale(${1 - i * 0.08})`,
            }}
          >
            {/* Mini brilliant cut gem */}
            <svg viewBox="0 0 100 85" className="w-14 h-12" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>
              <defs>
                <linearGradient id={`stack-body-${gem.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={colors.light} stopOpacity="0.9" />
                  <stop offset="50%" stopColor={colors.main} stopOpacity="0.85" />
                  <stop offset="100%" stopColor={colors.dark} stopOpacity="0.95" />
                </linearGradient>
              </defs>
              
              {/* Crown */}
              <polygon points="30,20 70,20 65,28 35,28" fill={colors.light} fillOpacity="0.85" stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
              <polygon points="30,20 35,28 25,32 15,25" fill={colors.main} fillOpacity="0.8" />
              <polygon points="70,20 85,25 75,32 65,28" fill={colors.dark} fillOpacity="0.85" />
              
              {/* Girdle */}
              <polygon points="5,32 20,38 40,38 60,38 80,38 95,32 80,40 20,40" fill={`url(#stack-body-${gem.id})`} />
              
              {/* Pavilion */}
              <polygon points="5,32 20,40 50,85" fill={colors.main} fillOpacity="0.9" />
              <polygon points="20,40 50,42 50,85" fill={colors.dark} fillOpacity="0.95" />
              <polygon points="50,42 80,40 50,85" fill={colors.main} fillOpacity="0.85" />
              <polygon points="80,40 95,32 50,85" fill={colors.dark} fillOpacity="0.8" />
              
              {/* Shine */}
              <polygon points="32,21 45,21 40,25 34,25" fill="white" fillOpacity="0.7" />
            </svg>
          </div>
        ))}

        {/* Top floating brilliant gem - largest */}
        <div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 group-hover:-translate-y-3 transition-transform duration-300"
          style={{ zIndex: 10 }}
        >
          <svg viewBox="0 0 100 85" className="w-16 h-14" style={{ filter: `drop-shadow(0 0 12px ${colors.main}) drop-shadow(0 8px 16px rgba(0,0,0,0.5))` }}>
            <defs>
              <linearGradient id={`stack-top-${artistName}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.light} stopOpacity="0.95" />
                <stop offset="30%" stopColor={colors.main} stopOpacity="0.9" />
                <stop offset="70%" stopColor={colors.dark} stopOpacity="0.95" />
                <stop offset="100%" stopColor={colors.main} stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id={`stack-crown-${artistName}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                <stop offset="100%" stopColor={colors.light} stopOpacity="0.8" />
              </linearGradient>
            </defs>
            
            {/* Crown facets */}
            <polygon points="30,20 70,20 65,28 35,28" fill={`url(#stack-crown-${artistName})`} stroke="white" strokeOpacity="0.4" strokeWidth="0.5" />
            <polygon points="30,20 35,28 25,32 15,25" fill={colors.light} fillOpacity="0.85" stroke="white" strokeOpacity="0.2" strokeWidth="0.3" />
            <polygon points="70,20 85,25 75,32 65,28" fill={colors.main} fillOpacity="0.8" stroke="white" strokeOpacity="0.2" strokeWidth="0.3" />
            <polygon points="15,25 25,32 20,38 5,32" fill={colors.main} fillOpacity="0.9" />
            <polygon points="85,25 95,32 80,38 75,32" fill={colors.dark} fillOpacity="0.9" />
            <polygon points="25,32 35,28 40,38 20,38" fill={`url(#stack-top-${artistName})`} />
            <polygon points="35,28 50,30 55,38 40,38" fill={colors.light} fillOpacity="0.8" />
            <polygon points="50,30 65,28 60,38 55,38" fill={colors.main} fillOpacity="0.85" />
            <polygon points="65,28 75,32 80,38 60,38" fill={colors.dark} fillOpacity="0.9" />
            
            {/* Girdle */}
            <polygon points="5,32 20,38 40,38 55,38 60,38 80,38 95,32 80,40 60,42 55,42 40,42 20,40" fill={colors.main} fillOpacity="0.95" stroke="white" strokeOpacity="0.25" strokeWidth="0.5" />
            
            {/* Pavilion */}
            <polygon points="5,32 20,40 50,85" fill={colors.main} fillOpacity="0.9" />
            <polygon points="20,40 40,42 50,85" fill={colors.dark} fillOpacity="0.95" />
            <polygon points="40,42 55,42 50,85" fill={colors.main} fillOpacity="0.85" />
            <polygon points="55,42 60,42 50,85" fill={colors.dark} fillOpacity="0.9" />
            <polygon points="60,42 80,40 50,85" fill={colors.main} fillOpacity="0.8" />
            <polygon points="80,40 95,32 50,85" fill={colors.dark} fillOpacity="0.85" />
            
            {/* Shine highlights */}
            <polygon points="32,21 48,21 44,26 34,26" fill="white" fillOpacity="0.7" />
            <polygon points="34,22 42,22 39,25 36,25" fill="white" fillOpacity="0.9" />
            
            {/* Sparkles */}
            <circle cx="40" cy="24" r="1.5" fill="white" fillOpacity="0.95">
              <animate attributeName="opacity" values="0.95;0.5;0.95" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="65" cy="30" r="1" fill="white" fillOpacity="0.7">
              <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
            </circle>
            
            {/* Edge highlights */}
            <line x1="30" y1="20" x2="70" y2="20" stroke="white" strokeOpacity="0.6" strokeWidth="0.8" />
          </svg>
        </div>
      </div>

      {/* Reflection pool */}
      <div 
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-8 opacity-50"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.main} 0%, transparent 70%)`,
          filter: 'blur(10px)',
        }}
      />
    </div>
  );
};
