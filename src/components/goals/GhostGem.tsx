import { UserGoal } from '@/hooks/useUserGoals';
import { cn } from '@/lib/utils';
import { CountdownTimer } from './CountdownTimer';
import { Target, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GhostGemProps {
  goal: UserGoal;
  onRemove?: (goalId: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const GhostGem = ({ goal, onRemove, size = 'md' }: GhostGemProps) => {
  const sizeStyles = {
    sm: 'w-16 h-20',
    md: 'w-20 h-24',
    lg: 'w-24 h-28',
  };

  const gemSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 group cursor-pointer',
              sizeStyles[size]
            )}
          >
            {/* Remove button */}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(goal.id);
                }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Ghost Gem Visual */}
            <div
              className={cn(
                'relative rounded-xl flex items-center justify-center',
                'border-2 border-dashed border-primary/30',
                'bg-primary/5',
                'animate-pulse',
                gemSizes[size]
              )}
            >
              {/* Pulsing inner glow */}
              <div className="absolute inset-2 rounded-lg bg-primary/10 animate-ping" 
                   style={{ animationDuration: '2s' }} 
              />
              
              {/* Ghost gem shape */}
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  className={cn(
                    'text-primary/30',
                    size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10'
                  )}
                  fill="currentColor"
                >
                  <path d="M12 2L2 9l10 13 10-13L12 2zm0 3.5L18.5 9 12 18 5.5 9 12 5.5z" />
                </svg>
              </div>

              {/* Target icon */}
              <Target className="absolute w-4 h-4 text-primary/50 top-1 right-1" />
            </div>

            {/* Event name */}
            <span className="text-[10px] text-muted-foreground text-center line-clamp-1 max-w-full px-1">
              {goal.reference_name}
            </span>

            {/* Countdown */}
            {goal.target_date && (
              <CountdownTimer targetDate={goal.target_date} size="xs" />
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="top" className="glass-card border-border/50 p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">Main Quest</span>
            </div>
            <p className="text-sm text-muted-foreground">{goal.reference_name}</p>
            {goal.target_date && (
              <CountdownTimer targetDate={goal.target_date} size="sm" showLabel />
            )}
            <p className="text-xs text-primary/70">
              Mine this gem to complete the quest!
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
