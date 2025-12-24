import { type SetEntry } from '@/lib/storage';
import { CrystalGem } from './CrystalGem';

interface GlassShelfProps {
  depth: number;
  gems: SetEntry[];
}

export const GlassShelf = ({ depth, gems }: GlassShelfProps) => {
  if (gems.length === 0) return null;
  
  const scale = 1 - depth * 0.08;
  const opacity = 1 - depth * 0.15;
  const translateZ = -depth * 60;
  
  return (
    <div 
      className="glass-shelf-container"
      style={{
        transform: `perspective(800px) translateZ(${translateZ}px) scale(${scale})`,
        opacity,
      }}
    >
      {/* Glass Shelf Surface */}
      <div className="glass-shelf relative">
        {/* Shelf Edge - Top Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Shelf Surface */}
        <div className="glass-shelf-surface relative flex justify-center gap-8 py-6 px-4">
          {gems.map((gem, i) => (
            <CrystalGem 
              key={gem.id} 
              gem={gem}
              delay={i * 0.1}
            />
          ))}
        </div>

        {/* Shelf Bottom - Glass Edge */}
        <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Reflection on shelf from gems */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-transparent via-primary/5 to-transparent blur-sm" />
      </div>
    </div>
  );
};
