import { Achievement } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AchievementPinProps {
  achievement: Achievement;
  referenceName?: string | null;
  unlockedAt?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const colorTierStyles = {
  bronze: {
    bg: 'bg-gradient-to-br from-amber-700/80 to-amber-900/80',
    border: 'border-amber-600/50',
    glow: 'shadow-amber-500/30',
    text: 'text-amber-200',
  },
  silver: {
    bg: 'bg-gradient-to-br from-slate-300/80 to-slate-500/80',
    border: 'border-slate-400/50',
    glow: 'shadow-slate-300/30',
    text: 'text-slate-100',
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-400/80 to-amber-600/80',
    border: 'border-yellow-300/50',
    glow: 'shadow-yellow-400/40',
    text: 'text-yellow-100',
  },
  platinum: {
    bg: 'bg-gradient-to-br from-cyan-200/80 to-purple-400/80',
    border: 'border-cyan-300/50',
    glow: 'shadow-cyan-300/40',
    text: 'text-cyan-100',
  },
};

const sizeStyles = {
  sm: 'w-12 h-12 text-lg',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-20 h-20 text-3xl',
};

export const AchievementPin = ({
  achievement,
  referenceName,
  unlockedAt,
  size = 'md',
  showLabel = true,
}: AchievementPinProps) => {
  const tier = achievement.color_tier || 'bronze';
  const styles = colorTierStyles[tier];

  const displayName = referenceName 
    ? `${referenceName} - ${achievement.name}`
    : achievement.name;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div
              className={cn(
                'rounded-xl flex items-center justify-center',
                'border-2 transition-all duration-300',
                'hover:scale-110 hover:shadow-lg',
                styles.bg,
                styles.border,
                `shadow-md ${styles.glow}`,
                sizeStyles[size]
              )}
            >
              <span className="drop-shadow-lg">{achievement.icon_emoji}</span>
            </div>
            
            {showLabel && (
              <span className="text-[10px] text-muted-foreground text-center line-clamp-2 max-w-16">
                {referenceName || achievement.name}
              </span>
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent 
          side="top" 
          className="glass-card border-border/50 p-3 max-w-48"
        >
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{displayName}</p>
            {achievement.description && (
              <p className="text-xs text-muted-foreground">{achievement.description}</p>
            )}
            {unlockedAt && (
              <p className="text-xs text-primary">
                Unlocked {format(new Date(unlockedAt), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
