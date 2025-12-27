import { useUnlockedAchievements } from '@/hooks/useAchievements';
import { useAuth } from '@/hooks/useAuth';
import { AchievementPin } from './AchievementPin';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';

export const TrophyCase = () => {
  const { user } = useAuth();
  const { data: achievements, isLoading } = useUnlockedAchievements(user?.id);

  if (isLoading) {
    return (
      <div className="glass-card p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Trophy Case</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const unlockedAchievements = achievements || [];
  
  // Group by category for display
  const artistMastery = unlockedAchievements.filter(
    a => a.achievement.category === 'artist_mastery'
  );
  const venueLoyalty = unlockedAchievements.filter(
    a => a.achievement.category === 'venue_loyalty'
  );
  const special = unlockedAchievements.filter(
    a => a.achievement.category === 'special' || a.achievement.category === 'genre_dedication'
  );

  // Get highest tier per reference for artist/venue achievements
  const getBestAchievementPerReference = (achievements: typeof unlockedAchievements) => {
    const byReference = new Map<string, typeof unlockedAchievements[0]>();
    
    achievements.forEach(a => {
      const refKey = a.reference_id || 'global';
      const existing = byReference.get(refKey);
      if (!existing || a.achievement.tier > existing.achievement.tier) {
        byReference.set(refKey, a);
      }
    });
    
    return Array.from(byReference.values());
  };

  const topArtistAchievements = getBestAchievementPerReference(artistMastery).slice(0, 4);
  const topVenueAchievements = getBestAchievementPerReference(venueLoyalty).slice(0, 4);
  const topSpecialAchievements = special.slice(0, 4);

  const allTopAchievements = [
    ...topArtistAchievements,
    ...topVenueAchievements,
    ...topSpecialAchievements,
  ].slice(0, 8);

  return (
    <div className="glass-card p-5 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Trophy Case</h3>
        {unlockedAchievements.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {unlockedAchievements.length} unlocked
          </span>
        )}
      </div>

      {allTopAchievements.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            No trophies yet. Start collecting gems to earn achievements!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {allTopAchievements.map((achievement) => (
            <AchievementPin
              key={achievement.id}
              achievement={achievement.achievement}
              referenceName={achievement.reference_name}
              unlockedAt={achievement.unlocked_at}
            />
          ))}
        </div>
      )}

      {/* Progress Preview */}
      {unlockedAchievements.length > 0 && unlockedAchievements.length < 8 && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground text-center">
            Keep collecting to unlock more achievements!
          </p>
        </div>
      )}
    </div>
  );
};
