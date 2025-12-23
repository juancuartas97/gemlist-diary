import { useMemo } from 'react';

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  color: string;
}

export const FloatingParticles = () => {
  const particles = useMemo<Particle[]>(() => {
    const colors = [
      'bg-primary/30',
      'bg-secondary/20',
      'bg-accent/20',
      'bg-gem-blue/20',
    ];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`particle ${p.color} blur-sm`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};
