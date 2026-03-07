import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music, Search, Star, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FloatingParticles } from '@/components/FloatingParticles';
import { useAuth } from '@/hooks/useAuth';
import { useUserGems, groupGemsByDJ } from '@/hooks/useGemData';
import type { UserGem, DJ, Genre } from '@/hooks/useGemData';
import { GemIcon } from '@/components/GemIcon';

interface ArtistSummary {
  dj: DJ;
  gems: UserGem[];
  gemCount: number;
  genre: Genre | undefined;
  avgRating: number;
  lastSeen: string;
  bestRarityTier: string | null;
}

const rarityOrder: Record<string, number> = {
  mythic: 5,
  legendary: 4,
  rare: 3,
  uncommon: 2,
  common: 1,
};

const rarityColors: Record<string, string> = {
  mythic: 'text-yellow-300',
  legendary: 'text-purple-400',
  rare: 'text-blue-400',
  uncommon: 'text-green-400',
  common: 'text-muted-foreground',
};

const ArtistsPortal = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isMockMode } = useAuth();
  const { gems, loading: gemsLoading } = useUserGems(user?.id);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user && !isMockMode) {
      navigate('/auth');
    }
  }, [authLoading, user, isMockMode, navigate]);

  const artists = useMemo(() => {
    const grouped = groupGemsByDJ(gems);
    const summaries: ArtistSummary[] = [];

    grouped.forEach((artistGems) => {
      const dj = artistGems[0]?.dj;
      if (!dj) return;

      const ratedGems = artistGems.filter(
        (g) => g.is_rated && g.facet_ratings
      );
      const avgRating =
        ratedGems.length > 0
          ? ratedGems.reduce((sum, g) => {
              const f = g.facet_ratings;
              const vals = [
                f.sound_quality,
                f.energy,
                f.performance,
                f.crowd,
              ].filter((v): v is number => v !== null);
              return sum + (vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0);
            }, 0) / ratedGems.length
          : 0;

      const sorted = [...artistGems].sort(
        (a, b) =>
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
      );

      const bestTier = artistGems.reduce<string | null>((best, g) => {
        const tier = g.rarity_tier;
        if (!tier) return best;
        if (!best) return tier;
        return (rarityOrder[tier] || 0) > (rarityOrder[best] || 0)
          ? tier
          : best;
      }, null);

      summaries.push({
        dj,
        gems: artistGems,
        gemCount: artistGems.length,
        genre: artistGems[0]?.genre,
        avgRating: Math.round(avgRating * 10) / 10,
        lastSeen: sorted[0]?.event_date || '',
        bestRarityTier: bestTier,
      });
    });

    summaries.sort((a, b) => b.gemCount - a.gemCount);
    return summaries;
  }, [gems]);

  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return artists;
    const q = searchQuery.toLowerCase();
    return artists.filter(
      (a) =>
        a.dj.stage_name.toLowerCase().includes(q) ||
        a.genre?.name.toLowerCase().includes(q) ||
        a.dj.home_city?.toLowerCase().includes(q)
    );
  }, [artists, searchQuery]);

  const loading = authLoading || gemsLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmic">
        <div className="animate-pulse-glow">
          <GemIcon className="w-16 h-16" />
        </div>
      </div>
    );
  }

  if (!user && !isMockMode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cosmic relative">
      <FloatingParticles />

      <div className="w-full max-w-[420px] mx-auto relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 glass-card border-t-0 rounded-t-none px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/app')}
            className="p-2 rounded-full hover:bg-card/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Artists</h1>
          <span className="ml-auto text-sm text-muted-foreground">
            {artists.length} {artists.length === 1 ? 'artist' : 'artists'}
          </span>
        </header>

        <main className="px-4 py-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search artists, genres, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>

          {/* Artists List */}
          {filteredArtists.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center">
              <Music className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? 'No artists match your search'
                  : 'No artists yet. Start collecting gems!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArtists.map((artist) => (
                <div
                  key={artist.dj.id}
                  className="glass-card p-4 rounded-2xl hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Artist avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: artist.genre?.color_hex
                          ? `${artist.genre.color_hex}30`
                          : 'hsl(var(--primary) / 0.2)',
                        borderWidth: 2,
                        borderColor: artist.genre?.color_hex || 'hsl(var(--primary))',
                      }}
                    >
                      <span
                        className="text-base font-bold"
                        style={{
                          color: artist.genre?.color_hex || 'hsl(var(--primary))',
                        }}
                      >
                        {artist.dj.stage_name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Artist info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {artist.dj.stage_name}
                        </h3>
                        {artist.bestRarityTier && (
                          <span
                            className={`text-[10px] font-bold uppercase ${
                              rarityColors[artist.bestRarityTier] || 'text-muted-foreground'
                            }`}
                          >
                            {artist.bestRarityTier}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        {artist.genre && (
                          <span
                            className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${artist.genre.color_hex}20`,
                              color: artist.genre.color_hex,
                            }}
                          >
                            {artist.genre.name}
                          </span>
                        )}
                        {artist.dj.home_city && (
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {artist.dj.home_city}
                          </span>
                        )}
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          <span className="font-semibold text-primary">
                            {artist.gemCount}
                          </span>{' '}
                          {artist.gemCount === 1 ? 'gem' : 'gems'}
                        </span>
                        {artist.avgRating > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {artist.avgRating.toFixed(1)}
                          </span>
                        )}
                        {artist.lastSeen && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            Last:{' '}
                            {new Date(artist.lastSeen).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ArtistsPortal;
