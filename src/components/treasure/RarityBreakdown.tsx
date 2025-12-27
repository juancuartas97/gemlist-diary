import { cn } from '@/lib/utils';
import { type RarityResult, RARITY_TIERS, getRarityBreakdown } from '@/hooks/useRarityCalculator';

interface RarityBreakdownProps {
  rarityResult: RarityResult | null | undefined;
  className?: string;
}

const ScoreBar = ({ 
  label, 
  score, 
  maxScore, 
  count, 
  description, 
  color 
}: { 
  label: string; 
  score: number; 
  maxScore: number; 
  count: number;
  description: string;
  color: string;
}) => {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{score}/{maxScore}</span>
      </div>
      <div className="relative h-2 rounded-full bg-background/50 overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground/60 italic">{description}</span>
        <span className="text-muted-foreground/60">({count} found)</span>
      </div>
    </div>
  );
};

export const RarityBreakdown = ({ rarityResult, className }: RarityBreakdownProps) => {
  if (!rarityResult) {
    return null;
  }
  
  const breakdown = getRarityBreakdown(rarityResult);
  const tier = RARITY_TIERS[rarityResult.rarity_tier as keyof typeof RARITY_TIERS] || RARITY_TIERS.common;
  
  // Get descriptions based on counts
  const getVenueDescription = (count: number) => {
    if (count === 0) return "First time at this venue!";
    if (count === 1) return "Only played once before";
    if (count <= 3) return "Rare venue appearance";
    if (count <= 5) return "Occasional venue";
    return "Regular venue";
  };
  
  const getCityDescription = (count: number) => {
    if (count === 0) return "First time in this city!";
    if (count === 1) return "Only visited once before";
    if (count <= 3) return "Rare city visit";
    if (count <= 6) return "Occasional city";
    return "Frequent city";
  };
  
  const getEventDescription = (count: number) => {
    if (count === 0) return "First time at this event!";
    if (count === 1) return "Only appeared once before";
    if (count <= 3) return "Rare event booking";
    return "Regular at this event";
  };
  
  const getVolumeDescription = (count: number) => {
    if (count <= 5) return "Exclusive tour";
    if (count <= 15) return "Limited tour";
    if (count <= 30) return "Selective tour";
    if (count <= 60) return "Active tour";
    return "World tour";
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with total score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{tier.emoji}</span>
          <span className="text-sm font-semibold" style={{ color: tier.color }}>
            {tier.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Score:</span>
          <span className="font-mono font-bold text-lg" style={{ color: tier.color }}>
            {rarityResult.total_score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      
      {/* Score bars */}
      <div className="space-y-3">
        <ScoreBar 
          label="Venue Scarcity"
          score={breakdown.venue.score}
          maxScore={breakdown.venue.maxScore}
          count={breakdown.venue.count}
          description={getVenueDescription(breakdown.venue.count)}
          color="#10b981"
        />
        <ScoreBar 
          label="City Frequency"
          score={breakdown.city.score}
          maxScore={breakdown.city.maxScore}
          count={breakdown.city.count}
          description={getCityDescription(breakdown.city.count)}
          color="#3b82f6"
        />
        <ScoreBar 
          label="Event History"
          score={breakdown.event.score}
          maxScore={breakdown.event.maxScore}
          count={breakdown.event.count}
          description={getEventDescription(breakdown.event.count)}
          color="#8b5cf6"
        />
        <ScoreBar 
          label="Tour Volume"
          score={breakdown.volume.score}
          maxScore={breakdown.volume.maxScore}
          count={breakdown.volume.count}
          description={getVolumeDescription(breakdown.volume.count)}
          color="#f59e0b"
        />
      </div>
      
      {/* Tier description */}
      <div className="text-xs text-muted-foreground/80 text-center italic pt-2 border-t border-border/20">
        {tier.description}
      </div>
    </div>
  );
};
