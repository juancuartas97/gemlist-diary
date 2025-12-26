import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GemMiningAnimationProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  artistName: string;
  venueName?: string;
  eventName?: string;
  eventDate: string;
  genreName: string;
  gemColor: string;
}

export const GemMiningAnimation = ({
  open,
  onClose,
  onContinue,
  artistName,
  venueName,
  eventName,
  eventDate,
  genreName,
  gemColor,
}: GemMiningAnimationProps) => {
  const [phase, setPhase] = useState<'mining' | 'reveal' | 'summary'>('mining');
  const [pickaxeSwings, setPickaxeSwings] = useState(0);

  useEffect(() => {
    if (!open) {
      setPhase('mining');
      setPickaxeSwings(0);
      return;
    }

    // Start mining animation
    const swingInterval = setInterval(() => {
      setPickaxeSwings(prev => {
        if (prev >= 3) {
          clearInterval(swingInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    // Transition to reveal after mining
    const revealTimeout = setTimeout(() => {
      setPhase('reveal');
    }, 1600);

    // Transition to summary after reveal
    const summaryTimeout = setTimeout(() => {
      setPhase('summary');
    }, 2800);

    return () => {
      clearInterval(swingInterval);
      clearTimeout(revealTimeout);
      clearTimeout(summaryTimeout);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="flex flex-col items-center justify-center px-4 sm:px-6 w-full max-w-md text-center overflow-y-auto max-h-[90vh] py-8">
        {/* Mining Phase */}
        {phase === 'mining' && (
          <div className="animate-fade-in">
            {/* Rock and Pickaxe */}
            <div className="relative w-48 h-48 mb-8">
              {/* Rock */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
              >
                {/* Rock body */}
                <polygon
                  points="15,70 25,40 45,25 65,30 85,55 80,75 60,85 30,80"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--muted-foreground) / 0.3)"
                  strokeWidth="1"
                />
                {/* Rock facets */}
                <polygon
                  points="25,40 45,25 50,50 30,55"
                  fill="hsl(var(--muted-foreground) / 0.2)"
                />
                <polygon
                  points="65,30 85,55 70,60 55,45"
                  fill="hsl(var(--muted-foreground) / 0.1)"
                />
                {/* Cracks */}
                <path
                  d="M40,55 L50,60 L45,70 M60,50 L55,65"
                  stroke="hsl(var(--muted-foreground) / 0.4)"
                  strokeWidth="1"
                  fill="none"
                />
                {/* Sparkles/hints of gem inside */}
                <circle cx="48" cy="52" r="2" fill={gemColor} opacity="0.6" />
                <circle cx="55" cy="58" r="1.5" fill={gemColor} opacity="0.4" />
              </svg>

              {/* Pickaxe */}
              <svg
                viewBox="0 0 60 60"
                className={cn(
                  "absolute w-28 h-28 -right-6 -top-4 origin-bottom-left transition-transform duration-200",
                  pickaxeSwings % 2 === 1 ? "rotate-[-25deg]" : "rotate-[15deg]"
                )}
              >
                {/* Handle */}
                <line
                  x1="10" y1="50"
                  x2="45" y2="15"
                  stroke="#8B4513"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Pick head */}
                <path
                  d="M42,18 L55,8 L52,12 L55,15 L48,22 L42,18"
                  fill="#4A5568"
                  stroke="#2D3748"
                  strokeWidth="1"
                />
                {/* Pick back */}
                <path
                  d="M40,20 L35,25 L38,28 L42,22"
                  fill="#4A5568"
                  stroke="#2D3748"
                  strokeWidth="1"
                />
              </svg>

              {/* Sparks on impact */}
              {pickaxeSwings > 0 && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                      style={{
                        left: `${Math.cos(i * 1.5) * 20}px`,
                        top: `${Math.sin(i * 1.5) * 20}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <p className="text-lg text-muted-foreground animate-pulse">
              Mining...
            </p>
          </div>
        )}

        {/* Reveal Phase */}
        {phase === 'reveal' && (
          <div className="animate-scale-in">
            {/* Gem emerging with glow */}
            <div className="relative w-48 h-48 mb-8">
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${gemColor}60 0%, transparent 70%)`,
                }}
              />
              
              {/* Particles */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                  style={{
                    background: gemColor,
                    boxShadow: `0 0 10px ${gemColor}`,
                    animation: `float-out 1.5s ease-out forwards`,
                    animationDelay: `${i * 0.05}s`,
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-20px)`,
                  }}
                />
              ))}

              {/* Main Gem */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full animate-float"
              >
                <defs>
                  <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={`${gemColor}CC`} />
                    <stop offset="50%" stopColor={gemColor} />
                    <stop offset="100%" stopColor={`${gemColor}99`} />
                  </linearGradient>
                  <filter id="gemGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Diamond shape */}
                <path
                  d="M50 10 L15 40 L50 90 L85 40 Z"
                  fill="url(#gemGradient)"
                  stroke={gemColor}
                  strokeWidth="1"
                  filter="url(#gemGlow)"
                />
                {/* Top facet */}
                <path
                  d="M50 10 L15 40 L85 40 Z"
                  fill="rgba(255,255,255,0.25)"
                />
                {/* Left facet */}
                <path
                  d="M15 40 L50 40 L50 90 Z"
                  fill="rgba(0,0,0,0.1)"
                />
                {/* Center highlight */}
                <path
                  d="M50 25 L35 40 L50 70 L65 40 Z"
                  fill="rgba(255,255,255,0.15)"
                />
              </svg>
            </div>

            <p className="text-xl font-medium text-foreground">
              Gem Discovered!
            </p>
          </div>
        )}

        {/* Summary Phase */}
        {phase === 'summary' && (
          <div className="animate-fade-in space-y-6">
            {/* Gem with info */}
            <div className="relative">
              <svg
                viewBox="0 0 100 100"
                className="w-32 h-32 mx-auto"
              >
                <defs>
                  <linearGradient id="summaryGemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={`${gemColor}CC`} />
                    <stop offset="50%" stopColor={gemColor} />
                    <stop offset="100%" stopColor={`${gemColor}99`} />
                  </linearGradient>
                  <filter id="summaryGemGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                <path
                  d="M50 10 L15 40 L50 90 L85 40 Z"
                  fill="url(#summaryGemGradient)"
                  stroke={gemColor}
                  strokeWidth="1"
                  filter="url(#summaryGemGlow)"
                />
                <path
                  d="M50 10 L15 40 L85 40 Z"
                  fill="rgba(255,255,255,0.25)"
                />
                <path
                  d="M15 40 L50 40 L50 90 Z"
                  fill="rgba(0,0,0,0.1)"
                />
              </svg>
            </div>

            {/* Artist and Event Info */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {artistName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {genreName} Gem
              </p>
              {eventName && (
                <p className="text-sm text-muted-foreground">
                  {eventName}
                </p>
              )}
              {venueName && (
                <p className="text-sm text-muted-foreground/80">
                  @ {venueName}
                </p>
              )}
              <p className="text-xs text-muted-foreground/70">
                {new Date(eventDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto pt-4">
              <Button
                onClick={onContinue}
                variant="neon"
                className="w-full gap-2"
              >
                Mine Another Gem
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CSS for custom animations */}
      <style>{`
        @keyframes float-out {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) translateY(-60px);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
