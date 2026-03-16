import { useEffect, useId, useMemo, useState } from 'react';
import { X, ChevronRight, MapPin, Building2, Ticket, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type RarityResult, RARITY_TIERS, getRarityBreakdown } from '@/hooks/useRarityCalculator';
import './gemMiningAnimation.css';

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

interface AnimationProfile {
  strikeCount: number;
  strikeIntervalMs: number;
  miningMs: number;
  slotStartGapMs: number;
  slotSpinMs: number;
  slotTickMs: number;
  totalRevealDelayMs: number;
  revealMs: number;
  summaryDelayMs: number;
}

type DebrisType = 'chip' | 'dust' | 'spark';

interface DebrisParticle {
  id: number;
  type: DebrisType;
  rot: number;
  distance: number;
  drift: number;
  life: number;
}

const getAnimationProfile = (tier?: RarityResult['rarity_tier'] | null, reducedMotion?: boolean): AnimationProfile => {
  if (reducedMotion) {
    return {
      strikeCount: 1,
      strikeIntervalMs: 180,
      miningMs: 280,
      slotStartGapMs: 140,
      slotSpinMs: 120,
      slotTickMs: 60,
      totalRevealDelayMs: 680,
      revealMs: 220,
      summaryDelayMs: 220,
    };
  }

  if (tier === 'mythic' || tier === 'legendary') {
    return {
      strikeCount: 4,
      strikeIntervalMs: 560,
      miningMs: 2450,
      slotStartGapMs: 700,
      slotSpinMs: 620,
      slotTickMs: 44,
      totalRevealDelayMs: 3700,
      revealMs: 1350,
      summaryDelayMs: 1500,
    };
  }

  if (tier === 'rare') {
    return {
      strikeCount: 4,
      strikeIntervalMs: 500,
      miningMs: 2100,
      slotStartGapMs: 620,
      slotSpinMs: 520,
      slotTickMs: 48,
      totalRevealDelayMs: 3200,
      revealMs: 1000,
      summaryDelayMs: 1150,
    };
  }

  return {
    strikeCount: 3,
    strikeIntervalMs: 440,
    miningMs: 1700,
    slotStartGapMs: 530,
    slotSpinMs: 460,
    slotTickMs: 52,
    totalRevealDelayMs: 2800,
    revealMs: 840,
    summaryDelayMs: 980,
  };
};


const withHexAlpha = (color: string, alphaHex: string): string => {
  const normalized = color.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
    const expanded = normalized.length === 4
      ? `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
      : normalized;
    return `${expanded}${alphaHex}`;
  }

  return normalized;
};

const buildDebris = (seed: number): DebrisParticle[] => {
  const rand = (min: number, max: number) => min + ((Math.sin(seed * 97 + min) + 1) / 2) * (max - min);
  const particles: DebrisParticle[] = [];

  for (let i = 0; i < 7; i += 1) {
    particles.push({
      id: i,
      type: 'chip',
      rot: rand(8, 172) + i * 18,
      distance: rand(24, 56),
      drift: rand(-14, 16),
      life: rand(680, 980),
    });
  }

  for (let i = 7; i < 19; i += 1) {
    particles.push({
      id: i,
      type: 'dust',
      rot: rand(0, 190) + i * 15,
      distance: rand(20, 72),
      drift: rand(-24, 24),
      life: rand(850, 1300),
    });
  }

  for (let i = 19; i < 24; i += 1) {
    particles.push({
      id: i,
      type: 'spark',
      rot: rand(-20, 180) + i * 10,
      distance: rand(24, 52),
      drift: rand(-10, 10),
      life: rand(260, 520),
    });
  }

  return particles;
};

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
  const [swingCount, setSwingCount] = useState(0);
  const [strikeSeed, setStrikeSeed] = useState(0);
  const [showImpact, setShowImpact] = useState(false);
  const [slotValues, setSlotValues] = useState<Record<'venue' | 'city' | 'event' | 'volume', SlotValue>>({
    venue: { current: 0, target: 0, revealed: false },
    city: { current: 0, target: 0, revealed: false },
    event: { current: 0, target: 0, revealed: false },
    volume: { current: 0, target: 0, revealed: false },
  });
  const [totalRevealed, setTotalRevealed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const tierInfo = rarityResult ? RARITY_TIERS[rarityResult.rarity_tier] : null;
  const breakdown = rarityResult ? getRarityBreakdown(rarityResult) : null;
  const gradientBaseColor = tierInfo?.color || gemColor;

  const revealGradientId = useId().replace(/:/g, '');
  const summaryGradientId = useId().replace(/:/g, '');
  const specularId = useId().replace(/:/g, '');

  const profile = useMemo(
    () => getAnimationProfile(rarityResult?.rarity_tier, prefersReducedMotion),
    [prefersReducedMotion, rarityResult?.rarity_tier],
  );

  const debrisParticles = useMemo(() => buildDebris(strikeSeed), [strikeSeed]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener('change', sync);
    return () => mediaQuery.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!open) {
      setPhase('mining');
      setSwingCount(0);
      setStrikeSeed(0);
      setShowImpact(false);
      setTotalRevealed(false);
      setSlotValues({
        venue: { current: 0, target: 0, revealed: false },
        city: { current: 0, target: 0, revealed: false },
        event: { current: 0, target: 0, revealed: false },
        volume: { current: 0, target: 0, revealed: false },
      });
      return;
    }

    const strikeTimer = setInterval(() => {
      setSwingCount((previous) => {
        if (previous >= profile.strikeCount) {
          clearInterval(strikeTimer);
          return previous;
        }

        setStrikeSeed(Math.floor(Math.random() * 10000));
        setShowImpact(true);
        window.setTimeout(() => setShowImpact(false), prefersReducedMotion ? 80 : 220);

        return previous + 1;
      });
    }, profile.strikeIntervalMs);

    const phaseTransition = window.setTimeout(() => {
      if (rarityResult) {
        setPhase('calculating');
      } else {
        setPhase('reveal');
      }
    }, profile.miningMs);

    return () => {
      clearInterval(strikeTimer);
      window.clearTimeout(phaseTransition);
    };
  }, [open, profile, rarityResult, prefersReducedMotion]);

  useEffect(() => {
    if (phase !== 'calculating' || !rarityResult) return;

    const scoreBreakdown = getRarityBreakdown(rarityResult);
    const categories = ['venue', 'city', 'event', 'volume'] as const;
    const maxByCategory = { venue: 40, city: 30, event: 20, volume: 10 };

    setSlotValues({
      venue: { current: 0, target: scoreBreakdown.venue.score, revealed: false },
      city: { current: 0, target: scoreBreakdown.city.score, revealed: false },
      event: { current: 0, target: scoreBreakdown.event.score, revealed: false },
      volume: { current: 0, target: scoreBreakdown.volume.score, revealed: false },
    });

    const timeoutHandles: number[] = [];
    const intervalHandles: number[] = [];

    categories.forEach((category, index) => {
      const target = scoreBreakdown[category].score;
      const spinStart = window.setTimeout(() => {
        const spinner = window.setInterval(() => {
          setSlotValues((previous) => ({
            ...previous,
            [category]: {
              ...previous[category],
              current: Math.floor(Math.random() * (maxByCategory[category] + 1)),
            },
          }));
        }, profile.slotTickMs);

        intervalHandles.push(spinner);

        const stop = window.setTimeout(() => {
          window.clearInterval(spinner);
          setSlotValues((previous) => ({
            ...previous,
            [category]: { current: target, target, revealed: true },
          }));
        }, profile.slotSpinMs);

        timeoutHandles.push(stop);
      }, index * profile.slotStartGapMs);

      timeoutHandles.push(spinStart);
    });

    timeoutHandles.push(
      window.setTimeout(() => {
        setTotalRevealed(true);
      }, profile.totalRevealDelayMs),
    );

    timeoutHandles.push(
      window.setTimeout(() => {
        setPhase('reveal');
      }, profile.totalRevealDelayMs + 620),
    );

    timeoutHandles.push(
      window.setTimeout(() => {
        setPhase('summary');
      }, profile.totalRevealDelayMs + 620 + profile.revealMs + profile.summaryDelayMs),
    );

    return () => {
      timeoutHandles.forEach((handle) => window.clearTimeout(handle));
      intervalHandles.forEach((handle) => window.clearInterval(handle));
    };
  }, [phase, profile, rarityResult]);

  useEffect(() => {
    if (phase !== 'reveal' || rarityResult) return;

    const toSummary = window.setTimeout(() => {
      setPhase('summary');
    }, profile.revealMs + profile.summaryDelayMs);

    return () => window.clearTimeout(toSummary);
  }, [phase, profile, rarityResult]);

  if (!open) return null;

  const renderDebris = () => (
    <div className="debris-layer">
      {debrisParticles.map((particle) => (
        <div
          key={`${particle.id}-${strikeSeed}`}
          className="debris"
          style={{
            ['--rot' as string]: `${particle.rot}deg`,
            ['--distance' as string]: `${particle.distance}px`,
            ['--drift' as string]: `${particle.drift}px`,
            ['--life' as string]: `${particle.life}ms`,
          }}
        >
          <div
            className={cn({
              'debris-chip': particle.type === 'chip',
              'debris-dust': particle.type === 'dust',
              'debris-spark': particle.type === 'spark',
            })}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="gem-mining-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="flex flex-col items-center justify-center px-4 sm:px-6 w-full max-w-md text-center overflow-y-auto max-h-[90vh] py-8">
        {phase === 'mining' && (
          <div className="animate-fade-in">
            <div className="mining-scene mb-8">
              <svg viewBox="0 0 100 100" className={cn('w-full h-full rock-shell', showImpact && 'rock-shell-impact')}>
                <polygon
                  points="15,70 25,40 45,25 65,30 85,55 80,75 60,85 30,80"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--muted-foreground) / 0.35)"
                  strokeWidth="1"
                />
                <polygon points="25,40 45,25 50,50 30,55" fill="hsl(var(--muted-foreground) / 0.2)" />
                <polygon points="65,30 85,55 70,60 55,45" fill="hsl(var(--muted-foreground) / 0.1)" />
                <path
                  d="M40,55 L50,60 L45,70 M60,50 L55,65"
                  stroke="hsl(var(--muted-foreground) / 0.5)"
                  strokeWidth="1"
                  fill="none"
                />
                <circle cx="48" cy="52" r="2" fill={gemColor} opacity="0.7" />
                <circle cx="55" cy="58" r="1.3" fill={gemColor} opacity="0.45" />
              </svg>

              <svg
                key={swingCount}
                viewBox="0 0 60 60"
                className={cn('pickaxe', swingCount > 0 && 'pickaxe-strike')}
                style={{ ['--strike-duration' as string]: `${profile.strikeIntervalMs * 0.75}ms` }}
              >
                <line x1="10" y1="50" x2="45" y2="15" stroke="#8B4513" strokeWidth="4" strokeLinecap="round" />
                <path d="M42,18 L55,8 L52,12 L55,15 L48,22 L42,18" fill="#4A5568" stroke="#2D3748" strokeWidth="1" />
                <path d="M40,20 L35,25 L38,28 L42,22" fill="#4A5568" stroke="#2D3748" strokeWidth="1" />
              </svg>

              {showImpact && (
                <>
                  <div className="impact-flash" />
                  {renderDebris()}
                </>
              )}
            </div>

            <p className="text-lg text-muted-foreground">
              Fracturing stone matrix...
            </p>
          </div>
        )}

        {phase === 'calculating' && breakdown && (
          <div className="animate-fade-in w-full">
            <h2 className="text-xl font-bold text-foreground mb-6">Calculating Scarcity Signal...</h2>

            <div className="space-y-3 mb-6">
              {[
                { icon: Building2, label: 'Venue', key: 'venue', max: 40 },
                { icon: MapPin, label: 'City', key: 'city', max: 30 },
                { icon: Ticket, label: 'Event', key: 'event', max: 20 },
                { icon: Globe, label: 'Tour', key: 'volume', max: 10 },
              ].map(({ icon: Icon, label, key, max }) => (
                <div
                  key={key}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg transition-all duration-300',
                    slotValues[key as keyof typeof slotValues].revealed
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-muted/30 border border-muted/20',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'font-mono text-lg font-bold transition-all',
                        slotValues[key as keyof typeof slotValues].revealed ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {slotValues[key as keyof typeof slotValues].current}
                    </span>
                    <span className="text-xs text-muted-foreground">/{max}</span>
                  </div>
                </div>
              ))}
            </div>

            {totalRevealed && rarityResult && tierInfo && (
              <div
                className="p-4 rounded-xl border-2 rarity-total-pop"
                style={{
                  borderColor: tierInfo.color,
                  background: withHexAlpha(tierInfo.color, '15'),
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

        {phase === 'reveal' && (
          <div className="animate-scale-in">
            <div className="relative reveal-gem-wrap mb-8">
              <div
                className="reveal-core-glow"
                style={{
                  background: `radial-gradient(circle, ${withHexAlpha(gradientBaseColor, '75')} 0%, transparent 65%)`,
                  ['--glow-duration' as string]: `${profile.revealMs + 900}ms`,
                }}
              />
              <div className="reveal-caustics" />

              <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
                <defs>
                  <linearGradient id={revealGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={withHexAlpha(gradientBaseColor, 'E5')} />
                    <stop offset="42%" stopColor={gradientBaseColor} />
                    <stop offset="100%" stopColor={withHexAlpha(gradientBaseColor, '80')} />
                  </linearGradient>
                  <radialGradient id={specularId} cx="30%" cy="24%" r="65%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                    <stop offset="35%" stopColor="rgba(255,255,255,0.14)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </radialGradient>
                </defs>

                <path d="M50 10 L15 40 L50 90 L85 40 Z" fill={`url(#${revealGradientId})`} stroke={gradientBaseColor} strokeWidth="1.4" />
                <path d="M50 10 L15 40 L85 40 Z" fill="rgba(255,255,255,0.2)" />
                <path d="M15 40 L50 40 L50 90 Z" fill="rgba(0,0,0,0.15)" />
                <path d="M85 40 L50 40 L50 90 Z" fill="rgba(255,255,255,0.06)" />
                <path d="M50 22 L33 40 L50 73 L68 40 Z" fill={`url(#${specularId})`} />
                <path d="M50 10 L27 36 L36 38 Z" fill="rgba(255,255,255,0.4)" />
                <path d="M73 36 L50 10 L64 38 Z" fill="rgba(255,255,255,0.32)" />
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
              <p className="text-lg text-foreground">Gem Crystallized</p>
            </div>
          </div>
        )}

        {phase === 'summary' && (
          <div className="animate-fade-in space-y-6 w-full">
            <div className="relative">
              <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
                <defs>
                  <linearGradient id={summaryGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={withHexAlpha(gradientBaseColor, 'CC')} />
                    <stop offset="50%" stopColor={gradientBaseColor} />
                    <stop offset="100%" stopColor={withHexAlpha(gradientBaseColor, '99')} />
                  </linearGradient>
                </defs>

                <path d="M50 10 L15 40 L50 90 L85 40 Z" fill={`url(#${summaryGradientId})`} stroke={gradientBaseColor} strokeWidth="1" />
                <path d="M50 10 L15 40 L85 40 Z" fill="rgba(255,255,255,0.25)" />
                <path d="M15 40 L50 40 L50 90 Z" fill="rgba(0,0,0,0.1)" />
              </svg>
            </div>

            {tierInfo && rarityResult && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mx-auto"
                style={{
                  background: withHexAlpha(tierInfo.color, '20'),
                  border: `1px solid ${withHexAlpha(tierInfo.color, '40')}`,
                }}
              >
                <span className="text-xl">{tierInfo.emoji}</span>
                <span className="font-bold" style={{ color: tierInfo.color }}>
                  {tierInfo.label}
                </span>
                <span className="text-sm text-muted-foreground">({rarityResult.total_score}/100)</span>
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{artistName}</h2>
              <p className="text-sm text-muted-foreground">{genreName} Gem</p>
              {eventName && <p className="text-sm text-muted-foreground">{eventName}</p>}
              {venueName && <p className="text-sm text-muted-foreground/80">@ {venueName}</p>}
              <p className="text-xs text-muted-foreground/70">
                {new Date(eventDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

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

            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto pt-4">
              <Button onClick={onContinue} variant="neon" className="w-full gap-2">
                Mine Another Gem
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button onClick={onClose} variant="ghost" className="w-full">
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
