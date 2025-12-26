import { useState } from 'react';
import { Pickaxe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserGems, groupGemsByDJ, type UserGem } from '@/hooks/useGemData';
import { useAuth } from '@/hooks/useAuth';
import { EnamelPin, type FestivalBadge } from '@/components/treasure/EnamelPin';
import { GlassShelf } from '@/components/treasure/GlassShelf';
import { GemCluster } from '@/components/treasure/GemCluster';
import { AddGemModal } from '@/components/treasure/AddGemModal';
import { GemDetailModal } from '@/components/treasure/GemDetailModal';
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
  
  // Group gems by DJ for clustering
  const groupedByDJ = groupGemsByDJ(gems);
  const singleGems = Array.from(groupedByDJ.entries())
    .filter(([_, djGems]) => djGems.length === 1)
    .map(([_, djGems]) => djGems[0]);
  const clusteredGems = Array.from(groupedByDJ.entries())
    .filter(([_, djGems]) => djGems.length > 1);

  const handleGemAdded = () => {
    refetch();
  };

  const handleGemClick = (gem: UserGem) => {
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
              {/* First Shelf - Single gems */}
              {singleGems.length > 0 && (
                <GlassShelf 
                  depth={0}
                  userGems={singleGems.slice(0, 3)}
                  onGemClick={handleGemClick}
                />
              )}
              
              {/* Gem Clusters Section */}
              {clusteredGems.length > 0 && (
                <div className="stacks-section mt-8">
                  <h3 className="text-xs text-muted-foreground/50 uppercase tracking-widest mb-6 text-center">
                    Repeated Encounters
                  </h3>
                  <div className="flex flex-wrap justify-center gap-8">
                    {clusteredGems.map(([djId, djGems]) => (
                      <div key={djId} className="flex flex-col items-center gap-2">
                        <GemCluster 
                          gems={djGems}
                          size="lg"
                          onGemClick={handleGemClick}
                        />
                        <span className="text-xs text-muted-foreground/70 text-center max-w-20 truncate">
                          {djGems[0].dj?.stage_name || 'Unknown'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Second Shelf - More single gems */}
              {singleGems.length > 3 && (
                <GlassShelf 
                  depth={1}
                  userGems={singleGems.slice(3, 6)}
                  onGemClick={handleGemClick}
                />
              )}

              {/* Third Shelf - Even more */}
              {singleGems.length > 6 && (
                <GlassShelf 
                  depth={2}
                  userGems={singleGems.slice(6, 9)}
                  onGemClick={handleGemClick}
                />
              )}
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
