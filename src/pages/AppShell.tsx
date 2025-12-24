import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, User as UserIcon, LogOut, User, Plus } from 'lucide-react';
import { FloatingParticles } from '@/components/FloatingParticles';
import { GemIcon } from '@/components/GemIcon';
import { CollectTab } from '@/components/tabs/CollectTab';
import { ProfileTab } from '@/components/tabs/ProfileTab';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'treasure' | 'profile';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'treasure', label: 'Treasure Chest', icon: Gem },
  { id: 'profile', label: 'Profile', icon: UserIcon },
];

const AppShell = () => {
  const [activeTab, setActiveTab] = useState<Tab>('treasure');
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/auth');
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

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Raver';

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
          
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 glass-button px-3 py-1.5 rounded-full hover:border-primary/40 transition-colors"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground truncate max-w-[80px]">
                {displayName}
              </span>
            </button>
            
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 glass-card p-3 rounded-xl min-w-[160px] animate-scale-in">
                <p className="text-sm text-muted-foreground mb-1 truncate">{user.email}</p>
                {profile && (
                  <p className="text-xs text-primary mb-2">
                    {profile.raver_rank} • {profile.total_gems} gems
                  </p>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 pb-24 overflow-y-auto">
          {activeTab === 'treasure' && <CollectTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </main>

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
    </div>
  );
};

export default AppShell;
