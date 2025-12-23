import { GemIcon } from './GemIcon';

const genres = [
  { name: 'Techno', angle: -45, color: 'text-primary' },
  { name: 'House', angle: 45, color: 'text-gem-pink' },
  { name: 'DnB', angle: 135, color: 'text-gem-blue' },
  { name: 'Ambient', angle: 225, color: 'text-secondary' },
];

export const TasteMapVisual = () => {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Concentric rings */}
      {[1, 2, 3].map((ring) => (
        <div
          key={ring}
          className="absolute inset-0 rounded-full border border-border/20"
          style={{
            transform: `scale(${1 - ring * 0.25})`,
          }}
        />
      ))}
      
      {/* Center gem */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 glass-card rounded-xl flex items-center justify-center animate-pulse-glow">
          <GemIcon className="w-10 h-10" />
        </div>
      </div>
      
      {/* Genre labels */}
      {genres.map((genre, i) => {
        const radius = 100;
        const angleRad = (genre.angle * Math.PI) / 180;
        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;
        
        return (
          <div
            key={genre.name}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
          >
            <span
              className={`text-sm font-semibold ${genre.color} glass-button px-3 py-1.5 rounded-full`}
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            >
              {genre.name}
            </span>
          </div>
        );
      })}
      
      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full">
        {genres.map((genre) => {
          const radius = 70;
          const angleRad = (genre.angle * Math.PI) / 180;
          const x2 = 128 + Math.cos(angleRad) * radius;
          const y2 = 128 + Math.sin(angleRad) * radius;
          
          return (
            <line
              key={genre.name}
              x1="128"
              y1="128"
              x2={x2}
              y2={y2}
              className="stroke-border/30"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}
      </svg>
    </div>
  );
};
