import { useAuth } from '@/hooks/useAuth';
import { useActiveGoals, useDeleteGoal, UserGoal } from '@/hooks/useUserGoals';
import { CountdownTimer } from './CountdownTimer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, User, MapPin, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalsListProps {
  onAddGoal?: () => void;
}

const goalTypeConfig = {
  target_event: {
    icon: Target,
    label: 'Target Event',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  holy_grail_artist: {
    icon: User,
    label: 'Grail Artist',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  holy_grail_venue: {
    icon: MapPin,
    label: 'Grail Venue',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
};

export const GoalsList = ({ onAddGoal }: GoalsListProps) => {
  const { user } = useAuth();
  const { data: goals, isLoading } = useActiveGoals(user?.id);
  const deleteGoal = useDeleteGoal();

  const handleRemove = (goalId: string) => {
    if (!user?.id) return;
    deleteGoal.mutate({ goalId, userId: user.id });
  };

  if (isLoading) {
    return (
      <div className="glass-card p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Active Quests</h3>
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const activeGoals = goals || [];

  return (
    <div className="glass-card p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Active Quests</h3>
        </div>
        {onAddGoal && (
          <Button variant="ghost" size="sm" onClick={onAddGoal} className="h-8">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      {activeGoals.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
            <Target className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            No active quests. Set a target to chase!
          </p>
          {onAddGoal && (
            <Button variant="outline" size="sm" onClick={onAddGoal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Quest
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {activeGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
};

interface GoalCardProps {
  goal: UserGoal;
  onRemove: (goalId: string) => void;
}

const GoalCard = ({ goal, onRemove }: GoalCardProps) => {
  const config = goalTypeConfig[goal.goal_type];
  const Icon = config.icon;

  return (
    <div className={cn(
      'relative flex items-center gap-3 p-3 rounded-lg border border-border/30',
      config.bgColor
    )}>
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bgColor)}>
        <Icon className={cn('w-5 h-5', config.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {goal.reference_name}
        </p>
        <p className={cn('text-xs', config.color)}>{config.label}</p>
      </div>

      {goal.target_date && (
        <CountdownTimer targetDate={goal.target_date} size="sm" />
      )}

      <button
        onClick={() => onRemove(goal.id)}
        className="w-6 h-6 rounded-full bg-muted/50 hover:bg-destructive/50 flex items-center justify-center transition-colors"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
};
