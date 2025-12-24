import { cn } from '@/lib/utils';

interface FestivalPin {
  id: string;
  festival: 'edc' | 'tomorrowland' | 'ultra';
  year: string;
}

interface EnamelPinProps {
  pin: FestivalPin;
  tiltDeg?: number;
}

export const EnamelPin = ({ pin, tiltDeg = 0 }: EnamelPinProps) => {
  return (
    <div 
      className="enamel-pin group cursor-pointer"
      style={{ 
        transform: `rotate(${tiltDeg}deg)`,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Pin Body */}
      <div className="relative transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
        {pin.festival === 'edc' && <EDCPin year={pin.year} />}
        {pin.festival === 'tomorrowland' && <TomorrowlandPin year={pin.year} />}
        {pin.festival === 'ultra' && <UltraPin year={pin.year} />}
      </div>

      {/* Pin Back Shadow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 bg-black/50 rounded-full blur-md" />
    </div>
  );
};

const EDCPin = ({ year }: { year: string }) => (
  <div className="relative w-16 h-16">
    {/* Gold outer ring */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 shadow-lg" />
    
    {/* Purple enamel fill */}
    <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800 overflow-hidden">
      {/* Glossy reflection */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
      <div className="absolute top-1 left-2 w-3 h-2 bg-white/40 rounded-full blur-[2px]" />
      
      {/* Rainbow petals */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-[1px]">
        {['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00aaff', '#0044ff', '#aa00ff'].map((color, i) => (
          <div 
            key={i}
            className="w-[4px] h-[10px] rounded-t-full origin-bottom"
            style={{ 
              backgroundColor: color,
              transform: `rotate(${(i - 3) * 15}deg)`,
              boxShadow: `0 0 4px ${color}40`
            }}
          />
        ))}
      </div>
      
      {/* EDC text */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
        <div className="text-[8px] font-black text-cyan-300 tracking-tight" style={{ textShadow: '0 0 4px cyan' }}>edc</div>
        <div className="text-[5px] font-bold text-white/90 tracking-wide uppercase">Las Vegas</div>
      </div>
    </div>

    {/* Gold pins on sides */}
    <div className="absolute top-1/2 -left-1 w-2 h-3 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600" />
    <div className="absolute top-1/2 -right-1 w-2 h-3 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600" />
    
    {/* Rim light */}
    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(234,179,8,0.6)]" />
  </div>
);

const TomorrowlandPin = ({ year }: { year: string }) => (
  <div className="relative w-[70px] h-16">
    {/* Ornate gold frame */}
    <svg viewBox="0 0 80 70" className="w-full h-full">
      <defs>
        <linearGradient id="tml-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5d17a" />
          <stop offset="30%" stopColor="#daa520" />
          <stop offset="50%" stopColor="#cd853f" />
          <stop offset="70%" stopColor="#daa520" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
        <linearGradient id="tml-blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a90d9" />
          <stop offset="100%" stopColor="#1a365d" />
        </linearGradient>
        <linearGradient id="tml-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cd9b6a" />
          <stop offset="50%" stopColor="#8b6914" />
          <stop offset="100%" stopColor="#654321" />
        </linearGradient>
      </defs>
      
      {/* Main shield shape */}
      <path 
        d="M40,5 L70,15 Q75,35 70,50 Q55,65 40,68 Q25,65 10,50 Q5,35 10,15 Z" 
        fill="url(#tml-gold)"
        stroke="url(#tml-gold)"
        strokeWidth="2"
      />
      
      {/* Inner blue area */}
      <path 
        d="M40,10 L62,18 Q65,35 62,47 Q50,58 40,60 Q30,58 18,47 Q15,35 18,18 Z" 
        fill="url(#tml-blue)"
      />
      
      {/* Butterfly/face symbol */}
      <ellipse cx="40" cy="28" rx="8" ry="10" fill="url(#tml-bronze)" />
      <circle cx="40" cy="23" r="4" fill="url(#tml-gold)" />
      <ellipse cx="40" cy="35" rx="5" ry="3" fill="url(#tml-bronze)" />
      
      {/* Wings */}
      <path d="M28,25 Q20,15 25,28 Q28,38 32,30 Z" fill="url(#tml-blue)" opacity="0.8"/>
      <path d="M52,25 Q60,15 55,28 Q52,38 48,30 Z" fill="url(#tml-blue)" opacity="0.8"/>
      
      {/* Bottom scroll */}
      <path 
        d="M20,55 Q30,60 40,58 Q50,60 60,55 Q55,62 40,64 Q25,62 20,55" 
        fill="url(#tml-gold)"
      />
      
      {/* Highlight */}
      <ellipse cx="30" cy="15" rx="6" ry="3" fill="white" fillOpacity="0.3" />
    </svg>
    
    {/* Rim light */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
         style={{ filter: 'drop-shadow(0 0 12px rgba(218, 165, 32, 0.7))' }} />
  </div>
);

const UltraPin = ({ year }: { year: string }) => (
  <div className="relative w-20 h-12">
    {/* Silver base with skyline */}
    <svg viewBox="0 0 100 60" className="w-full h-full">
      <defs>
        <linearGradient id="ultra-silver" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="30%" stopColor="#c0c0c0" />
          <stop offset="70%" stopColor="#909090" />
          <stop offset="100%" stopColor="#606060" />
        </linearGradient>
        <linearGradient id="ultra-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e90ff" />
          <stop offset="100%" stopColor="#0047ab" />
        </linearGradient>
      </defs>
      
      {/* Main rectangular base */}
      <rect x="5" y="15" width="90" height="40" rx="3" fill="url(#ultra-silver)" />
      
      {/* Blue band */}
      <rect x="8" y="25" width="84" height="27" rx="2" fill="url(#ultra-blue)" />
      
      {/* Skyline silhouette */}
      <path 
        d="M10,20 L10,15 L15,15 L15,12 L18,12 L18,8 L22,8 L22,12 L25,12 L25,15 
           L30,15 L30,10 L35,10 L35,15 L40,15 L40,6 L45,6 L45,15 
           L50,15 L50,12 L55,12 L55,8 L60,8 L60,15 L65,15 L65,10 
           L70,10 L70,15 L75,15 L75,12 L80,12 L80,18 L85,18 L85,20 L90,20 L90,25 L10,25 Z" 
        fill="url(#ultra-silver)"
      />
      
      {/* U logo */}
      <circle cx="22" cy="38" r="8" fill="white" />
      <path d="M17,34 L17,40 Q17,44 22,44 Q27,44 27,40 L27,34" stroke="#cc0000" strokeWidth="3" fill="none" strokeLinecap="round"/>
      
      {/* ULTRA text */}
      <text x="50" y="38" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial Black">ULTRA</text>
      
      {/* musicfestival text */}
      <text x="50" y="48" textAnchor="middle" fill="white" fontSize="5" fontWeight="500" fontFamily="Arial">musicfestival</text>
      
      {/* Highlight */}
      <rect x="10" y="16" width="30" height="3" rx="1" fill="white" fillOpacity="0.4" />
    </svg>
    
    {/* Silver pins */}
    <div className="absolute top-1/2 -left-1 w-2 h-2 rounded-full bg-gradient-to-b from-gray-300 to-gray-500" />
    <div className="absolute top-1/2 -right-1 w-2 h-2 rounded-full bg-gradient-to-b from-gray-300 to-gray-500" />
    
    {/* Rim light */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
         style={{ filter: 'drop-shadow(0 0 10px rgba(192, 192, 192, 0.6))' }} />
  </div>
);

export type { FestivalPin };
