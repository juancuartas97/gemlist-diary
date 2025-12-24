import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSets, type SetEntry } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { EnamelPin } from '@/components/treasure/EnamelPin';
import { GlassShelf } from '@/components/treasure/GlassShelf';
import { GemStack } from '@/components/treasure/GemStack';
import { AddGemModal } from '@/components/treasure/AddGemModal';

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

// Mock pins data - would come from user achievements
const mockPins = [
  { id: '1', name: 'EDC Las Vegas', year: '2024', color: 'gold' as const },
  { id: '2', name: 'Berghain', year: '2023', color: 'silver' as const },
  { id: '3', name: 'Fabric London', year: '2024', color: 'gold' as const },
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

        {/* The Lid - Trophy Case with Enamel Pins */}
        <div className="trophy-case mx-4 mb-8">
          <div className="trophy-case-texture" />
          <div className="relative z-10 flex justify-center gap-6 py-6 px-4">
            {mockPins.map((pin, i) => (
              <EnamelPin 
                key={pin.id} 
                pin={pin} 
                tiltDeg={(i - 1) * 8} 
              />
            ))}
          </div>
          <div className="trophy-case-edge" />
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

      {/* Floating Add Button */}
      <Button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-2xl z-50 bg-primary/90 hover:bg-primary border border-primary-foreground/20"
        style={{
          boxShadow: '0 0 30px hsl(var(--gem-emerald) / 0.4), 0 8px 32px rgba(0,0,0,0.5)'
        }}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Add Gem Modal */}
      <AddGemModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onGemAdded={handleGemAdded}
      />
    </div>
  );
};
