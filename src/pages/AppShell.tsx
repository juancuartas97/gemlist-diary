import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User as UserIcon, Settings, Pickaxe } from 'lucide-react';
import { TreasureChestIcon } from '@/components/icons/TreasureChestIcon';
import { FloatingParticles } from '@/components/FloatingParticles';
import { GemIcon } from '@/components/GemIcon';
import { HomeTab } from '@/components/tabs/HomeTab';
import { TreasureChestTab } from '@/components/tabs/TreasureChestTab';
import { ProfileTab } from '@/components/tabs/ProfileTab';
import { AddGemModal } from '@/components/treasure/AddGemModal';
import { FestivalLineupModal } from '@/components/treasure/FestivalLineupModal';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type Tab = 'home' | 'treasure' | 'profile';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'treasure', label: 'Chest', icon: TreasureChestIcon },
  { id: 'profile', label: 'Profile', icon: UserIcon },
];

const AppShell = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showAddGemModal, setShowAddGemModal] = useState(false);
  const [showFestivalModal, setShowFestivalModal] = useState(false);
  const navigate = useNavigate();
  const { user, profile, loading, isMockMode } = useAuth();

  useEffect(() => {
    if (!loading && !user && !isMockMode) {
      navigate('/auth');
    }
  }, [user, loading, isMockMode, navigate]);

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmic">
        <div className="animate-pulse-glow">
          <GemIcon className="w-16 h-16" />
        </div>
      </div>
    );
  }

  // Get avatar URL - prioritize profile avatar, then user metadata (Google/Apple)
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const firstName = (profile?.display_name || user.email?.split('@')[0] || 'Raver').split(' ')[0];

  return (
    <div className="min-h-screen flex flex-col bg-cosmic">
      <FloatingParticles />
      
      <div className="w-full max-w-[420px] mx-auto flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 glass-card border-t-0 rounded-t-none px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GemIcon className="w-8 h-8" />
            <h1 className="text-xl font-bold text-foreground">
              Gem<span className="text-primary">List</span>
            </h1>
          </div>
          
          <button
            onClick={handleSettingsClick}
            className="flex items-center gap-2 glass-button px-3 py-1.5 rounded-full hover:border-primary/40 transition-colors"
          >
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 pb-24 overflow-y-auto">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'treasure' && <TreasureChestTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </main>

        {/* Floating Pickaxe Button */}
        <button
          onClick={() => setShowAddGemModal(true)}
          className="fixed bottom-24 right-4 z-30 w-14 h-14 rounded-full bg-primary shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          style={{
            boxShadow: '0 0 30px hsl(var(--primary) / 0.5), 0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          <Pickaxe className="w-6 h-6 text-primary-foreground" />
        </button>

        {/* Bottom Tab bar */}
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <div className="max-w-[420px] mx-auto glass-card border-b-0 rounded-b-none px-4 py-3">
            <div className="flex items-center justify-around">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className={cn('w-6 h-6', isActive && 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.8)]')} />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Gem Modal — mode is auto-detected via GPS */}
      <AddGemModal
        open={showAddGemModal}
        onOpenChange={setShowAddGemModal}
        onGemAdded={() => {}}
      />

      {/* Festival Lineup Modal */}
      <FestivalLineupModal
        open={showFestivalModal}
        onOpenChange={setShowFestivalModal}
        onGemsAdded={() => {}}
      />
    </div>
  );
};

export default AppShell;
