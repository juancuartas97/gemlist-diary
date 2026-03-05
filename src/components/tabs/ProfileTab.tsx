import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ChevronRight, Music, Settings } from 'lucide-react';
import { TrophyCase } from '@/components/achievements/TrophyCase';
import { GoalsList } from '@/components/goals/GoalsList';
import { AddGoalModal } from '@/components/goals/AddGoalModal';
import { AchievementPin } from '@/components/achievements/AchievementPin';
import { useAuth } from '@/hooks/useAuth';
import { useUnlockedAchievements } from '@/hooks/useAchievements';
import { useUserGems } from '@/hooks/useGemData';

// ── Helpers ─────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium mb-2.5 px-4">
      {children}
    </p>
  );
}

function StatChip({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="glass-card flex-1 p-3 text-center">
      <p className="font-display font-bold text-white text-xl leading-none mb-1">{value}</p>
      <p className="text-[10px] text-white/35 uppercase tracking-wide">{label}</p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export const ProfileTab = () => {
  const navigate                            = useNavigate();
  const { user, profile }                   = useAuth();
  const { data: unlockedAchievements }      = useUnlockedAchievements(user?.id);
  const { gems, loading: gemsLoading }      = useUserGems(user?.id);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Raver';
  const firstName   = displayName.split(' ')[0];
  const avatarUrl   =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture;

  // ── Derived stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!gems.length) return null;

    const uniqueArtists = new Set(gems.map(g => g.dj_id)).size;
    const uniqueVenues  = new Set(gems.map(g => g.venue_id).filter(Boolean)).size;

    // Genre breakdown
    const genreCounts = new Map<string, { name: string; count: number; color: string }>();
    gems.forEach(gem => {
      if (gem.genre?.name && gem.primary_genre_id) {
        const existing = genreCounts.get(gem.primary_genre_id) ?? {
          name: gem.genre.name, count: 0, color: gem.genre.color_hex ?? '#6ee7b7',
        };
        genreCounts.set(gem.primary_genre_id, { ...existing, count: existing.count + 1 });
      }
    });
    const sorted = Array.from(genreCounts.values()).sort((a, b) => b.count - a.count).slice(0, 5);
    const total  = sorted.reduce((sum, g) => sum + g.count, 0);
    const topGenres = sorted.map(g => ({
      name:  g.name,
      color: g.color,
      weight: total > 0 ? Math.round((g.count / total) * 100) : 0,
    }));

    return { total: gems.length, uniqueArtists, uniqueVenues, topGenres };
  }, [gems]);

  // Streak achievement — highest unlocked tier
  const streakAchievement = unlockedAchievements
    ?.filter(ua => ua.achievement.category === 'streak')
    .sort((a, b) => b.achievement.tier - a.achievement.tier)[0];

  return (
    <div className="pt-4 pb-6 space-y-6">

      {/* ── Profile hero ─────────────────────────────────────────── */}
      <div className="px-4">
        <div className="glass-card p-5 rounded-2xl text-center">
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-primary/40 mx-auto mb-3"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/35 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold font-display text-primary">
                {firstName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Name */}
          <h2 className="font-display font-bold text-white text-xl mb-0.5">{displayName}</h2>

          {/* Rank */}
          {profile && (
            <p className="text-sm text-primary">
              {profile.raver_rank}
            </p>
          )}

          {/* Streak badge */}
          {streakAchievement && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-orange-400/10 border border-orange-400/20">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs text-orange-400 font-medium">
                {streakAchievement.achievement.name}
              </span>
            </div>
          )}

          {/* Quick stats row */}
          {stats && (
            <div className="flex gap-2 mt-4">
              <StatChip value={stats.total}          label="Gems"    />
              <StatChip value={stats.uniqueArtists}  label="Artists" />
              <StatChip value={stats.uniqueVenues}   label="Venues"  />
            </div>
          )}
        </div>
      </div>

      {/* ── Badges (unlocked achievements) ───────────────────────── */}
      {unlockedAchievements && unlockedAchievements.length > 0 && (
        <div>
          <SectionLabel>Badges</SectionLabel>
          <div
            className="flex items-start gap-5 overflow-x-auto px-4 pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {unlockedAchievements.map(ua => (
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

      {/* ── Trophy case ──────────────────────────────────────────── */}
      <div className="px-4">
        <TrophyCase />
      </div>

      {/* ── Genre breakdown ──────────────────────────────────────── */}
      {stats && stats.topGenres.length > 0 && (
        <div className="px-4">
          <SectionLabel>Your Sound</SectionLabel>
          <div className="glass-card p-4 rounded-2xl space-y-3">
            {stats.topGenres.map((genre, i) => (
              <div key={genre.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: genre.color }}
                    />
                    <span className="text-[11px] font-medium text-white/70 truncate max-w-[140px]">
                      {genre.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/35 shrink-0">{genre.weight}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${genre.weight}%`,
                      backgroundColor: genre.color,
                      opacity: 0.75,
                      transitionDelay: `${i * 60}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Active quests ────────────────────────────────────────── */}
      <div className="px-4">
        <GoalsList onAddGoal={() => setShowAddGoalModal(true)} />
      </div>

      {/* ── Shortcuts ────────────────────────────────────────────── */}
      <div className="px-4 space-y-2">
        <SectionLabel>More</SectionLabel>

        <button
          onClick={() => navigate('/artists')}
          className="glass-card w-full p-4 rounded-2xl flex items-center gap-3 hover:border-primary/30 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Music className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-display font-semibold text-white">Artists</p>
            <p className="text-[11px] text-white/40">Your full artist collection</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/25 shrink-0" />
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="glass-card w-full p-4 rounded-2xl flex items-center gap-3 hover:border-white/15 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4 text-white/50" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-display font-semibold text-white">Settings</p>
            <p className="text-[11px] text-white/40">Account, privacy, notifications</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/25 shrink-0" />
        </button>
      </div>

      {/* ── Modals ───────────────────────────────────────────────── */}
      <AddGoalModal
        open={showAddGoalModal}
        onOpenChange={setShowAddGoalModal}
      />
    </div>
  );
};
