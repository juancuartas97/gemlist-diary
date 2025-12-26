import { useState, useMemo } from 'react';
import { Pickaxe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserGems, groupGemsByDJ, type UserGem } from '@/hooks/useGemData';
import { useAuth } from '@/hooks/useAuth';
import { EnamelPin, type FestivalBadge } from '@/components/treasure/EnamelPin';
import { GlassShelf, type ShelfItem } from '@/components/treasure/GlassShelf';
import { AddGemModal } from '@/components/treasure/AddGemModal';
import { GemDetailModal } from '@/components/treasure/GemDetailModal';
import { ClusterViewModal } from '@/components/treasure/ClusterViewModal';
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGem, setSelectedGem] = useState<UserGem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<UserGem[]>([]);
  const [showClusterModal, setShowClusterModal] = useState(false);
  
  // Build unified shelf items (singles + clusters mixed together)
  const shelfItems = useMemo((): ShelfItem[] => {
    const groupedByDJ = groupGemsByDJ(gems);
    const items: ShelfItem[] = [];
    
    groupedByDJ.forEach((djGems) => {
      if (djGems.length === 1) {
        items.push({ type: 'single', gem: djGems[0] });
      } else {
        items.push({ type: 'cluster', gems: djGems });
      }
    });
    
    // Sort by most recent event date
    items.sort((a, b) => {
      const dateA = a.type === 'single' 
        ? new Date(a.gem.event_date) 
        : new Date(Math.max(...a.gems.map(g => new Date(g.event_date).getTime())));
      const dateB = b.type === 'single' 
        ? new Date(b.gem.event_date) 
        : new Date(Math.max(...b.gems.map(g => new Date(g.event_date).getTime())));
      return dateB.getTime() - dateA.getTime();
    });
    
    return items;
  }, [gems]);

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
        </div>

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
