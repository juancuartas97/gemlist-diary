import { useState, useMemo } from 'react';
import { Pickaxe, SlidersHorizontal, ArrowUpDown, X, KeyRound, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserGems, groupGemsByDJ, type UserGem } from '@/hooks/useGemData';
import { useAuth } from '@/hooks/useAuth';
import { useTargetEvents, useDeleteGoal } from '@/hooks/useUserGoals';
import { EnamelPin, type FestivalBadge } from '@/components/treasure/EnamelPin';
import { GlassShelf, type ShelfItem } from '@/components/treasure/GlassShelf';
import { AddGemModal } from '@/components/treasure/AddGemModal';
import { CollectionModeChooser, type CollectionMode } from '@/components/treasure/CollectionModeChooser';
import { GemDetailModal } from '@/components/treasure/GemDetailModal';
import { ClusterViewModal } from '@/components/treasure/ClusterViewModal';
import { GhostGem } from '@/components/goals/GhostGem';
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
  { name: 'EDC Vegas', date: 'May 2024', color: 'purple', image: edcVegasPin },
  { name: 'Tomorrowland', date: 'Jul 2024', color: 'gold', image: tomorrowlandPin },
  { name: 'Ultra', date: 'Mar 2024', color: 'red', image: ultraPin },
  { name: 'Berghain', date: 'Sep 2024', color: 'silver', image: berghainPin },
  { name: 'Lost Lands', date: 'Sep 2024', color: 'green', image: lostLandsPin },
  { name: 'Electric Forest', date: 'Jun 2024', color: 'green', image: electricForestPin },
  { name: 'Coachella', date: 'Apr 2024', color: 'gold', image: coachellaPin },
  { name: 'Factory Town', date: 'Dec 2023', color: 'silver', image: factoryTownPin },
  { name: 'Lollapalooza', date: 'Aug 2023', color: 'purple', image: lollapaloozaPin },
];

export const TreasureChestTab = () => {
  const { user } = useAuth();
  const { gems, loading, refetch } = useUserGems(user?.id);
  const { data: targetEvents } = useTargetEvents(user?.id);
  const deleteGoal = useDeleteGoal();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModeChooser, setShowModeChooser] = useState(false);
  const [collectionMode, setCollectionMode] = useState<CollectionMode>('memory');
  const [selectedGem, setSelectedGem] = useState<UserGem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<UserGem[]>([]);
  const [showClusterModal, setShowClusterModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterGenre, setFilterGenre] = useState<string | null>(null);
  const [filterArtist, setFilterArtist] = useState<string | null>(null);
  const [filterVenue, setFilterVenue] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'artist' | 'rarity'>('date');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  // Extract unique filter options from gems
  const filterOptions = useMemo(() => {
    const genres = [...new Set(gems.map(g => g.genre?.name).filter(Boolean))].sort() as string[];
    const artists = [...new Set(gems.map(g => g.dj?.stage_name).filter(Boolean))].sort() as string[];
    const venues = [...new Set(gems.map(g => g.venue?.name).filter(Boolean))].sort() as string[];
    return { genres, artists, venues };
  }, [gems]);

  // Apply filters
  const filteredGems = useMemo(() => {
    return gems.filter(g => {
      if (filterGenre && g.genre?.name !== filterGenre) return false;
      if (filterArtist && g.dj?.stage_name !== filterArtist) return false;
      if (filterVenue && g.venue?.name !== filterVenue) return false;
      return true;
    });
  }, [gems, filterGenre, filterArtist, filterVenue]);

  const hasActiveFilters = filterGenre || filterArtist || filterVenue;

  const clearFilters = () => {
    setFilterGenre(null);
    setFilterArtist(null);
    setFilterVenue(null);
  };

  // Build unified shelf items from filtered gems
  const shelfItems = useMemo((): ShelfItem[] => {
    const groupedByDJ = groupGemsByDJ(filteredGems);
    const items: ShelfItem[] = [];
    
    groupedByDJ.forEach((djGems) => {
      if (djGems.length === 1) {
        items.push({ type: 'single', gem: djGems[0] });
      } else {
        items.push({ type: 'cluster', gems: djGems });
      }
    });
    
    items.sort((a, b) => {
      const gemA = a.type === 'single' ? a.gem : a.gems[0];
      const gemB = b.type === 'single' ? b.gem : b.gems[0];
      const dir = sortDir === 'desc' ? -1 : 1;
      
      if (sortBy === 'artist') {
        return dir * (gemA.dj?.stage_name || '').localeCompare(gemB.dj?.stage_name || '');
      }
      if (sortBy === 'rarity') {
        return dir * ((gemA.rarity_score || 0) - (gemB.rarity_score || 0));
      }
      const dateA = a.type === 'single' 
        ? new Date(a.gem.event_date) 
        : new Date(Math.max(...a.gems.map(g => new Date(g.event_date).getTime())));
      const dateB = b.type === 'single' 
        ? new Date(b.gem.event_date) 
        : new Date(Math.max(...b.gems.map(g => new Date(g.event_date).getTime())));
      return dir * (dateA.getTime() - dateB.getTime());
    });
    
    return items;
  }, [filteredGems, sortBy, sortDir]);

  const shelves = useMemo(() => {
    const result: ShelfItem[][] = [];
    for (let i = 0; i < shelfItems.length; i += 3) {
      result.push(shelfItems.slice(i, i + 3));
    }
    return result;
  }, [shelfItems]);

  const handleGemAdded = () => { refetch(); };
  const handleGemClick = (gem: UserGem) => { setSelectedGem(gem); setShowDetailModal(true); };
  const handleClusterClick = (clusterGems: UserGem[]) => { setSelectedCluster(clusterGems); setShowClusterModal(true); };
  const handleClusterGemClick = (gem: UserGem) => { setShowClusterModal(false); setSelectedGem(gem); setShowDetailModal(true); };
  const handleGemDeleted = () => { setSelectedGem(null); refetch(); };
  const handleGemUpdated = () => { refetch(); };
  const handleRemoveTargetEvent = (goalId: string) => { if (!user?.id) return; deleteGoal.mutate({ goalId, userId: user.id }); };

  return (
    <div className="treasure-chest min-h-screen relative overflow-hidden">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 bg-void" />
      <div className="nebula-smoke" />
      
      {/* Content */}
      <div className="relative z-10 pb-32">
        {/* ===== THE CHEST ===== */}
        <div className="mx-2 mt-2">
          
          {/* === A. THE LID === */}
          <div className="chest-lid">
            <div className="chest-lid-texture" />
            
            {/* Corner brackets on lid */}
            <div className="chest-corner-bracket chest-corner-tl" />
            <div className="chest-corner-bracket chest-corner-tr" />
            
            {/* Festival pins inside the lid */}
            <div 
              className="relative z-10 flex items-start gap-6 py-6 px-5 overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {festivalBadges.map((badge, i) => (
                <EnamelPin key={i} badge={badge} />
              ))}
            </div>
            
            <div className="chest-lid-edge" />
          </div>

          {/* === B. HINGE STRIP === */}
          <div className="chest-hinge">
            <div className="chest-hinge-bolt chest-hinge-bolt-left" />
            <div className="chest-hinge-bolt chest-hinge-bolt-right" />
          </div>

          {/* === C. LOCK & KEY STRIP === */}
          <div className="chest-lock-strip">
            {/* Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`chest-hardware-btn ${hasActiveFilters ? 'active' : ''}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
            
            {/* Lock icon (center) */}
            <div className="chest-lock-icon">
              <Lock className="w-4 h-4" />
              <div className="chest-keyhole" />
            </div>
            
            {/* Sort button */}
            <button
              onClick={() => {
                const cycle: ('date' | 'artist' | 'rarity')[] = ['date', 'artist', 'rarity'];
                const idx = cycle.indexOf(sortBy);
                setSortBy(cycle[(idx + 1) % cycle.length]);
              }}
              className="chest-hardware-btn"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortBy === 'date' ? 'Date' : sortBy === 'artist' ? 'Artist' : 'Rarity'}
            </button>
            
            {/* Sort direction */}
            <button
              onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              className="chest-hardware-btn small"
            >
              {sortDir === 'desc' ? '↓' : '↑'}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="chest-filter-panel">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-amber-200/80">Filters</span>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-amber-400 flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
              
              {/* Genre filter */}
              <div className="mb-2">
                <label className="text-xs text-amber-200/40 mb-1 block">Genre</label>
                <div className="flex flex-wrap gap-1.5">
                  {filterOptions.genres.map(g => (
                    <button
                      key={g}
                      onClick={() => setFilterGenre(filterGenre === g ? null : g)}
                      className={`chest-filter-chip ${filterGenre === g ? 'active' : ''}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Artist filter */}
              <div className="mb-2">
                <label className="text-xs text-amber-200/40 mb-1 block">Artist</label>
                <div className="flex flex-wrap gap-1.5">
                  {filterOptions.artists.map(a => (
                    <button
                      key={a}
                      onClick={() => setFilterArtist(filterArtist === a ? null : a)}
                      className={`chest-filter-chip ${filterArtist === a ? 'active' : ''}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Venue filter */}
              <div>
                <label className="text-xs text-amber-200/40 mb-1 block">Venue</label>
                <div className="flex flex-wrap gap-1.5">
                  {filterOptions.venues.map(v => (
                    <button
                      key={v}
                      onClick={() => setFilterVenue(filterVenue === v ? null : v)}
                      className={`chest-filter-chip ${filterVenue === v ? 'active' : ''}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === D. THE BODY (velvet interior) === */}
          <div className="chest-body">
            {/* Corner brackets */}
            <div className="chest-corner-bracket chest-corner-bl" />
            <div className="chest-corner-bracket chest-corner-br" />
            
            {/* Velvet interior */}
            <div className="chest-velvet-interior">
              {/* Ghost Gems - Target Events */}
              {targetEvents && targetEvents.length > 0 && (
                <div className="mb-6 px-2">
                  <h3 className="text-sm font-medium text-amber-200/60 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Target Quests
                  </h3>
                  <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {targetEvents.map((goal) => (
                      <GhostGem key={goal.id} goal={goal} size="sm" onRemove={handleRemoveTargetEvent} />
                    ))}
                  </div>
                </div>
              )}

              {/* Gem shelves */}
              <div className="perspective-container">
                {loading ? (
                  <div className="text-center py-16">
                    <div className="empty-gem-glow mx-auto mb-4 animate-pulse" />
                    <p className="text-amber-200/40 text-sm">Loading your gems...</p>
                  </div>
                ) : gems.length === 0 ? (
                  <div className="chest-empty-state">
                    <div className="chest-empty-keyhole">
                      <KeyRound className="w-8 h-8 text-amber-400/50" />
                    </div>
                    <p className="text-amber-200/50 text-sm mt-4">Your chest awaits its first gem...</p>
                    <p className="text-amber-200/30 text-xs mt-1">Tap the pickaxe to start mining</p>
                  </div>
                ) : (
                  <div className="space-y-6 px-1">
                    {shelves.map((shelfItems, index) => (
                      <GlassShelf 
                        key={index}
                        depth={index}
                        items={shelfItems}
                        onGemClick={handleGemClick}
                        onClusterClick={handleClusterClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Wooden floor */}
            <div className="chest-floor" />
          </div>
        </div>

        {/* Mine a Gem Button - Brass plate */}
        <div className="flex justify-center mt-6 pb-4">
          <Button
            onClick={() => setShowModeChooser(true)}
            className="chest-mine-button"
          >
            <Pickaxe className="w-5 h-5" />
            <span className="font-semibold">Mine a Gem</span>
          </Button>
        </div>
      </div>

      {/* Collection Mode Chooser */}
      <CollectionModeChooser
        open={showModeChooser}
        onSelect={(mode) => { setCollectionMode(mode); setShowModeChooser(false); setShowAddModal(true); }}
        onClose={() => setShowModeChooser(false)}
      />

      {/* Add Gem Modal */}
      <AddGemModal open={showAddModal} onOpenChange={setShowAddModal} onGemAdded={handleGemAdded} mode={collectionMode} />

      {/* Cluster View Modal */}
      <ClusterViewModal gems={selectedCluster} open={showClusterModal} onOpenChange={setShowClusterModal} onGemClick={handleClusterGemClick} />

      {/* Gem Detail Modal */}
      <GemDetailModal gem={selectedGem} open={showDetailModal} onOpenChange={setShowDetailModal} onGemDeleted={handleGemDeleted} onGemUpdated={handleGemUpdated} />
    </div>
  );
};
