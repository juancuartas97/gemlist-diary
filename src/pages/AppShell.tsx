import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, Map, CalendarDays, LogOut, User } from 'lucide-react';
import { FloatingParticles } from '@/components/FloatingParticles';
import { GemIcon } from '@/components/GemIcon';
import { CollectTab } from '@/components/tabs/CollectTab';
import { TasteMapTab } from '@/components/tabs/TasteMapTab';
import { EventsTab } from '@/components/tabs/EventsTab';
import { getUser, clearUser } from '@/lib/storage';
import { cn } from '@/lib/utils';

type Tab = 'collect' | 'taste' | 'events';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'collect', label: 'Collect', icon: Gem },
  { id: 'taste', label: 'Taste Map', icon: Map },
  { id: 'events', label: 'Events', icon: CalendarDays },
];

const AppShell = () => {
  const [activeTab, setActiveTab] = useState<Tab>('collect');
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    clearUser();
    navigate('/auth');
  };

  if (!user) return null;

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
                {user.displayName}
              </span>
            </button>
            
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 glass-card p-3 rounded-xl min-w-[160px] animate-scale-in">
                <p className="text-sm text-muted-foreground mb-2 truncate">{user.email}</p>
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

        {/* Tab bar */}
        <div className="sticky top-[60px] z-10 glass-card border-t-0 rounded-none px-2 py-2">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-300',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.8)]')} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 px-4 py-6 overflow-y-auto">
          {activeTab === 'collect' && <CollectTab />}
          {activeTab === 'taste' && <TasteMapTab />}
          {activeTab === 'events' && <EventsTab />}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
