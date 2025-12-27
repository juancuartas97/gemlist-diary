import { useState, useEffect } from 'react';
import { X, ChevronRight, MapPin, Building2, Ticket, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type RarityResult, RARITY_TIERS, getRarityBreakdown } from '@/hooks/useRarityCalculator';

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
  rarityResult?: RarityResult | null;
}

interface SlotValue {
  current: number;
  target: number;
  revealed: boolean;
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
  rarityResult,
}: GemMiningAnimationProps) => {
  const [phase, setPhase] = useState<'mining' | 'calculating' | 'reveal' | 'summary'>('mining');
  const [pickaxeSwings, setPickaxeSwings] = useState(0);
  const [slotValues, setSlotValues] = useState<{
    venue: SlotValue;
    city: SlotValue;
    event: SlotValue;
    volume: SlotValue;
  }>({
    venue: { current: 0, target: 0, revealed: false },
    city: { current: 0, target: 0, revealed: false },
    event: { current: 0, target: 0, revealed: false },
    volume: { current: 0, target: 0, revealed: false },
  });
  const [totalRevealed, setTotalRevealed] = useState(false);

  useEffect(() => {
    if (!open) {
      setPhase('mining');
      setPickaxeSwings(0);
      setSlotValues({
        venue: { current: 0, target: 0, revealed: false },
        city: { current: 0, target: 0, revealed: false },
        event: { current: 0, target: 0, revealed: false },
        volume: { current: 0, target: 0, revealed: false },
      });
      setTotalRevealed(false);
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

    // Transition to calculating if rarity exists, otherwise to reveal
    const nextPhaseTimeout = setTimeout(() => {
      if (rarityResult) {
        setPhase('calculating');
      } else {
        setPhase('reveal');
      }
    }, 1600);

    return () => {
      clearInterval(swingInterval);
      clearTimeout(nextPhaseTimeout);
    };
  }, [open, rarityResult]);

  // Calculating phase slot machine animation
  useEffect(() => {
    if (phase !== 'calculating' || !rarityResult) return;

    const breakdown = getRarityBreakdown(rarityResult);
    
    // Set target values
    setSlotValues({
      venue: { current: 0, target: breakdown.venue.score, revealed: false },
      city: { current: 0, target: breakdown.city.score, revealed: false },
      event: { current: 0, target: breakdown.event.score, revealed: false },
      volume: { current: 0, target: breakdown.volume.score, revealed: false },
    });

    // Animate slot machines one by one
    const categories = ['venue', 'city', 'event', 'volume'] as const;
    const targets = [breakdown.venue.score, breakdown.city.score, breakdown.event.score, breakdown.volume.score];
    
    categories.forEach((cat, index) => {
      const startDelay = index * 600;
      const spinDuration = 400;
      const spinInterval = 50;
      
      // Start spinning
      setTimeout(() => {
        const spinner = setInterval(() => {
          setSlotValues(prev => ({
            ...prev,
            [cat]: { ...prev[cat], current: Math.floor(Math.random() * 40) },
          }));
        }, spinInterval);

        // Stop and reveal
        setTimeout(() => {
          clearInterval(spinner);
          setSlotValues(prev => ({
            ...prev,
            [cat]: { current: targets[index], target: targets[index], revealed: true },
          }));
        }, spinDuration);
      }, startDelay);
    });

    // Reveal total after all slots
    setTimeout(() => {
      setTotalRevealed(true);
    }, 2800);

    // Transition to reveal phase
    setTimeout(() => {
      setPhase('reveal');
    }, 3800);

    // Transition to summary
    setTimeout(() => {
      setPhase('summary');
    }, 5000);
  }, [phase, rarityResult]);

  // Handle non-rarity flow
  useEffect(() => {
    if (phase === 'reveal' && !rarityResult) {
      const summaryTimeout = setTimeout(() => {
        setPhase('summary');
      }, 1200);
      return () => clearTimeout(summaryTimeout);
    }
  }, [phase, rarityResult]);

  if (!open) return null;

  const tierInfo = rarityResult ? RARITY_TIERS[rarityResult.rarity_tier] : null;
  const breakdown = rarityResult ? getRarityBreakdown(rarityResult) : null;

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

        {/* Calculating Phase - Slot Machine */}
        {phase === 'calculating' && breakdown && (
          <div className="animate-fade-in w-full">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Calculating Rarity...
            </h2>

            <div className="space-y-3 mb-6">
              {/* Venue Scarcity */}
              <div className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all duration-300",
                slotValues.venue.revealed 
                  ? "bg-primary/10 border border-primary/30" 
                  : "bg-muted/30 border border-muted/20"
              )}>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Venue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-mono text-lg font-bold transition-all",
                    slotValues.venue.revealed ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {slotValues.venue.current}
                  </span>
                  <span className="text-xs text-muted-foreground">/40</span>
                </div>
              </div>

              {/* City Frequency */}
              <div className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all duration-300",
                slotValues.city.revealed 
                  ? "bg-primary/10 border border-primary/30" 
                  : "bg-muted/30 border border-muted/20"
              )}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">City</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-mono text-lg font-bold transition-all",
                    slotValues.city.revealed ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {slotValues.city.current}
                  </span>
                  <span className="text-xs text-muted-foreground">/30</span>
                </div>
              </div>

              {/* Event History */}
              <div className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all duration-300",
                slotValues.event.revealed 
                  ? "bg-primary/10 border border-primary/30" 
                  : "bg-muted/30 border border-muted/20"
              )}>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Event</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-mono text-lg font-bold transition-all",
                    slotValues.event.revealed ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {slotValues.event.current}
                  </span>
                  <span className="text-xs text-muted-foreground">/20</span>
                </div>
              </div>

              {/* Yearly Volume */}
              <div className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all duration-300",
                slotValues.volume.revealed 
                  ? "bg-primary/10 border border-primary/30" 
                  : "bg-muted/30 border border-muted/20"
              )}>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tour</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-mono text-lg font-bold transition-all",
                    slotValues.volume.revealed ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {slotValues.volume.current}
                  </span>
                  <span className="text-xs text-muted-foreground">/10</span>
                </div>
              </div>
            </div>

            {/* Total Score */}
            {totalRevealed && rarityResult && tierInfo && (
              <div 
                className="p-4 rounded-xl border-2 animate-scale-in"
                style={{ 
                  borderColor: tierInfo.color,
                  background: `${tierInfo.color}15`,
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{tierInfo.emoji}</span>
                  <div className="text-left">
                    <div className="text-2xl font-bold" style={{ color: tierInfo.color }}>
                      {rarityResult.total_score}/100
                    </div>
                    <div className="text-sm font-semibold" style={{ color: tierInfo.color }}>
                      {tierInfo.label}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  background: `radial-gradient(circle, ${tierInfo?.color || gemColor}60 0%, transparent 70%)`,
                }}
              />
              
              {/* Particles */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                  style={{
                    background: tierInfo?.color || gemColor,
                    boxShadow: `0 0 10px ${tierInfo?.color || gemColor}`,
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
                    <stop offset="0%" stopColor={`${tierInfo?.color || gemColor}CC`} />
                    <stop offset="50%" stopColor={tierInfo?.color || gemColor} />
                    <stop offset="100%" stopColor={`${tierInfo?.color || gemColor}99`} />
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
                  stroke={tierInfo?.color || gemColor}
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

            <div className="space-y-2">
              {tierInfo && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">{tierInfo.emoji}</span>
                  <span className="text-xl font-bold" style={{ color: tierInfo.color }}>
                    {tierInfo.label}
                  </span>
                </div>
              )}
              <p className="text-lg text-foreground">
                Gem Discovered!
              </p>
            </div>
          </div>
        )}

        {/* Summary Phase */}
        {phase === 'summary' && (
          <div className="animate-fade-in space-y-6 w-full">
            {/* Gem with info */}
            <div className="relative">
              <svg
                viewBox="0 0 100 100"
                className="w-32 h-32 mx-auto"
              >
                <defs>
                  <linearGradient id="summaryGemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={`${tierInfo?.color || gemColor}CC`} />
                    <stop offset="50%" stopColor={tierInfo?.color || gemColor} />
                    <stop offset="100%" stopColor={`${tierInfo?.color || gemColor}99`} />
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
                  stroke={tierInfo?.color || gemColor}
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

            {/* Rarity Badge */}
            {tierInfo && rarityResult && (
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mx-auto"
                style={{ 
                  background: `${tierInfo.color}20`,
                  border: `1px solid ${tierInfo.color}40`,
                }}
              >
                <span className="text-xl">{tierInfo.emoji}</span>
                <span className="font-bold" style={{ color: tierInfo.color }}>
                  {tierInfo.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({rarityResult.total_score}/100)
                </span>
              </div>
            )}

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

            {/* Rarity Breakdown */}
            {breakdown && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-muted/20">
                  <div className="text-muted-foreground">Venue</div>
                  <div className="font-medium">{breakdown.venue.label}</div>
                </div>
                <div className="p-2 rounded bg-muted/20">
                  <div className="text-muted-foreground">City</div>
                  <div className="font-medium">{breakdown.city.label}</div>
                </div>
                <div className="p-2 rounded bg-muted/20">
                  <div className="text-muted-foreground">Event</div>
                  <div className="font-medium">{breakdown.event.label}</div>
                </div>
                <div className="p-2 rounded bg-muted/20">
                  <div className="text-muted-foreground">Tour</div>
                  <div className="font-medium">{breakdown.volume.label}</div>
                </div>
              </div>
            )}

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
