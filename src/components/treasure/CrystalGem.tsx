import { type UserGem } from '@/hooks/useGemData';
import { cn } from '@/lib/utils';

interface CrystalGemProps {
  gem: UserGem;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// Helper to convert hex to HSL-like values for gradient
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 30, g: 140, b: 106 }; // Default emerald
};

const adjustColor = (hex: string, amount: number) => {
  const rgb = hexToRgb(hex);
  const adjust = (c: number) => Math.max(0, Math.min(255, c + amount));
  return `rgb(${adjust(rgb.r)}, ${adjust(rgb.g)}, ${adjust(rgb.b)})`;
};

export const CrystalGem = ({ gem, delay = 0, size = 'md', showLabel = true }: CrystalGemProps) => {
  const baseColor = gem.genre?.color_hex || '#1E8C6A';
  const colors = {
    main: baseColor,
    light: adjustColor(baseColor, 60),
    dark: adjustColor(baseColor, -40),
  };
  
  const sizes = {
    sm: { container: 'w-12 h-10', gem: 48 },
    md: { container: 'w-16 h-14', gem: 64 },
    lg: { container: 'w-20 h-18', gem: 80 },
  };

  const djName = gem.dj?.stage_name || 'Unknown';

  return (
    <div 
      className="crystal-gem-container group cursor-pointer flex flex-col items-center"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Outer Glow Aura */}
      <div 
        className="absolute blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500 rounded-full"
        style={{ 
          background: `radial-gradient(circle, ${colors.main} 0%, transparent 70%)`,
          width: '150%',
          height: '150%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* Brilliant Cut Diamond */}
      <div className={cn(
        "relative transition-all duration-300",
        "group-hover:scale-110 group-hover:-translate-y-2",
        sizes[size].container
      )}>
        <svg 
          viewBox="0 0 100 85" 
          className="w-full h-full drop-shadow-2xl"
          style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' }}
        >
          <defs>
            {/* Main body gradient - glass effect */}
            <linearGradient id={`body-${gem.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.light} stopOpacity="0.9" />
              <stop offset="30%" stopColor={colors.main} stopOpacity="0.85" />
              <stop offset="70%" stopColor={colors.dark} stopOpacity="0.95" />
              <stop offset="100%" stopColor={colors.main} stopOpacity="0.9" />
            </linearGradient>

            {/* Crown gradient - top facets */}
            <linearGradient id={`crown-${gem.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.5" />
              <stop offset="40%" stopColor={colors.light} stopOpacity="0.7" />
              <stop offset="100%" stopColor={colors.main} stopOpacity="0.9" />
            </linearGradient>

            {/* Pavilion gradient - bottom point */}
            <linearGradient id={`pavilion-${gem.id}`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor={colors.main} stopOpacity="0.95" />
              <stop offset="50%" stopColor={colors.dark} stopOpacity="1" />
              <stop offset="100%" stopColor={colors.dark} stopOpacity="0.8" />
            </linearGradient>

            {/* Fire/dispersion effect */}
            <radialGradient id={`fire-${gem.id}`} cx="30%" cy="30%">
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="50%" stopColor={colors.light} stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Glow filter */}
            <filter id={`glow-${gem.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>

          {/* === BRILLIANT CUT DIAMOND SHAPE === */}
          
          {/* Background glow */}
          <ellipse 
            cx="50" cy="35" rx="45" ry="25" 
            fill={colors.main} 
            fillOpacity="0.15" 
            filter={`url(#glow-${gem.id})`}
          />

          {/* CROWN (top section) */}
          {/* Table facet - flat top */}
          <polygon 
            points="30,20 70,20 65,28 35,28" 
            fill={`url(#crown-${gem.id})`}
            stroke="white"
            strokeOpacity="0.2"
            strokeWidth="0.5"
          />

          {/* Star facets - around table */}
          <polygon points="30,20 35,28 25,32 15,25" fill={colors.light} fillOpacity="0.8" stroke="white" strokeOpacity="0.15" strokeWidth="0.3" />
          <polygon points="70,20 85,25 75,32 65,28" fill={colors.main} fillOpacity="0.7" stroke="white" strokeOpacity="0.15" strokeWidth="0.3" />

          {/* Bezel facets - upper crown */}
          <polygon points="15,25 25,32 20,38 5,32" fill={colors.main} fillOpacity="0.85" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
          <polygon points="85,25 95,32 80,38 75,32" fill={colors.dark} fillOpacity="0.9" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />

          {/* Upper girdle facets */}
          <polygon points="25,32 35,28 40,38 20,38" fill={`url(#body-${gem.id})`} stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
          <polygon points="35,28 50,30 55,38 40,38" fill={colors.light} fillOpacity="0.75" stroke="white" strokeOpacity="0.15" strokeWidth="0.3" />
          <polygon points="50,30 65,28 60,38 55,38" fill={colors.main} fillOpacity="0.8" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
          <polygon points="65,28 75,32 80,38 60,38" fill={colors.dark} fillOpacity="0.85" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />

          {/* Girdle - thin middle band */}
          <polygon 
            points="5,32 20,38 40,38 55,38 60,38 80,38 95,32 80,40 60,42 55,42 40,42 20,40" 
            fill={colors.main} 
            fillOpacity="0.95"
            stroke="white"
            strokeOpacity="0.2"
            strokeWidth="0.5"
          />

          {/* PAVILION (bottom section) */}
          {/* Main pavilion facets */}
          <polygon points="5,32 20,40 50,85" fill={colors.main} fillOpacity="0.9" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
          <polygon points="20,40 40,42 50,85" fill={`url(#pavilion-${gem.id})`} stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
          <polygon points="40,42 55,42 50,85" fill={colors.dark} fillOpacity="0.95" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
          <polygon points="55,42 60,42 50,85" fill={colors.main} fillOpacity="0.85" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
          <polygon points="60,42 80,40 50,85" fill={colors.dark} fillOpacity="0.9" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
          <polygon points="80,40 95,32 50,85" fill={colors.main} fillOpacity="0.8" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />

          {/* Internal facet reflections */}
          <polygon points="30,45 50,70 40,50" fill="white" fillOpacity="0.15" />
          <polygon points="70,45 60,50 50,70" fill="white" fillOpacity="0.1" />
          <polygon points="45,55 55,55 50,75" fill={colors.light} fillOpacity="0.2" />

          {/* Fire/dispersion highlights */}
          <ellipse cx="35" cy="30" rx="8" ry="5" fill={`url(#fire-${gem.id})`} />
          
          {/* Main shine highlight on table */}
          <polygon points="32,21 45,21 42,26 34,26" fill="white" fillOpacity="0.6" />
          <polygon points="33,22 40,22 38,25 35,25" fill="white" fillOpacity="0.8" />

          {/* Secondary sparkles */}
          <circle cx="38" cy="24" r="1.5" fill="white" fillOpacity="0.9">
            <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="62" cy="30" r="1" fill="white" fillOpacity="0.7">
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="25" cy="34" r="0.8" fill="white" fillOpacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Edge highlights */}
          <line x1="30" y1="20" x2="70" y2="20" stroke="white" strokeOpacity="0.5" strokeWidth="0.8" />
          <line x1="5" y1="32" x2="50" y2="85" stroke="white" strokeOpacity="0.2" strokeWidth="0.5" />
          <line x1="95" y1="32" x2="50" y2="85" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Reflection on Surface */}
      <div 
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-6 blur-xl opacity-60"
        style={{ 
          background: `radial-gradient(ellipse at center, ${colors.main} 0%, transparent 70%)`,
        }}
      />

      {/* DJ Label */}
      {showLabel && (
        <div className="mt-3 text-center">
          <span className="text-[11px] text-foreground/80 font-medium tracking-wide">{djName}</span>
        </div>
      )}
    </div>
  );
};
