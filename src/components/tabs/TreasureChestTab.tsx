import { useState, useMemo } from 'react';
import { Pickaxe, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserGems, groupGemsByDJ, type UserGem } from '@/hooks/useGemData';
import { useAuth } from '@/hooks/useAuth';
import { useTargetEvents, useDeleteGoal } from '@/hooks/useUserGoals';
import { EnamelPin, type FestivalBadge } from '@/components/treasure/EnamelPin';
import { GlassShelf, type ShelfItem } from '@/components/treasure/GlassShelf';
import { AddGemModal } from '@/components/treasure/AddGemModal';
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
    
    // Sort items
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
      // date (default)
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

  // Split items into shelves (3 items per shelf)
  const shelves = useMemo(() => {
    const result: ShelfItem[][] = [];
    for (let i = 0; i < shelfItems.length; i += 3) {
      result.push(shelfItems.slice(i, i + 3));
    }
    return result;
  }, [shelfItems]);

  const handleGemAdded = () => {
    refetch();
  };

  const handleGemClick = (gem: UserGem) => {
    setSelectedGem(gem);
    setShowDetailModal(true);
  };

  const handleClusterClick = (clusterGems: UserGem[]) => {
    setSelectedCluster(clusterGems);
    setShowClusterModal(true);
  };

  const handleClusterGemClick = (gem: UserGem) => {
    setShowClusterModal(false);
    setSelectedGem(gem);
    setShowDetailModal(true);
  };

  const handleGemDeleted = () => {
    setSelectedGem(null);
    refetch();
  };

  const handleGemUpdated = () => {
    refetch();
  };

  const handleRemoveTargetEvent = (goalId: string) => {
    if (!user?.id) return;
    deleteGoal.mutate({ goalId, userId: user.id });
  };

  return (
    <div className="treasure-chest min-h-screen relative overflow-hidden">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 bg-void" />
      <div className="nebula-smoke" />
      
      {/* Content */}
      <div className="relative z-10 pb-32">
        {/* Header */}
        <div className="pt-4 pb-6 px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground/90 tracking-wide">Treasure Chest</h1>
          <p className="text-xs text-muted-foreground/60 mt-1 tracking-widest uppercase">Your Collection</p>
          
          {/* Filter & Sort Controls */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                hasActiveFilters 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'bg-muted/20 text-muted-foreground border border-border/30 hover:bg-muted/30'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
            
            <button
              onClick={() => {
                const cycle: ('date' | 'artist' | 'rarity')[] = ['date', 'artist', 'rarity'];
                const idx = cycle.indexOf(sortBy);
                setSortBy(cycle[(idx + 1) % cycle.length]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted/20 text-muted-foreground border border-border/30 hover:bg-muted/30 transition-all"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortBy === 'date' ? 'Date' : sortBy === 'artist' ? 'Artist' : 'Rarity'}
            </button>
            
            <button
              onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              className="px-2 py-1.5 rounded-full text-xs font-medium bg-muted/20 text-muted-foreground border border-border/30 hover:bg-muted/30 transition-all"
            >
              {sortDir === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mx-4 mb-4 glass-card p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Filters</span>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-primary flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>
            
            {/* Genre filter */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Genre</label>
              <div className="flex flex-wrap gap-1.5">
                {filterOptions.genres.map(g => (
                  <button
                    key={g}
                    onClick={() => setFilterGenre(filterGenre === g ? null : g)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      filterGenre === g 
                        ? 'bg-primary/30 text-primary border border-primary/40' 
                        : 'bg-muted/20 text-muted-foreground border border-border/20 hover:bg-muted/30'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Artist filter */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Artist</label>
              <div className="flex flex-wrap gap-1.5">
                {filterOptions.artists.map(a => (
                  <button
                    key={a}
                    onClick={() => setFilterArtist(filterArtist === a ? null : a)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      filterArtist === a 
                        ? 'bg-primary/30 text-primary border border-primary/40' 
                        : 'bg-muted/20 text-muted-foreground border border-border/20 hover:bg-muted/30'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Venue filter */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Venue</label>
              <div className="flex flex-wrap gap-1.5">
                {filterOptions.venues.map(v => (
                  <button
                    key={v}
                    onClick={() => setFilterVenue(filterVenue === v ? null : v)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      filterVenue === v 
                        ? 'bg-primary/30 text-primary border border-primary/40' 
                        : 'bg-muted/20 text-muted-foreground border border-border/20 hover:bg-muted/30'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* The Lid - Trophy Case with Festival Badges */}
        <div className="trophy-lid mx-4 mb-8">
          {/* Brushed metal texture overlay */}
          <div className="trophy-lid-texture" />
          
          {/* Horizontal scrollable row of pins */}
          <div 
            className="relative z-10 flex items-start gap-6 py-8 px-6 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {festivalBadges.map((badge, i) => (
              <EnamelPin 
                key={i} 
                badge={badge} 
              />
            ))}
          </div>
          
          {/* Bottom edge with gold accent */}
          <div className="trophy-lid-edge" />
        </div>

        {/* Ghost Gems - Target Events */}
        {targetEvents && targetEvents.length > 0 && (
          <div className="mx-4 mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Target Quests
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {targetEvents.map((goal) => (
                <GhostGem 
                  key={goal.id} 
                  goal={goal} 
                  size="sm"
                  onRemove={handleRemoveTargetEvent}
                />
              ))}
            </div>
          </div>
        )}
        {/* The Shelves - Glass Archive */}
        <div className="glass-archive perspective-container px-4">
          {loading ? (
            <div className="empty-vault text-center py-16">
              <div className="empty-gem-glow mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground/60 text-sm">Loading your gems...</p>
            </div>
          ) : gems.length === 0 ? (
            <div className="empty-vault text-center py-16">
              <div className="empty-gem-glow mx-auto mb-4" />
              <p className="text-muted-foreground/60 text-sm">Your vault awaits...</p>
              <p className="text-muted-foreground/40 text-xs mt-1">Mine your first gem</p>
            </div>
          ) : (
            <div className="shelves-container space-y-8">
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

      {/* Mine a Gem Button - Inside frame */}
      <div className="sticky bottom-20 left-0 right-0 flex justify-center pb-4 z-50">
        <Button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 h-auto rounded-full shadow-2xl bg-primary/90 hover:bg-primary border border-primary-foreground/20 gap-2"
          style={{
            boxShadow: '0 0 30px hsl(var(--gem-emerald) / 0.4), 0 8px 32px rgba(0,0,0,0.5)'
          }}
        >
          <Pickaxe className="w-5 h-5" />
          <span className="font-semibold">Mine a Gem</span>
        </Button>
      </div>

      {/* Add Gem Modal */}
      <AddGemModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onGemAdded={handleGemAdded}
      />

      {/* Cluster View Modal */}
      <ClusterViewModal
        gems={selectedCluster}
        open={showClusterModal}
        onOpenChange={setShowClusterModal}
        onGemClick={handleClusterGemClick}
      />

      {/* Gem Detail Modal */}
      <GemDetailModal
        gem={selectedGem}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onGemDeleted={handleGemDeleted}
        onGemUpdated={handleGemUpdated}
      />
    </div>
  );
};
