import { useState, useMemo, useEffect } from 'react';
import { Pickaxe, SlidersHorizontal, ArrowUpDown, X, ChevronDown, ChevronUp, Gem, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserGems, groupGemsByDJ, type UserGem } from '@/hooks/useGemData';
import { useAuth } from '@/hooks/useAuth';
import { useTargetEvents, useDeleteGoal } from '@/hooks/useUserGoals';
import { EnamelPin, type FestivalBadge } from '@/components/treasure/EnamelPin';
import { AddGemModal } from '@/components/treasure/AddGemModal';
import { FestivalLineupModal } from '@/components/treasure/FestivalLineupModal';
import { GemDetailModal } from '@/components/treasure/GemDetailModal';
import { ClusterViewModal } from '@/components/treasure/ClusterViewModal';
import { GhostGem } from '@/components/goals/GhostGem';
import GemCard from '@/components/gems/GemCard';
import { supabase } from '@/integrations/supabase/client';
import edcVegasPin from '@/assets/pins/edc-vegas.png';
import tomorrowlandPin from '@/assets/pins/tomorrowland.png';
import ultraPin from '@/assets/pins/ultra.png';
import lollapaloozaPin from '@/assets/pins/lollapalooza.png';
import factoryTownPin from '@/assets/pins/factory-town.png';
import berghainPin from '@/assets/pins/berghain.png';
import electricForestPin from '@/assets/pins/electric-forest.png';
import coachellaPin from '@/assets/pins/coachella.png';
import lostLandsPin from '@/assets/pins/lost-lands.png';

// Festival badges data
const festivalBadges: FestivalBadge[] = [
  { name: 'EDC Vegas',       date: 'May 2024', color: 'purple', image: edcVegasPin },
  { name: 'Tomorrowland',    date: 'Jul 2024', color: 'gold',   image: tomorrowlandPin },
  { name: 'Ultra',           date: 'Mar 2024', color: 'red',    image: ultraPin },
  { name: 'Berghain',        date: 'Sep 2024', color: 'silver', image: berghainPin },
  { name: 'Lost Lands',      date: 'Sep 2024', color: 'green',  image: lostLandsPin },
  { name: 'Electric Forest', date: 'Jun 2024', color: 'green',  image: electricForestPin },
  { name: 'Coachella',       date: 'Apr 2024', color: 'gold',   image: coachellaPin },
  { name: 'Factory Town',    date: 'Dec 2023', color: 'silver', image: factoryTownPin },
  { name: 'Lollapalooza',    date: 'Aug 2023', color: 'purple', image: lollapaloozaPin },
];

// ── Cluster card (multi-gem by same DJ) ───────────────────────────────────

function ClusterCard({
  gems,
  onClick,
}: {
  gems: UserGem[];
  onClick: (gems: UserGem[]) => void;
}) {
  const dj = gems[0].dj?.stage_name ?? 'Unknown Artist';
  const colors = gems
    .slice(0, 4)
    .map(g => g.genre?.color_hex ?? '#6ee7b7');

  return (
    <button
      onClick={() => onClick(gems)}
      className="glass-card w-full text-left p-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
    >
      <div className="flex items-center gap-3">
        {/* Mini gem stack */}
        <div className="relative w-10 h-10 shrink-0">
          {colors.slice(0, 3).map((c, i) => (
            <div
              key={i}
              className="absolute rounded-lg"
              style={{
                width: 28,
                height: 28,
                top: i * 3,
                left: i * 3,
                backgroundColor: c + '33',
                border: `1px solid ${c}55`,
                zIndex: 3 - i,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-end justify-end">
            <span className="text-[9px] font-bold font-display text-white/80 bg-black/40 rounded-full px-1 leading-4">
              ×{gems.length}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-white text-sm leading-tight truncate">
            {dj}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Layers className="w-3 h-3 text-white/40" />
            <span className="text-[10px] text-white/40">
              {gems.length} gems collected
            </span>
          </div>
          {/* Color dots for genre variety */}
          <div className="flex gap-1 mt-1.5">
            {colors.map((c, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div className="shrink-0 text-white/20">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function ChestEmptyState({ onMine }: { onMine: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Large gem icon with ambient glow */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full blur-3xl bg-emerald-400/20 scale-150" />
        <Gem className="relative w-16 h-16 text-white/20" strokeWidth={1} />
      </div>

      <p className="font-display font-semibold text-white/60 text-lg mb-1">
        Your chest is empty
      </p>
      <p className="text-white/35 text-sm mb-6 max-w-[200px] leading-relaxed">
        Go catch some music. Your first gem is waiting.
      </p>

      <Button
        onClick={onMine}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold bg-white/10 border border-white/15 text-white hover:bg-white/15 transition-all"
      >
        <Pickaxe className="w-4 h-4" />
        Mine your first gem
      </Button>
    </div>
  );
}

// ── Filter panel ───────────────────────────────────────────────────────────

interface FilterPanelProps {
  options: { genres: string[]; artists: string[]; venues: string[] };
  filterGenre: string | null;
  filterArtist: string | null;
  filterVenue: string | null;
  onGenre: (v: string | null) => void;
  onArtist: (v: string | null) => void;
  onVenue: (v: string | null) => void;
  onClear: () => void;
}

function FilterPanel({
  options, filterGenre, filterArtist, filterVenue,
  onGenre, onArtist, onVenue, onClear,
}: FilterPanelProps) {
  const hasActive = filterGenre || filterArtist || filterVenue;

  const Chip = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`
        px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all
        ${active
          ? 'bg-white/15 border-white/30 text-white'
          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
        }
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="px-4 pt-3 pb-2 border-b border-white/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-display font-semibold text-white/80">Filters</span>
        {hasActive && (
          <button onClick={onClear} className="text-xs text-white/50 flex items-center gap-1 hover:text-white/70">
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {options.genres.length > 0 && (
        <div className="mb-3">
          <label className="text-[10px] uppercase tracking-wide text-white/30 mb-1.5 block">Genre</label>
          <div className="flex flex-wrap gap-1.5">
            {options.genres.map(g => (
              <Chip key={g} label={g} active={filterGenre === g} onClick={() => onGenre(filterGenre === g ? null : g)} />
            ))}
          </div>
        </div>
      )}

      {options.artists.length > 0 && (
        <div className="mb-3">
          <label className="text-[10px] uppercase tracking-wide text-white/30 mb-1.5 block">Artist</label>
          <div className="flex flex-wrap gap-1.5">
            {options.artists.map(a => (
              <Chip key={a} label={a} active={filterArtist === a} onClick={() => onArtist(filterArtist === a ? null : a)} />
            ))}
          </div>
        </div>
      )}

      {options.venues.length > 0 && (
        <div>
          <label className="text-[10px] uppercase tracking-wide text-white/30 mb-1.5 block">Venue</label>
          <div className="flex flex-wrap gap-1.5">
            {options.venues.map(v => (
              <Chip key={v} label={v} active={filterVenue === v} onClick={() => onVenue(filterVenue === v ? null : v)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export const TreasureChestTab = () => {
  const { user } = useAuth();
  const { gems, loading, refetch } = useUserGems(user?.id);
  const { data: targetEvents } = useTargetEvents(user?.id);
  const deleteGoal = useDeleteGoal();

  // Modal / mode state
  const [showAddModal, setShowAddModal]         = useState(false);
  const [showFestivalModal, setShowFestivalModal] = useState(false);
  const [selectedGem, setSelectedGem]           = useState<UserGem | null>(null);
  const [showDetailModal, setShowDetailModal]   = useState(false);
  const [selectedCluster, setSelectedCluster]   = useState<UserGem[]>([]);
  const [showClusterModal, setShowClusterModal] = useState(false);

  // Filter / sort state
  const [showFilters, setShowFilters]   = useState(false);
  const [filterGenre, setFilterGenre]   = useState<string | null>(null);
  const [filterArtist, setFilterArtist] = useState<string | null>(null);
  const [filterVenue, setFilterVenue]   = useState<string | null>(null);
  const [sortBy, setSortBy]             = useState<'date' | 'artist' | 'rarity'>('date');
  const [sortDir, setSortDir]           = useState<'desc' | 'asc'>('desc');

  // Festival badges from Supabase
  const [userBadges, setUserBadges] = useState<FestivalBadge[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('user_festival_badges')
      .select('*')
      .eq('user_id', user.id)
      .order('festival_date', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setUserBadges(
            data.map((b: {
              series_name: string;
              festival_date: string;
              badge_color: string;
              custom_image_url: string | null;
            }) => ({
              name:  b.series_name,
              date:  new Date(b.festival_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              color: (b.badge_color || 'purple') as FestivalBadge['color'],
              image: b.custom_image_url || undefined,
            }))
          );
        }
      });
  }, [user?.id]);

  // ── Derived filter options ─────────────────────────────────────────────

  const filterOptions = useMemo(() => ({
    genres:  [...new Set(gems.map(g => g.genre?.name).filter(Boolean))].sort() as string[],
    artists: [...new Set(gems.map(g => g.dj?.stage_name).filter(Boolean))].sort() as string[],
    venues:  [...new Set(gems.map(g => g.venue?.name).filter(Boolean))].sort() as string[],
  }), [gems]);

  const hasActiveFilters = !!(filterGenre || filterArtist || filterVenue);

  const clearFilters = () => {
    setFilterGenre(null);
    setFilterArtist(null);
    setFilterVenue(null);
  };

  // ── Filtered + sorted gems ─────────────────────────────────────────────

  const filteredGems = useMemo(() =>
    gems.filter(g => {
      if (filterGenre  && g.genre?.name     !== filterGenre)  return false;
      if (filterArtist && g.dj?.stage_name  !== filterArtist) return false;
      if (filterVenue  && g.venue?.name     !== filterVenue)  return false;
      return true;
    }),
    [gems, filterGenre, filterArtist, filterVenue]
  );

  // Group by DJ → flat list of items (single | cluster), sorted
  const collectionItems = useMemo(() => {
    type Item =
      | { type: 'single';  gem: UserGem }
      | { type: 'cluster'; gems: UserGem[] };

    const grouped = groupGemsByDJ(filteredGems);
    const items: Item[] = [];

    grouped.forEach(djGems => {
      if (djGems.length === 1) {
        items.push({ type: 'single', gem: djGems[0] });
      } else {
        items.push({ type: 'cluster', gems: djGems });
      }
    });

    const dir = sortDir === 'desc' ? -1 : 1;

    items.sort((a, b) => {
      const gA = a.type === 'single' ? a.gem : a.gems[0];
      const gB = b.type === 'single' ? b.gem : b.gems[0];

      if (sortBy === 'artist') {
        return dir * (gA.dj?.stage_name ?? '').localeCompare(gB.dj?.stage_name ?? '');
      }
      if (sortBy === 'rarity') {
        return dir * ((gA.rarity_score ?? 0) - (gB.rarity_score ?? 0));
      }
      // date
      const latestDate = (item: Item) =>
        item.type === 'single'
          ? new Date(item.gem.event_date).getTime()
          : Math.max(...item.gems.map(g => new Date(g.event_date).getTime()));
      return dir * (latestDate(a) - latestDate(b));
    });

    return items;
  }, [filteredGems, sortBy, sortDir]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleGemAdded     = () => refetch();
  const handleGemClick     = (gem: UserGem) => { setSelectedGem(gem); setShowDetailModal(true); };
  const handleClusterClick = (clusterGems: UserGem[]) => { setSelectedCluster(clusterGems); setShowClusterModal(true); };
  const handleClusterGemClick = (gem: UserGem) => { setShowClusterModal(false); setSelectedGem(gem); setShowDetailModal(true); };
  const handleGemDeleted   = () => { setSelectedGem(null); refetch(); };
  const handleGemUpdated   = () => refetch();
  const handleRemoveTargetEvent = (goalId: string) => {
    if (!user?.id) return;
    deleteGoal.mutate({ goalId, userId: user.id });
  };

  const allBadges = [...userBadges, ...festivalBadges];

  // ── Sort cycle helper ─────────────────────────────────────────────────

  const cycleSortBy = () => {
    const cycle: ('date' | 'artist' | 'rarity')[] = ['date', 'artist', 'rarity'];
    setSortBy(prev => cycle[(cycle.indexOf(prev) + 1) % cycle.length]);
  };

  const SORT_LABELS = { date: 'Date', artist: 'Artist', rarity: 'Rarity' } as const;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="pb-4">

        {/* ── Tab header ───────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-20 px-4 pt-4 pb-2.5 border-b border-white/5"
          style={{
            background: 'hsl(150 40% 6% / 0.92)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          }}
        >
          <div className="flex items-center justify-between">
            {/* Title + gem count */}
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
              <h2 className="font-display font-bold text-white text-lg">Chest</h2>
              {!loading && gems.length > 0 && (
                <span className="text-[11px] font-medium text-white/40 bg-white/8 px-2 py-0.5 rounded-full border border-white/8">
                  {gems.length} gem{gems.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Sort */}
              <button
                onClick={cycleSortBy}
                className="flex items-center gap-1 text-[11px] font-medium text-white/50 hover:text-white/80 transition-colors px-2 py-1 rounded-lg hover:bg-white/8"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {SORT_LABELS[sortBy]}
              </button>

              {/* Sort dir */}
              <button
                onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                className="text-white/40 hover:text-white/70 p-1 rounded-lg hover:bg-white/8 transition-colors"
              >
                {sortDir === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(f => !f)}
                className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg transition-all ${
                  hasActiveFilters
                    ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/8'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {hasActiveFilters ? 'Filtered' : 'Filter'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Festival badges ───────────────────────────────────────── */}
        {allBadges.length > 0 && (
          <div className="px-4 pt-4 pb-2 overflow-hidden">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2.5 font-medium">
              Attended
            </p>
            <div
              className="flex gap-4 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {allBadges.map((badge, i) => (
                <EnamelPin key={i} badge={badge} />
              ))}
            </div>
          </div>
        )}

        {/* ── Filter panel ─────────────────────────────────────────── */}
        {showFilters && (
          <FilterPanel
            options={filterOptions}
            filterGenre={filterGenre}
            filterArtist={filterArtist}
            filterVenue={filterVenue}
            onGenre={setFilterGenre}
            onArtist={setFilterArtist}
            onVenue={setFilterVenue}
            onClear={clearFilters}
          />
        )}

        {/* ── Target quests (GhostGems) ─────────────────────────────── */}
        {targetEvents && targetEvents.length > 0 && (
          <div className="px-4 mt-3">
            <h3 className="text-xs font-display font-semibold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Target Quests
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {targetEvents.map(goal => (
                <GhostGem key={goal.id} goal={goal} size="sm" onRemove={handleRemoveTargetEvent} />
              ))}
            </div>
          </div>
        )}

        {/* ── Gem collection grid ───────────────────────────────────── */}
        <div className="px-4 mt-4">
          {loading ? (
            /* Loading skeleton */
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-card p-3 h-28 animate-pulse"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          ) : gems.length === 0 ? (
            <ChestEmptyState onMine={() => setShowAddModal(true)} />
          ) : collectionItems.length === 0 && hasActiveFilters ? (
            /* No results for active filter */
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-white/40 text-sm mb-2">No gems match these filters</p>
              <button onClick={clearFilters} className="text-emerald-400 text-sm hover:text-emerald-300">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {collectionItems.map((item, idx) =>
                item.type === 'single' ? (
                  <GemCard
                    key={item.gem.id}
                    gem={item.gem}
                    onClick={handleGemClick}
                    compact
                  />
                ) : (
                  <ClusterCard
                    key={`cluster-${item.gems[0].dj_id ?? idx}`}
                    gems={item.gems}
                    onClick={handleClusterClick}
                  />
                )
              )}
            </div>
          )}
        </div>

      {/* ── Modals ────────────────────────────────────────────────── */}
      <AddGemModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onGemAdded={handleGemAdded}
      />

      <FestivalLineupModal
        open={showFestivalModal}
        onOpenChange={setShowFestivalModal}
        onGemsAdded={handleGemAdded}
      />

      <ClusterViewModal
        gems={selectedCluster}
        open={showClusterModal}
        onOpenChange={setShowClusterModal}
        onGemClick={handleClusterGemClick}
      />

      <GemDetailModal
        gem={selectedGem}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onGemDeleted={handleGemDeleted}
        onGemUpdated={handleGemUpdated}
      />
      </div>
    </div>
  );
};

