import { getTasteProfile, getSets } from '@/lib/storage';
import { GemBadge } from '@/components/GemBadge';
import { StarRating } from '@/components/StarRating';
import { Calendar, MapPin, Music2 } from 'lucide-react';

export const TasteMapTab = () => {
  const profile = getTasteProfile();
  const recentSets = getSets().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Genre visualization */}
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Music2 className="w-5 h-5 text-primary" />
          Your Top Genres
        </h3>
        <div className="space-y-3">
          {profile.topGenres.map((genre, i) => (
            <div key={genre.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{genre.name}</span>
                <span className="text-xs text-muted-foreground">{genre.weight}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${genre.weight}%`,
                    background: `linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent sets */}
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Sets</h3>
        {recentSets.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No sets yet. Start collecting gems to see your history!
          </p>
        ) : (
          <div className="space-y-3">
            {recentSets.map((set) => (
              <div
                key={set.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <GemBadge type={set.gemType} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{set.djName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{set.venue}</span>
                    <Calendar className="w-3 h-3 ml-1" />
                    <span>{new Date(set.dateISO).toLocaleDateString()}</span>
                  </div>
                </div>
                <StarRating rating={set.rating} readonly size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats card */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-3xl font-bold text-primary neon-text">
            {getSets().length}
          </p>
          <p className="text-sm text-muted-foreground">Total Gems</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-3xl font-bold text-secondary neon-text-secondary">
            {profile.topGenres[0]?.name || '—'}
          </p>
          <p className="text-sm text-muted-foreground">Top Genre</p>
        </div>
      </div>
    </div>
  );
};
