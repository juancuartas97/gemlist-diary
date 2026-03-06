import { useState } from 'react';
import { BarChart3, Gem, Loader2, Pickaxe, Info, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserGems, type UserGem } from '@/hooks/useGemData';
import { useMemo } from 'react';
import GemCard from '@/components/gems/GemCard';
import { GemDetailModal } from '@/components/treasure/GemDetailModal';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

// ── Greeting helper ──────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Still up?';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// ── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="glass-card px-3 py-3 text-center flex-1 min-w-0">
      <p className="font-display font-bold text-white text-xl leading-none mb-0.5">{value}</p>
      <p className="text-[10px] text-white/35 uppercase tracking-wide leading-none">{label}</p>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function HomeEmptyState({ onMine }: { onMine?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full blur-3xl bg-emerald-400/15 scale-[2]" />
        <Gem className="relative w-16 h-16 text-white/12" strokeWidth={1} />
      </div>
      <p className="font-display font-semibold text-white/50 text-lg mb-1">No gems yet</p>
      <p className="text-white/30 text-sm mb-6 max-w-[200px] leading-relaxed">
        Go catch some music. Your first gem is already out there.
      </p>
      {onMine && (
        <Button
          onClick={onMine}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold bg-white/8 border border-white/12 text-white/70 hover:bg-white/12 hover:text-white transition-all"
        >
          <Pickaxe className="w-4 h-4" />
          Mine your first gem
        </Button>
      )}
    </div>
  );
}

// ── Main tab ─────────────────────────────────────────────────────────────────

interface HomeTabProps {
  onMine?: () => void;
  onVibePress?: () => void; // navigate to Map tab
}

export const HomeTab = ({ onMine, onVibePress }: HomeTabProps) => {
  const { user, profile } = useAuth();
  const { gems, loading, refetch } = useUserGems(user?.id);

  // Detail modal state
  const [selectedGem, setSelectedGem] = useState<UserGem | null>(null);

  // "Your Vibe" info tooltip
  const [showVibeInfo, setShowVibeInfo] = useState(false);

  const metrics = useMemo(() => {
    const totalGems     = gems.length;
    const recentGems    = gems.slice(0, 3);
    const lastMined     = gems[0] ?? null;

    // Genre weights
    const genreCounts: Record<string, { count: number; color: string }> = {};
    gems.forEach(gem => {
      const name  = gem.genre?.name ?? 'Unknown';
      const color = gem.genre?.color_hex ?? '#6ee7b7';
      if (!genreCounts[name]) genreCounts[name] = { count: 0, color };
      genreCounts[name].count++;
    });

    const genreWeights = Object.entries(genreCounts)
      .map(([name, { count, color }]) => ({
        name,
        color,
        weight: totalGems ? Math.round((count / totalGems) * 100) : 0,
      }))
      .sort((a, b) => b.weight - a.weight);

    const uniqueVenues  = new Set(gems.map(g => g.venue_id).filter(Boolean)).size;
    const uniqueArtists = new Set(gems.map(g => g.dj_id)).size;

    const lastDate = lastMined?.event_date
      ? format(new Date(lastMined.event_date), 'MMM d')
      : null;

    return {
      totalGems,
      recentGems,
      lastMined,
      lastDate,
      genreWeights: genreWeights.slice(0, 4),
      topGenreColor: genreWeights[0]?.color ?? '#6ee7b7',
      uniqueVenues,
      uniqueArtists,
    };
  }, [gems]);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Raver';
  const firstName   = displayName.split(' ')[0];
  const avatarUrl   =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const isEmpty = metrics.totalGems === 0;

  return (
    <>
      <div className="pt-4 pb-4 space-y-5">

        {/* ── Greeting header ────────────────────────────────────────── */}
        <div className="px-4 flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-11 h-11 rounded-full object-cover border-2 border-primary/30 shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-primary/15 border-2 border-primary/25 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold font-display text-primary">
                {firstName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-white/35">{getGreeting()}</p>
            <h1 className="font-display font-bold text-white text-xl leading-tight truncate">
              {firstName}
            </h1>
          </div>
          {metrics.totalGems > 0 && (
            <div className="shrink-0 text-right">
              <p className="font-display font-bold text-primary text-xl leading-none">
                {metrics.totalGems}
              </p>
              <p className="text-[9px] text-white/30 uppercase tracking-wide">gems</p>
            </div>
          )}
        </div>

        {/* ── Empty state ───────────────────────────────────────────── */}
        {isEmpty ? (
          <HomeEmptyState onMine={onMine} />
        ) : (
          <>
            {/* ── Quick stats ─────────────────────────────────────── */}
            <div className="px-4 flex gap-2">
              <StatChip label="Artists" value={metrics.uniqueArtists} />
              <StatChip label="Venues"  value={metrics.uniqueVenues}  />
            </div>

            {/* ── Your Vibe (genre mini-bars) ───────────────────────── */}
            {metrics.genreWeights.length > 0 && (
              <div className="px-4">
                {/* Card tinted with top genre color */}
                <button
                  className="glass-card w-full text-left p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    borderColor: metrics.topGenreColor + '35',
                    background: `linear-gradient(135deg, ${metrics.topGenreColor}08 0%, transparent 60%)`,
                  }}
                  onClick={onVibePress}
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-3.5 h-3.5 text-primary" />
                    <p className="font-display font-semibold text-white text-xs uppercase tracking-widest flex-1">
                      Your Vibe
                    </p>
                    {/* Info icon — stops propagation so tap doesn't navigate */}
                    <button
                      className="p-1 -m-1 rounded-lg"
                      onClick={e => { e.stopPropagation(); setShowVibeInfo(v => !v); }}
                      aria-label="How is this calculated?"
                    >
                      <Info className="w-3.5 h-3.5 text-white/25 hover:text-white/50 transition-colors" />
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                  </div>

                  {/* Info tooltip */}
                  {showVibeInfo && (
                    <div className="mb-3 px-2.5 py-2 rounded-xl bg-white/6 border border-white/8 text-[11px] text-white/45 leading-relaxed">
                      Weighted by how many sets you've logged per genre. The more you log, the more accurate your vibe becomes.
                    </div>
                  )}

                  {/* Genre bars — each bar uses its genre's color + glow */}
                  <div className="space-y-2.5">
                    {metrics.genreWeights.map(genre => (
                      <div key={genre.name}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-medium text-white/70 truncate max-w-[60%]">
                            {genre.name}
                          </span>
                          <span className="text-[10px] text-white/35 shrink-0 ml-2">{genre.weight}%</span>
                        </div>
                        <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.max(genre.weight, 5)}%`,
                              backgroundColor: genre.color,
                              boxShadow: `0 0 8px ${genre.color}90`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </button>
              </div>
            )}

            {/* ── Freshly Mined ─────────────────────────────────────── */}
            <div className="px-4">
              <div className="flex items-center gap-2 mb-3">
                <Gem className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                <h2 className="font-display font-semibold text-white text-xs uppercase tracking-widest">
                  Freshly Mined
                </h2>
              </div>
              {/* Preview cards — gem is hero, tap to open detail modal */}
              <div className="space-y-2">
                {metrics.recentGems.map(gem => (
                  <GemCard
                    key={gem.id}
                    gem={gem}
                    previewMode
                    onClick={setSelectedGem}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Gem detail modal ────────────────────────────────────────── */}
      <GemDetailModal
        gem={selectedGem}
        open={!!selectedGem}
        onOpenChange={open => { if (!open) setSelectedGem(null); }}
        onGemDeleted={() => { setSelectedGem(null); refetch?.(); }}
      />
    </>
  );
};
