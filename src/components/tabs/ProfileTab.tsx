import { useState } from 'react';
import { GemBadge } from '@/components/GemBadge';
import { StarRating } from '@/components/StarRating';
import { TasteMapVisual } from '@/components/TasteMapVisual';
import { TrophyCase } from '@/components/achievements/TrophyCase';
import { GoalsList } from '@/components/goals/GoalsList';
import { AddGoalModal } from '@/components/goals/AddGoalModal';
import { getSets, getTasteProfile } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';

export const ProfileTab = () => {
  const { user, profile } = useAuth();
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const sets = getSets();
  const tasteProfile = getTasteProfile();
  const recentSets = sets.slice(0, 5);
  const topGenres = tasteProfile.topGenres.slice(0, 5);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Raver';

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="glass-card p-6 rounded-2xl text-center">
        <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary mx-auto mb-3 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
        {profile && (
          <p className="text-sm text-primary mt-1">
            {profile.raver_rank} • {profile.total_gems} gems collected
          </p>
        )}
      </div>

      {/* Trophy Case */}
      <TrophyCase />

      {/* Active Quests */}
      <GoalsList onAddGoal={() => setShowAddGoalModal(true)} />

      {/* Taste Map */}
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Taste Map</h3>
        <TasteMapVisual />
        
        <div className="mt-4 space-y-3">
          {topGenres.map((genre) => (
            <div key={genre.name} className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground w-24 truncate">{genre.name}</span>
              <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                  style={{ width: `${genre.weight}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">{genre.weight}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sets */}
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Gems</h3>
        {recentSets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No gems yet. Start mining!
          </p>
        ) : (
          <div className="space-y-3">
            {recentSets.map((set) => (
              <div key={set.id} className="flex items-center gap-3 p-2 rounded-lg bg-card/30">
                <GemBadge type={set.gemType} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{set.djName}</p>
                  <p className="text-xs text-muted-foreground truncate">{set.venue}</p>
                </div>
                <StarRating rating={set.rating} readonly size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-primary">{sets.length}</p>
          <p className="text-xs text-muted-foreground">Total Gems</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-lg font-bold text-foreground truncate">
            {topGenres[0]?.name || 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">Top Genre</p>
        </div>
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal 
        open={showAddGoalModal} 
        onOpenChange={setShowAddGoalModal} 
      />
    </div>
  );
};