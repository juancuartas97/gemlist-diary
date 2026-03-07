import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User as UserIcon, Activity } from 'lucide-react';
import { TreasureChestIcon } from '@/components/icons/TreasureChestIcon';
import { FloatingParticles } from '@/components/FloatingParticles';
import { GemIcon } from '@/components/GemIcon';
import { HomeTab } from '@/components/tabs/HomeTab';
import { TreasureChestTab } from '@/components/tabs/TreasureChestTab';
import { TasteMapTab } from '@/components/tabs/TasteMapTab';
import { ProfileTab } from '@/components/tabs/ProfileTab';
import { AddGemModal } from '@/components/treasure/AddGemModal';
import { FestivalLineupModal } from '@/components/treasure/FestivalLineupModal';
import { CollectionModeChooser, type CollectionMode } from '@/components/treasure/CollectionModeChooser';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Pickaxe } from 'lucide-react';

type Tab = 'home' | 'treasure' | 'map' | 'profile';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'home',     label: 'Home',    icon: Home            },
  { id: 'treasure', label: 'Chest',   icon: TreasureChestIcon },
  { id: 'map',      label: 'Map',     icon: Activity        },
  { id: 'profile',  label: 'You',     icon: UserIcon        },
];

const AppShell = () => {
  const [activeTab, setActiveTab]             = useState<Tab>('home');
  const [showModeChooser, setShowModeChooser] = useState(false);
  const [showAddGemModal, setShowAddGemModal]   = useState(false);
  const [showFestivalModal, setShowFestivalModal] = useState(false);
  const [collectionMode, setCollectionMode] = useState<CollectionMode>('memory');

  // Draggable FAB — snaps to left or right edge
  const [fabOnRight, setFabOnRight]   = useState(true);
  const fabDragRef = useRef<{ startX: number; moved: boolean } | null>(null);
  const navigate                            = useNavigate();
  const { user, loading, isMockMode }       = useAuth();

  useEffect(() => {
    if (!loading && !user && !isMockMode) {
      navigate('/auth');
    }
  }, [user, loading, isMockMode, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmic">
        <div className="animate-pulse-glow">
          <GemIcon className="w-16 h-16" />
        </div>
      </div>
    );
  }

  // NAV_HEIGHT + safe area for scroll offset
  const NAV_H = 64; // px – bottom nav height (py-2 + icon + label ≈ 64px)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--gradient-cosmic)' }}>
      <FloatingParticles />

      <div className="w-full max-w-[420px] mx-auto flex flex-col min-h-screen relative z-10">

        {/* ── Scrollable content area ───────────────────────────────── */}
        {/*
          Each tab owns its own padding / header.
          We only add bottom padding so content isn't hidden under nav+FAB.
        */}
        <main className="flex-1 overflow-y-auto pb-[5.5rem]">
          {activeTab === 'home'     && (
            <HomeTab
              onMine={() => setShowModeChooser(true)}
              onVibePress={() => setActiveTab('map')}
            />
          )}
          {activeTab === 'treasure' && <TreasureChestTab />}
          {activeTab === 'map'      && <TasteMapTab />}
          {activeTab === 'profile'  && <ProfileTab />}
        </main>

        {/* ── Floating pickaxe FAB — draggable left / right ───────── */}
        {/*
          Drag the FAB sideways to move it to the other edge.
          Short tap = open Mine modal.
        */}
        <button
          aria-label="Mine a gem"
          className={cn(
            'fixed z-30 w-14 h-14 rounded-full',
            'flex items-center justify-center',
            'bg-primary',
            fabDragRef.current?.moved
              ? 'cursor-grabbing'
              : 'cursor-grab transition-transform hover:scale-110 active:scale-95',
          )}
          style={{
            bottom: `calc(${NAV_H + 16}px)`,
            [fabOnRight ? 'right' : 'left']: '1rem',
            boxShadow: '0 0 30px hsl(var(--primary) / 0.55), 0 8px 32px rgba(0,0,0,0.45)',
            touchAction: 'none',
            userSelect: 'none',
          }}
          onPointerDown={e => {
            e.currentTarget.setPointerCapture(e.pointerId);
            fabDragRef.current = { startX: e.clientX, moved: false };
          }}
          onPointerMove={e => {
            if (!fabDragRef.current) return;
            if (Math.abs(e.clientX - fabDragRef.current.startX) > 12) {
              fabDragRef.current.moved = true;
            }
          }}
          onPointerUp={e => {
            if (!fabDragRef.current) return;
            const { moved } = fabDragRef.current;
            fabDragRef.current = null;
            if (moved) {
              // Snap: if pointer ended on right half of screen → right, else left
              setFabOnRight(e.clientX > window.innerWidth / 2);
            } else {
              // Normal tap
              setShowModeChooser(true);
            }
          }}
        >
          <Pickaxe className="w-6 h-6 text-primary-foreground" />
        </button>

        {/* ── Bottom navigation bar ───────────────────────────────── */}
        <nav className="fixed bottom-0 left-0 right-0 z-20">
          <div
            className="max-w-[420px] mx-auto border-t border-white/8"
            style={{
              background: 'hsl(150 40% 6% / 0.92)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            }}
          >
            <div className="flex items-center justify-around px-2 py-3">
              {tabs.map(tab => {
                const Icon     = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200',
                      isActive
                        ? 'text-primary'
                        : 'text-white/35 hover:text-white/60',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-all',
                        isActive && 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)]',
                      )}
                    />
                    <span
                      className={cn(
                        'text-[10px] font-medium font-display tracking-wide transition-all',
                        isActive ? 'text-primary' : 'text-white/30',
                      )}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <CollectionModeChooser
        open={showModeChooser}
        onSelect={(mode) => {
          setCollectionMode(mode);
          setShowModeChooser(false);
          if (mode === 'festival') {
            setShowFestivalModal(true);
          } else {
            setShowAddGemModal(true);
          }
        }}
        onClose={() => setShowModeChooser(false)}
      />
      <AddGemModal
        open={showAddGemModal}
        onOpenChange={setShowAddGemModal}
        onGemAdded={() => {}}
        mode={collectionMode}
      />
      <FestivalLineupModal
        open={showFestivalModal}
        onOpenChange={setShowFestivalModal}
        onGemsAdded={() => {}}
      />
    </div>
  );
};

export default AppShell;
