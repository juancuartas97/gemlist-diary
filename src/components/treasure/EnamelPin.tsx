import { cn } from '@/lib/utils';

interface EnamelPinProps {
  pin: {
    id: string;
    name: string;
    year: string;
    color: 'gold' | 'silver';
  };
  tiltDeg?: number;
}

export const EnamelPin = ({ pin, tiltDeg = 0 }: EnamelPinProps) => {
  const isGold = pin.color === 'gold';
  
  return (
    <div 
      className="enamel-pin group cursor-pointer"
      style={{ 
        transform: `rotate(${tiltDeg}deg)`,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Pin Body */}
      <div 
        className={cn(
          "relative w-16 h-16 rounded-xl transition-all duration-300",
          "group-hover:scale-110 group-hover:-translate-y-1",
          isGold ? "enamel-pin-gold" : "enamel-pin-silver"
        )}
      >
        {/* Metal Edge */}
        <div className={cn(
          "absolute inset-0 rounded-xl",
          isGold 
            ? "bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700" 
            : "bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600"
        )} />
        
        {/* Enamel Fill */}
        <div className="absolute inset-[3px] rounded-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center overflow-hidden">
          {/* Glossy Reflection */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent" />
          <div className="absolute top-1 left-1 w-3 h-3 bg-white/30 rounded-full blur-sm" />
          
          {/* Pin Content */}
          <span className="text-[8px] font-bold text-foreground/90 text-center leading-tight px-1 relative z-10">
            {pin.name}
          </span>
          <span className={cn(
            "text-[7px] font-medium mt-0.5 relative z-10",
            isGold ? "text-yellow-400/80" : "text-gray-400/80"
          )}>
            {pin.year}
          </span>
        </div>

        {/* Rim Light */}
        <div className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          isGold 
            ? "shadow-[0_0_15px_rgba(234,179,8,0.5)]" 
            : "shadow-[0_0_15px_rgba(156,163,175,0.5)]"
        )} />
      </div>

      {/* Pin Back Shadow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/40 rounded-full blur-md" />
    </div>
  );
};
