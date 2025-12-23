import { MapPin } from 'lucide-react';

interface Venue {
  name: string;
  x: number;
  y: number;
}

const venues: Venue[] = [
  { name: 'Neon Grotto', x: 30, y: 35 },
  { name: 'Warehouse 9', x: 65, y: 60 },
];

export const MapVisual = () => {
  return (
    <div className="relative w-full max-w-xs mx-auto">
      {/* Glass map card */}
      <div className="glass-card p-4 rounded-2xl overflow-hidden">
        {/* Grid overlay */}
        <div className="relative aspect-square">
          {/* Background grid */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div key={`h-${i}`}>
                <div
                  className="absolute w-full h-px bg-primary/30"
                  style={{ top: `${(i + 1) * 16.66}%` }}
                />
                <div
                  className="absolute h-full w-px bg-primary/30"
                  style={{ left: `${(i + 1) * 16.66}%` }}
                />
              </div>
            ))}
          </div>
          
          {/* Concentric rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[1, 2, 3].map((ring) => (
              <div
                key={ring}
                className="absolute rounded-full border border-primary/20"
                style={{
                  width: `${ring * 30}%`,
                  height: `${ring * 30}%`,
                }}
              />
            ))}
          </div>
          
          {/* Venue pins */}
          {venues.map((venue) => (
            <div
              key={venue.name}
              className="absolute transform -translate-x-1/2 -translate-y-full"
              style={{ left: `${venue.x}%`, top: `${venue.y}%` }}
            >
              <div className="flex flex-col items-center animate-float" style={{ animationDelay: `${venue.x * 0.02}s` }}>
                <div className="glass-button px-2 py-1 rounded-lg mb-1 whitespace-nowrap">
                  <span className="text-xs font-medium text-foreground">{venue.name}</span>
                </div>
                <MapPin className="w-6 h-6 text-primary fill-primary/30" />
              </div>
            </div>
          ))}
          
          {/* Center pulse */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse-glow" />
            <div className="absolute inset-0 w-3 h-3 bg-primary/30 rounded-full animate-ping" />
          </div>
        </div>
      </div>
      
      {/* Events badge */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
        <div className="glass-card px-4 py-2 rounded-full border border-primary/40">
          <span className="text-sm font-semibold text-primary neon-text">Events Near You</span>
        </div>
      </div>
    </div>
  );
};
