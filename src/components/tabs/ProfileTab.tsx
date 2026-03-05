import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, ChevronRight, Flame } from 'lucide-react';
import { TasteMapVisual } from '@/components/TasteMapVisual';
import { TrophyCase } from '@/components/achievements/TrophyCase';
import { GoalsList } from '@/components/goals/GoalsList';
import { AddGoalModal } from '@/components/goals/AddGoalModal';
import { useAuth } from '@/hooks/useAuth';
import { useUnlockedAchievements } from '@/hooks/useAchievements';
import { AchievementPin } from '@/components/achievements/AchievementPin';
import { useUserGems } from '@/hooks/useGemData';

// Rarity tier → display config
const RARITY_DISPLAY: Record<string, { label: string; color: string; emoji: string }> = {
  legendary: { label: 'Legendary', color: 'text-amber-400',   emoji: '💎' },
  rare:       { label: 'Rare',      color: 'text-blue-400',    emoji: '🔷' },
  uncommon:   { label: 'Uncommon',  color: 'text-emerald-400', emoji: '🟢' },
  common:     { label: 'Common',    color: 'text-white/50',    emoji: '⚪' },
};

function getRarityDisplay(tier?: string | null) {
  return RARITY_DISPLAY[(tier ?? '').toLowerCase()] ?? RARITY_DISPLAY.common;
}

// Average non-null facet ratings → 0-5 star equivalent
function avgFacets(facets: { sound_quality?: number | null; energy?: number | null; performance?: number | null; crowd?: number | null } | null): number | null {
  if (!facets) return null;
  const vals = [facets.sound_quality, facets.energy, facets.performance, facets.crowd]
    .filter((v): v is number => v !== null && v !== undefined);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length / 20); // 0-100 → 0-5
}

export const ProfileTab = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: unlockedAchievements } = useUnlockedAchievements(user?.id);
  const { gems, loading: gemsLoading } = useUserGems(user?.id);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Raver';

  // Derive top genres from real gem data
  const topGenres = useMemo(() => {
    if (!gems.length) return [];
    const counts = new Map<string, { name: string; count: number }>();
    gems.forEach(gem => {
      if (gem.genre?.name && gem.primary_genre_id) {
        const existing = counts.get(gem.primary_genre_id) ?? { name: gem.genre.name, count: 0 };
        counts.set(gem.primary_genre_id, { name: existing.name, count: existing.count + 1 });
      }
    });
    const sorted = Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const total = sorted.reduce((sum, g) => sum + g.count, 0);
    return sorted.map(g => ({
      name: g.name,
      weight: total > 0 ? Math.round((g.count / total) * 100) : 0,
    }));
  }, [gems]);

  // Recent 5 gems
  const recentGems = gems.slice(0, 5);

  // Streak: count of consecutive weeks (best run in last 6 months)
  const streakWeeks = useMemo(() => {
    if (!gems.length) return 0;
    const weeks = new Set(
      gems
        .filter(g => g.event_date)
        .map(g => {
          const d = new Date(g.event_date);
          // ISO week key
          const day = d.getDay() || 7;
          d.setDate(d.getDate() + 4 - day);
          return `${d.getFullYear()}-W${Math.ceil(((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7)}`;
        })
    );
    return weeks.size; // simplified: unique active weeks shown as streak context
  }, [gems]);

  // Unlocked streak achievement (highest tier)
  const streakAchievement = unlockedAchievements
    ?.filter(ua => ua.achievement.category === 'streak')
    .sort((a, b) => b.achievement.tier - a.achievement.tier)[0];

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
        {streakAchievement && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs text-orange-400 font-medium">
              {streakAchievement.achievement.name} streak
            </span>
          </div>
        )}
      </div>

      {/* Artists Portal */}
      <button
        onClick={() => navigate('/artists')}
        className="glass-card p-4 rounded-2xl w-full flex items-center gap-3 hover:border-primary/40 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Music className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-foreground">Artists</p>
          <p className="text-xs text-muted-foreground">View your collected artists</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Badges - Enamel Pin Style */}
      {unlockedAchievements && unlockedAchievements.length > 0 && (
        <div className="glass-card p-5 rounded-2xl">
          <h3 className="text-lg font-semibold text-foreground mb-4">Badges</h3>
          <div
            className="flex items-start gap-6 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {unlockedAchievements.map((ua) => (
              <AchievementPin
                key={ua.id}
                achievement={ua.achievement}
                referenceName={ua.reference_name}
                unlockedAt={ua.unlocked_at}
                size="md"
                showLabel
              />
            ))}
          </div>
        </div>
      )}

      {/* Trophy Case */}
      <TrophyCase />

      {/* Active Quests */}
      <GoalsList onAddGoal={() => setShowAddGoalModal(true)} />

      {/* Taste Map */}
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Taste Map</h3>
        <TasteMapVisual />

        {topGenres.length > 0 && (
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
        )}
      </div>

      {/* Recent Gems */}
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Gems</h3>
        {gemsLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        ) : recentGems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No gems yet. Start mining!
          </p>
        ) : (
          <div className="space-y-3">
            {recentGems.map((gem) => {
              const rarity = getRarityDisplay(gem.rarity_tier);
              const avg = avgFacets(gem.facet_ratings);
              return (
                <div key={gem.id} className="flex items-center gap-3 p-2 rounded-lg bg-card/30">
                  {/* Rarity indicator */}
                  <div className="w-8 h-8 rounded-lg bg-card/50 flex items-center justify-center shrink-0">
                    <span className="text-base leading-none">{rarity.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {gem.dj?.stage_name ?? 'Unknown DJ'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {gem.venue?.name ?? gem.event_date}
                    </p>
                  </div>
                  {avg !== null ? (
                    <div className="flex gap-0.5 shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${i < avg ? 'bg-primary' : 'bg-muted/30'}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className={`text-xs font-medium shrink-0 ${rarity.color}`}>
                      {rarity.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-primary">{gems.length}</p>
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
