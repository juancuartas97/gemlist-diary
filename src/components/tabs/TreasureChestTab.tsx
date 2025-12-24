import { useState } from 'react';
import { Pickaxe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSets, type SetEntry } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { EnamelPin, type FestivalBadge } from '@/components/treasure/EnamelPin';
import { GlassShelf } from '@/components/treasure/GlassShelf';
import { GemStack } from '@/components/treasure/GemStack';
import { AddGemModal } from '@/components/treasure/AddGemModal';
import edcVegasPin from '@/assets/pins/edc-vegas.png';
import tomorrowlandPin from '@/assets/pins/tomorrowland.png';
import ultraPin from '@/assets/pins/ultra.png';
import lollapaloozaPin from '@/assets/pins/lollapalooza.png';
import factoryTownPin from '@/assets/pins/factory-town.png';
import berghainPin from '@/assets/pins/berghain.png';
import electricForestPin from '@/assets/pins/electric-forest.png';
import coachellaPin from '@/assets/pins/coachella.png';
import lostLandsPin from '@/assets/pins/lost-lands.png';

// Group sets by artist name for stacking
const groupByArtist = (sets: SetEntry[]) => {
  const groups: Record<string, SetEntry[]> = {};
  sets.forEach(set => {
    if (!groups[set.djName]) {
      groups[set.djName] = [];
    }
    groups[set.djName].push(set);
  });
  return groups;
};

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
  const [sets, setSets] = useState<SetEntry[]>(getSets);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const groupedSets = groupByArtist(sets);
  const artistNames = Object.keys(groupedSets);

  const handleGemAdded = (newSet: SetEntry) => {
    setSets([newSet, ...sets]);
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
          {sets.length === 0 ? (
            <div className="empty-vault text-center py-16">
              <div className="empty-gem-glow mx-auto mb-4" />
              <p className="text-muted-foreground/60 text-sm">Your vault awaits...</p>
              <p className="text-muted-foreground/40 text-xs mt-1">Mine your first gem</p>
            </div>
          ) : (
            <div className="shelves-container space-y-8">
              {/* First Shelf - Recent Singles */}
              <GlassShelf 
                depth={0}
                gems={sets.slice(0, 3).filter(s => groupedSets[s.djName].length === 1)}
              />
              
              {/* Second Shelf - More gems */}
              <GlassShelf 
                depth={1}
                gems={sets.slice(3, 6).filter(s => groupedSets[s.djName].length === 1)}
              />

              {/* Stacked Gems Section */}
              {artistNames.filter(name => groupedSets[name].length > 1).length > 0 && (
                <div className="stacks-section mt-12">
                  <h3 className="text-xs text-muted-foreground/50 uppercase tracking-widest mb-6 text-center">
                    Repeated Encounters
                  </h3>
                  <div className="flex flex-wrap justify-center gap-8">
                    {artistNames
                      .filter(name => groupedSets[name].length > 1)
                      .map(artistName => (
                        <GemStack 
                          key={artistName}
                          artistName={artistName}
                          gems={groupedSets[artistName]}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Third Shelf - Deeper */}
              <GlassShelf 
                depth={2}
                gems={sets.slice(6, 9)}
              />
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
    </div>
  );
};
