import { BarChart3, Gem, Loader2 } from 'lucide-react';
import { GemBadge } from '@/components/GemBadge';
import { useAuth } from '@/hooks/useAuth';
import { useUserGems, UserGem } from '@/hooks/useGemData';
import { useMemo } from 'react';

// Map rarity tier to gem badge type
const rarityToGemType = (tier: string | null): string => {
  switch (tier) {
    case 'mythic': return 'Ruby';
    case 'legendary': return 'Sapphire';
    case 'rare': return 'Emerald';
    case 'uncommon': return 'Amethyst';
    default: return 'Amethyst';
  }
};

export const HomeTab = () => {
  const { user, profile } = useAuth();
  const { gems, loading } = useUserGems(user?.id);

  // Derive metrics from real gem data
  const metrics = useMemo(() => {
    if (!gems.length) {
      return {
        totalGems: 0,
        recentGems: [] as UserGem[],
        lastMined: null as UserGem | null,
        topGenre: null as { name: string; weight: number } | null,
        uniqueVenues: 0,
        uniqueArtists: 0,
      };
    }

    // Recent 4 gems
    const recentGems = gems.slice(0, 4);
    
    // Last mined gem
    const lastMined = gems[0] || null;
    
    // Calculate genre weights
    const genreCounts: Record<string, number> = {};
    gems.forEach(gem => {
      const genreName = gem.genre?.name || 'Unknown';
      genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
    });
    
    const totalGems = gems.length;
    const genreWeights = Object.entries(genreCounts)
      .map(([name, count]) => ({
        name,
        weight: Math.round((count / totalGems) * 100),
      }))
      .sort((a, b) => b.weight - a.weight);
    
    const topGenre = genreWeights[0] || null;
    
    // Unique venues and artists
    const uniqueVenues = new Set(gems.map(g => g.venue_id).filter(Boolean)).size;
    const uniqueArtists = new Set(gems.map(g => g.dj_id)).size;

    return {
      totalGems,
      recentGems,
      lastMined,
      topGenre,
      uniqueVenues,
      uniqueArtists,
    };
  }, [gems]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get first name from display_name or email
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Raver';
  const firstName = displayName.split(' ')[0];
  
  // Get avatar URL - prioritize profile avatar, then user metadata (Google/Apple)
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Profile" 
            className="w-14 h-14 rounded-full object-cover border-2 border-primary/40"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <span className="text-lg font-bold text-primary">
              {firstName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-foreground">{firstName}</h1>
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
            <span className="text-xs font-medium text-foreground">{metrics.totalGems} GEMS COLLECTED</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3">
          <div className="flex-1 glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-primary">{metrics.topGenre?.weight || 0}%</p>
            <p className="text-xs text-muted-foreground uppercase">{metrics.topGenre?.name || 'N/A'}</p>
          </div>
          <div className="flex-1 glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Gem className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">LAST MINED</p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {metrics.lastMined?.dj?.stage_name || 'None yet'}
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

        {metrics.recentGems.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center">
            <Gem className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No gems mined yet.</p>
            <p className="text-sm text-muted-foreground/60">Start mining to build your collection!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {metrics.recentGems.map((gem) => (
              <div
                key={gem.id}
                className="glass-card p-4 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <GemBadge type={rarityToGemType(gem.rarity_tier) as any} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate uppercase">
                      {gem.dj?.stage_name || 'Unknown'} @ {gem.venue?.name || 'Unknown'}
                    </p>
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {gem.rarity_tier || 'common'}
                    </p>
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
          <p className="text-lg font-bold text-primary">{metrics.totalGems}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="glass-card p-3 rounded-xl text-center">
          <p className="text-lg font-bold text-foreground">{metrics.uniqueVenues}</p>
          <p className="text-xs text-muted-foreground">Venues</p>
        </div>
        <div className="glass-card p-3 rounded-xl text-center">
          <p className="text-lg font-bold text-foreground">{metrics.uniqueArtists}</p>
          <p className="text-xs text-muted-foreground">Artists</p>
        </div>
      </div>
    </div>
  );
};
