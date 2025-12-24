import { cn } from '@/lib/utils';

interface FestivalBadge {
  name: string;
  date: string;
  color: 'silver' | 'gold' | 'green' | 'purple' | 'red' | 'blue';
}

interface EnamelPinProps {
  badge: FestivalBadge;
}

// Color configurations for enamel fill
const colorConfig = {
  silver: {
    rim: 'from-gray-200 via-gray-400 to-gray-600',
    fill: 'from-gray-400 via-gray-500 to-gray-700',
    glow: 'rgba(156, 163, 175, 0.5)',
  },
  gold: {
    rim: 'from-yellow-200 via-amber-400 to-yellow-700',
    fill: 'from-amber-400 via-amber-500 to-amber-700',
    glow: 'rgba(251, 191, 36, 0.5)',
  },
  green: {
    rim: 'from-emerald-300 via-emerald-500 to-emerald-800',
    fill: 'from-emerald-400 via-emerald-600 to-emerald-800',
    glow: 'rgba(52, 211, 153, 0.5)',
  },
  purple: {
    rim: 'from-purple-300 via-purple-500 to-purple-800',
    fill: 'from-purple-400 via-violet-600 to-purple-900',
    glow: 'rgba(167, 139, 250, 0.5)',
  },
  red: {
    rim: 'from-red-300 via-red-500 to-red-800',
    fill: 'from-red-400 via-red-600 to-red-800',
    glow: 'rgba(248, 113, 113, 0.5)',
  },
  blue: {
    rim: 'from-blue-300 via-blue-500 to-blue-800',
    fill: 'from-blue-400 via-blue-600 to-blue-800',
    glow: 'rgba(96, 165, 250, 0.5)',
  },
};

export const EnamelPin = ({ badge }: EnamelPinProps) => {
  const config = colorConfig[badge.color];
  
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer flex-shrink-0">
      {/* The Pin */}
      <div 
        className="relative transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-1"
      >
        {/* Pin Container - Shield/Circle Shape */}
        <div 
          className="relative w-20 h-20 rounded-full"
          style={{
            boxShadow: `
              0 8px 16px rgba(0,0,0,0.6),
              0 4px 6px rgba(0,0,0,0.4),
              0 0 0 1px rgba(255,255,255,0.05)
            `
          }}
        >
          {/* Metallic Rim (3px gradient border) */}
          <div className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-br",
            config.rim
          )} />
          
          {/* Enamel Fill */}
          <div className={cn(
            "absolute inset-[3px] rounded-full bg-gradient-to-br overflow-hidden",
            config.fill
          )}>
            {/* Diagonal Gloss Overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent 
                         opacity-60 group-hover:opacity-80 transition-opacity duration-300"
              style={{
                transform: 'rotate(-45deg) translateY(-20%)',
              }}
            />
            
            {/* Top highlight spot */}
            <div className="absolute top-2 left-3 w-4 h-2 bg-white/30 rounded-full blur-[2px]" />
            
            {/* Event Initial/Icon Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white/90 drop-shadow-lg tracking-tight">
                {badge.name.charAt(0)}
              </span>
            </div>
          </div>
          
          {/* Hover glow effect */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: `0 0 24px ${config.glow}`
            }}
          />
        </div>
        
        {/* Cast Shadow */}
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-3 bg-black/40 rounded-full blur-md
                     group-hover:w-12 group-hover:blur-lg transition-all duration-300"
        />
      </div>
      
      {/* Typography */}
      <div className="text-center mt-1">
        <p className="text-[10px] font-bold text-white/90 uppercase tracking-widest leading-tight">
          {badge.name}
        </p>
        <p className="text-[9px] text-white/50 mt-0.5">
          {badge.date}
        </p>
      </div>
    </div>
  );
};

export type { FestivalBadge };
