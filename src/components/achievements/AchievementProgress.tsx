import { Achievement } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface AchievementProgressProps {
  achievement: Achievement;
  currentCount: number;
  referenceName?: string | null;
}

const colorTierAccents = {
  bronze: 'text-amber-500',
  silver: 'text-slate-400',
  gold: 'text-yellow-500',
  platinum: 'text-cyan-400',
};

export const AchievementProgress = ({
  achievement,
  currentCount,
  referenceName,
}: AchievementProgressProps) => {
  const threshold = achievement.threshold || 1;
  const progress = Math.min((currentCount / threshold) * 100, 100);
  const isComplete = currentCount >= threshold;
  const tier = achievement.color_tier || 'bronze';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card/30 border border-border/30">
      <span className="text-2xl">{achievement.icon_emoji}</span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={cn(
            'text-sm font-medium truncate',
            isComplete ? colorTierAccents[tier] : 'text-foreground'
          )}>
            {referenceName ? `${referenceName}` : achievement.name}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {currentCount}/{threshold}
          </span>
        </div>
        
        <Progress 
          value={progress} 
          className={cn(
            'h-1.5',
            isComplete && 'bg-muted/50'
          )}
        />
        
        {!isComplete && (
          <p className="text-[10px] text-muted-foreground mt-1">
            {threshold - currentCount} more to unlock {achievement.name}
          </p>
        )}
      </div>
    </div>
  );
};
