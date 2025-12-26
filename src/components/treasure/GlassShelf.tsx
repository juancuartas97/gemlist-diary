import { type UserGem } from '@/hooks/useGemData';
import { CrystalGem } from './CrystalGem';

interface GlassShelfProps {
  depth: number;
  userGems: UserGem[];
  onGemClick?: (gem: UserGem) => void;
}

export const GlassShelf = ({ depth, userGems, onGemClick }: GlassShelfProps) => {
  if (userGems.length === 0) return null;
  
  const scale = 1 - depth * 0.06;
  const opacity = 1 - depth * 0.1;
  const translateZ = -depth * 40;
  const blurAmount = depth * 0.5;
  
  return (
    <div 
      className="glass-shelf-container relative"
      style={{
        transform: `perspective(1000px) translateZ(${translateZ}px) scale(${scale})`,
        opacity,
      }}
    >
      {/* Frosted Smoked Glass Case */}
      <div className="relative rounded-xl overflow-hidden">
        {/* Glass background with frost effect */}
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(180deg, 
              rgba(30, 30, 35, 0.6) 0%, 
              rgba(20, 20, 25, 0.75) 50%,
              rgba(15, 15, 18, 0.85) 100%)`,
            backdropFilter: `blur(${12 + blurAmount}px) saturate(150%)`,
            WebkitBackdropFilter: `blur(${12 + blurAmount}px) saturate(150%)`,
          }}
        />
        
        {/* Smoke texture overlay */}
        <div 
          className="absolute inset-0 rounded-xl opacity-30"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.03) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.02) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(100,100,120,0.1) 0%, transparent 70%)
            `,
          }}
        />

        {/* Frost grain texture */}
        <div 
          className="absolute inset-0 rounded-xl opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Top edge highlight - glass reflection */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        
        {/* Inner top glow */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/5 to-transparent rounded-t-xl" />

        {/* Shelf Surface with Gems */}
        <div className="relative flex justify-center items-end gap-10 py-8 px-6 min-h-[140px]">
          {userGems.map((gem, i) => (
            <CrystalGem 
              key={gem.id} 
              gem={gem}
              delay={i * 0.15 + depth * 0.2}
              onClick={() => onGemClick?.(gem)}
            />
          ))}
        </div>

        {/* Glass shelf bottom - simulating thickness */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-black/40 via-white/5 to-transparent" />
        
        {/* Bottom edge - glass thickness highlight */}
        <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Side edges - glass depth */}
        <div className="absolute top-4 bottom-4 left-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute top-4 bottom-4 right-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {/* Gem reflections on glass surface */}
        <div 
          className="absolute bottom-2 left-1/4 right-1/4 h-6 opacity-30"
          style={{
            background: `linear-gradient(90deg, 
              transparent 0%, 
              hsl(var(--gem-emerald) / 0.2) 25%, 
              hsl(var(--gem-sapphire) / 0.2) 50%,
              hsl(var(--gem-ruby) / 0.2) 75%,
              transparent 100%)`,
            filter: 'blur(8px)',
          }}
        />
      </div>

      {/* Cast shadow below shelf */}
      <div 
        className="absolute -bottom-4 left-8 right-8 h-8 opacity-50"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
    </div>
  );
};
