import { BarChart3, Gem } from 'lucide-react';
import { GemBadge } from '@/components/GemBadge';
import { useAuth } from '@/hooks/useAuth';
import { getSets, getTasteProfile } from '@/lib/storage';

export const HomeTab = () => {
  const { profile } = useAuth();
  const sets = getSets();
  const tasteProfile = getTasteProfile();
  const recentSets = sets.slice(0, 4);
  const topGenre = tasteProfile.topGenres[0];
  const lastMined = sets[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = profile?.display_name || 'Raver';

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
          <span className="text-lg font-bold text-primary">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{getGreeting()}</p>
          <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
        </div>
      </div>

      {/* Your Vibe Card */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">YOUR VIBE</p>
              <p className="text-xs text-primary">Weekly Update</p>
            </div>
          </div>
          <div className="bg-card/60 px-3 py-1.5 rounded-full">
            <span className="text-xs font-medium text-foreground">{sets.length} GEMS COLLECTED</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3">
          <div className="flex-1 glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-primary">{topGenre?.weight || 0}%</p>
            <p className="text-xs text-muted-foreground uppercase">{topGenre?.name || 'N/A'}</p>
          </div>
          <div className="flex-1 glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Gem className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">LAST MINED</p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {lastMined?.djName || 'None yet'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Freshly Mined Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Gem className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Freshly Mined</h2>
        </div>

        {recentSets.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center">
            <Gem className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No gems mined yet.</p>
            <p className="text-sm text-muted-foreground/60">Start mining to build your collection!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recentSets.map((set) => (
              <div
                key={set.id}
                className="glass-card p-4 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <GemBadge type={set.gemType} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate uppercase">
                      {set.djName} @ {set.venue}
                    </p>
                    <p className="text-sm font-semibold text-foreground">{set.gemType}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 rounded-xl text-center">
          <p className="text-lg font-bold text-primary">{sets.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="glass-card p-3 rounded-xl text-center">
          <p className="text-lg font-bold text-foreground">
            {new Set(sets.map(s => s.venue)).size}
          </p>
          <p className="text-xs text-muted-foreground">Venues</p>
        </div>
        <div className="glass-card p-3 rounded-xl text-center">
          <p className="text-lg font-bold text-foreground">
            {new Set(sets.map(s => s.djName)).size}
          </p>
          <p className="text-xs text-muted-foreground">Artists</p>
        </div>
      </div>
    </div>
  );
};
