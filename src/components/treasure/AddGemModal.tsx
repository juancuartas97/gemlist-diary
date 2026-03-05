import { useState, useEffect } from 'react';
import { Music, MapPin, Calendar, Ticket, Plus, Navigation, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { FacetRatingsGroup } from '@/components/FacetRating';
import { GemMiningAnimation } from './GemMiningAnimation';
import { AddEventModal } from './AddEventModal';
import { RecentEventCard, RecentEventsSkeleton } from './RecentEventCard';
import { type CollectionMode } from './CollectionModeChooser';
import { useGeolocation } from '@/hooks/useGeolocation';
import { 
  useGenres, 
  useDJSearch, 
  useVenueSearch,
  useEventSearch,
  addDJ, 
  addVenue, 
  addUserGem,
  type DJ,
  type Venue,
  type Event,
  type Genre,
  type FacetRatings
} from '@/hooks/useGemData';
import { useDJRecentPerformances } from '@/hooks/useDJRecentPerformances';
import { type EventEdition } from '@/hooks/useEventSeries';
import { calculateRarity, type RarityResult } from '@/hooks/useRarityCalculator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface AddGemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGemAdded: () => void;
  mode?: CollectionMode;
}

interface CollectedGemInfo {
  artistName: string;
  venueName?: string;
  eventName?: string;
  eventDate: string;
  genreName: string;
  gemColor: string;
  rarityResult?: RarityResult | null;
}

export const AddGemModal = ({ open, onOpenChange, onGemAdded, mode = 'memory' }: AddGemModalProps) => {
  const { user } = useAuth();
  const { genres } = useGenres();
  const geolocation = useGeolocation();
  
  // Live mining verification state
  const [locationVerified, setLocationVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifyingLocation, setVerifyingLocation] = useState(false);
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number } | null>(null);
  const isLive = mode === 'live';
  
  // Form state
  const [djQuery, setDjQuery] = useState('');
  const [venueQuery, setVenueQuery] = useState('');
  const [eventQuery, setEventQuery] = useState('');
  const [selectedDJ, setSelectedDJ] = useState<DJ | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedGenreId, setSelectedGenreId] = useState<string>('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [facetRatings, setFacetRatings] = useState<FacetRatings>({
    sound_quality: null,
    energy: null,
    performance: null,
    crowd: null,
  });
  const [showNewDJGenreSelect, setShowNewDJGenreSelect] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Mining animation state
  const [showMiningAnimation, setShowMiningAnimation] = useState(false);
  const [collectedGemInfo, setCollectedGemInfo] = useState<CollectedGemInfo | null>(null);
  
  // Add Event Modal state
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [pendingEventQuery, setPendingEventQuery] = useState('');
  
  // Search results
  const { djs: djResults, loading: djLoading } = useDJSearch(djQuery);
  const { venues: venueResults, loading: venueLoading } = useVenueSearch(venueQuery);
  const { events: eventResults, loading: eventLoading } = useEventSearch(eventQuery);
  
  // Recent performances for selected DJ
  const { performances: recentPerformances, loading: recentLoading } = useDJRecentPerformances(selectedDJ?.id || null);

  // Get color for current genre
  const currentGenre = genres.find(g => g.id === (selectedDJ?.primary_genre_id || selectedGenreId));
  const gemColor = currentGenre?.color_hex || '#1E8C6A';

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetFormForNewGem();
    }
  }, [open]);

  const resetFormForNewGem = () => {
    setDjQuery('');
    setVenueQuery('');
    setEventQuery('');
    setSelectedDJ(null);
    setSelectedVenue(null);
    setSelectedEvent(null);
    setSelectedGenreId('');
    setEventDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setFacetRatings({
      sound_quality: null,
      energy: null,
      performance: null,
      crowd: null,
    });
    setShowNewDJGenreSelect(false);
    setShowMiningAnimation(false);
    setCollectedGemInfo(null);
    setLocationVerified(false);
    setVerificationError(null);
    setVerifyingLocation(false);
    setLiveCoords(null);
  };

  const handleDJSelect = (option: { id: string; label: string }) => {
    const dj = djResults.find(d => d.id === option.id);
    if (dj) {
      setSelectedDJ(dj);
      setDjQuery(dj.stage_name);
      setShowNewDJGenreSelect(false);
      // If DJ has a genre and no genre is selected, use DJ's genre
      if (dj.primary_genre_id && !selectedGenreId) {
        setSelectedGenreId(dj.primary_genre_id);
      }
    }
  };

  const handleCreateNewDJ = async (stageName: string) => {
    // Show genre selector for new DJ
    setDjQuery(stageName);
    setSelectedDJ(null);
    setShowNewDJGenreSelect(true);
  };

  const handleEventSelect = (option: { id: string; label: string }) => {
    const event = eventResults.find(e => e.id === option.id);
    if (event) {
      setSelectedEvent(event);
      setEventQuery(event.title);
      
      // Auto-fill venue from event
      if (event.venue) {
        setSelectedVenue(event.venue);
        setVenueQuery(event.venue.name);
      }
      
      // Auto-fill date from event
      if (event.start_at) {
        setEventDate(event.start_at.split('T')[0]);
      }
      
      // Auto-fill genre from event if available
      if (event.primary_genre_id && !selectedGenreId && !selectedDJ?.primary_genre_id) {
        setSelectedGenreId(event.primary_genre_id);
      }
    }
  };

  const handleCreateNewEvent = (eventName: string) => {
    setPendingEventQuery(eventName);
    setShowAddEventModal(true);
  };

  const handleEventCreated = (edition: EventEdition) => {
    // Map edition to Event-like structure for compatibility
    const eventLike: Event = {
      id: edition.id,
      title: edition.series?.name ? `${edition.series.name} ${edition.year}` : `Event ${edition.year}`,
      start_at: edition.start_date,
      end_at: edition.end_date,
      venue_id: edition.venue_id,
      venue: edition.venue,
      primary_genre_id: edition.series?.primary_genre_id || null,
    };
    
    setSelectedEvent(eventLike);
    setEventQuery(eventLike.title);
    
    // Auto-fill venue from edition
    if (edition.venue) {
      setSelectedVenue(edition.venue);
      setVenueQuery(edition.venue.name);
    }
    
    // Auto-fill date from edition
    if (edition.start_date) {
      setEventDate(edition.start_date);
    }
  };

  const handleVenueSelect = (option: { id: string; label: string }) => {
    const venue = venueResults.find(v => v.id === option.id);
    if (venue) {
      setSelectedVenue(venue);
      setVenueQuery(venue.name);
    }
  };

  const handleCreateNewVenue = async (venueName: string) => {
    // For now, create with default values - could expand to a modal
    const newVenue = await addVenue(venueName, 'club', 'Unknown City', 'Unknown');
    if (newVenue) {
      setSelectedVenue(newVenue);
      setVenueQuery(newVenue.name);
    }
  };

  const handleFacetChange = (category: string, value: number) => {
    setFacetRatings(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  // Handle selecting a recent performance - auto-fills all fields
  const handleRecentPerformanceSelect = (performance: typeof recentPerformances[0]) => {
    // Auto-fill venue
    if (performance.venue) {
      setSelectedVenue(performance.venue);
      setVenueQuery(performance.venue.name);
    } else if (performance.city) {
      setVenueQuery(performance.city);
    }
    
    // Auto-fill event if from a series
    if (performance.event_series) {
      const year = new Date(performance.performance_date).getFullYear();
      setEventQuery(`${performance.event_series.name} ${year}`);
    }
    
    // Auto-fill date
    setEventDate(performance.performance_date);
  };

  // Live mining: verify location
  const handleVerifyLocation = async () => {
    setVerifyingLocation(true);
    setVerificationError(null);
    
    try {
      const venueLat = selectedVenue ? null : null; // Venues don't have coords in our schema yet — captured below
      const venueLng = selectedVenue ? null : null;
      
      // For now, just capture the position. Full venue proximity check requires venue lat/lng.
      const result = await geolocation.verifyLocation(
        null, // venue lat — not available yet for all venues
        null, // venue lng
        selectedEvent?.start_at || null,
        selectedEvent?.end_at || null
      );
      
      setLiveCoords({ lat: result.lat, lng: result.lng });
      
      if (result.verified) {
        setLocationVerified(true);
        toast.success('Location verified! You\'re here.');
      } else {
        setVerificationError(result.reason || 'Location verification failed');
      }
    } catch (err: unknown) {
      setVerificationError(err instanceof Error ? err.message : 'Failed to get location');
    }
    
    setVerifyingLocation(false);
  };

  // Determine if form is valid for submission
  const canSubmit = () => {
    if (submitting) return false;
    if (isLive && !locationVerified) return false;
    
    // Must have a DJ selected OR (have a DJ name AND a genre selected)
    if (selectedDJ) return true;
    if (djQuery.trim() && selectedGenreId) return true;
    
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to collect gems');
      return;
    }

    if (!djQuery.trim()) {
      toast.error('Please enter a DJ name');
      return;
    }

    setSubmitting(true);

    try {
      let djToUse = selectedDJ;
      
      // If new DJ, create them first
      if (!djToUse && djQuery.trim()) {
        if (!selectedGenreId) {
          toast.error('Please select a genre for the new artist');
          setSubmitting(false);
          return;
        }
        djToUse = await addDJ(djQuery.trim(), selectedGenreId);
        if (!djToUse) {
          toast.error('Failed to create artist');
          setSubmitting(false);
          return;
        }
      }

      if (!djToUse) {
        toast.error('Please select or create an artist');
        setSubmitting(false);
        return;
      }

      const genreId = djToUse.primary_genre_id || selectedGenreId;
      if (!genreId) {
        toast.error('Artist must have a genre');
        setSubmitting(false);
        return;
      }

      // Get city from venue for rarity calculation
      const city = selectedVenue?.city || null;

      // Get event series ID from the selected event's edition record
      let eventSeriesId: string | null = null;
      if (selectedEvent?.id) {
        const { data: editionData } = await supabase
          .from('event_editions')
          .select('series_id')
          .eq('id', selectedEvent.id)
          .maybeSingle();
        eventSeriesId = editionData?.series_id ?? null;
      }

      // Calculate rarity BEFORE inserting gem
      const rarityResult = await calculateRarity(
        djToUse.id,
        selectedVenue?.id || null,
        city,
        eventSeriesId,
        eventDate
      );

      const gem = await addUserGem({
        user_id: user.id,
        dj_id: djToUse.id,
        primary_genre_id: genreId,
        event_date: isLive ? new Date().toISOString().split('T')[0] : eventDate,
        venue_id: selectedVenue?.id,
        event_id: selectedEvent?.id,
        rarity_score: rarityResult?.total_score,
        rarity_tier: rarityResult?.rarity_tier,
        facet_ratings: facetRatings,
        private_note: notes || undefined,
        is_live_mined: isLive && locationVerified,
        live_lat: liveCoords?.lat,
        live_lng: liveCoords?.lng,
      });

      if (gem) {
        const gemGenre = genres.find(g => g.id === genreId);
        setCollectedGemInfo({
          artistName: djToUse.stage_name,
          venueName: selectedVenue?.name,
          eventName: selectedEvent?.title,
          eventDate: eventDate,
          genreName: gemGenre?.name || 'Unknown',
          gemColor: gemGenre?.color_hex || '#1E8C6A',
          rarityResult: rarityResult,
        });
        setShowMiningAnimation(true);
        onGemAdded();
      } else {
        toast.error('Failed to collect gem');
      }
    } catch (error) {
      console.error('Error adding gem:', error);
      toast.error('Something went wrong');
    }

    setSubmitting(false);
  };

  const handleMiningClose = () => {
    setShowMiningAnimation(false);
    setCollectedGemInfo(null);
    onOpenChange(false);
  };

  const handleMiningContinue = () => {
    resetFormForNewGem();
  };

  // Show mining animation instead of dialog content
  if (showMiningAnimation && collectedGemInfo) {
    return (
      <GemMiningAnimation
        open={showMiningAnimation}
        onClose={handleMiningClose}
        onContinue={handleMiningContinue}
        artistName={collectedGemInfo.artistName}
        venueName={collectedGemInfo.venueName}
        eventName={collectedGemInfo.eventName}
        eventDate={collectedGemInfo.eventDate}
        genreName={collectedGemInfo.genreName}
        gemColor={collectedGemInfo.gemColor}
        rarityResult={collectedGemInfo.rarityResult}
      />
    );
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border/30 max-w-md max-h-[85vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <div 
              className="w-5 h-5 rounded-sm"
              style={{ 
                background: `linear-gradient(135deg, ${gemColor}40, ${gemColor})`,
                boxShadow: `0 0 10px ${gemColor}50`
              }}
            />
            {isLive ? 'Mine Live' : 'Log a Memory'}
            {isLive && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Live Mining: Location Verification Banner */}
        {isLive && (
          <div className={cn(
            "p-3 rounded-xl border text-sm",
            locationVerified
              ? "bg-emerald-500/10 border-emerald-500/30"
              : verificationError
              ? "bg-destructive/10 border-destructive/30"
              : "bg-muted/30 border-border/20"
          )}>
            {locationVerified ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Location verified — you're here!</span>
              </div>
            ) : verificationError ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{verificationError}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleVerifyLocation}
                  disabled={verifyingLocation}
                  className="text-xs"
                >
                  Try again
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Verify your location to earn a <span className="text-emerald-400 font-medium">Verified</span> gem with a unique DNA modifier.
                </p>
                <Button
                  type="button"
                  variant="neon"
                  size="sm"
                  onClick={handleVerifyLocation}
                  disabled={verifyingLocation}
                  className="w-full"
                >
                  {verifyingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Verify My Location
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-3">
            {/* DJ/Artist Autocomplete */}
            <AutocompleteInput
              value={djQuery}
              onChange={(value) => {
                setDjQuery(value);
                if (value !== selectedDJ?.stage_name) {
                  setSelectedDJ(null);
                }
              }}
              onSelect={handleDJSelect}
              onCreateNew={handleCreateNewDJ}
              options={djResults.map(dj => ({
                id: dj.id,
                label: dj.stage_name,
                sublabel: dj.genre?.name || undefined,
              }))}
              loading={djLoading}
              placeholder="DJ / Artist Name *"
              icon={<Music className="w-4 h-4" />}
              createLabel="Add artist"
            />

            {/* Genre selector for new DJ */}
            {showNewDJGenreSelect && (
              <Select value={selectedGenreId} onValueChange={setSelectedGenreId}>
                <SelectTrigger className="bg-background/50 border-border/30">
                  <SelectValue placeholder="Select genre for new artist *" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(genre => (
                    <SelectItem key={genre.id} value={genre.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: genre.color_hex }}
                        />
                        {genre.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Recent Events Quick-Select - shown when DJ is selected */}
            {selectedDJ && !showNewDJGenreSelect && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Recent Events
                </label>
                {recentLoading ? (
                  <RecentEventsSkeleton />
                ) : recentPerformances.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                    {recentPerformances.map((perf) => (
                      <RecentEventCard
                        key={perf.id}
                        performance={perf}
                        onClick={() => handleRecentPerformanceSelect(perf)}
                        genreColor={gemColor}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/60 italic py-2">
                    No recent events found for {selectedDJ.stage_name}
                  </p>
                )}
              </div>
            )}

            {/* Event Autocomplete (optional) */}
            <AutocompleteInput
              value={eventQuery}
              onChange={(value) => {
                setEventQuery(value);
                if (value !== selectedEvent?.title) {
                  setSelectedEvent(null);
                }
              }}
              onSelect={handleEventSelect}
              onCreateNew={handleCreateNewEvent}
              options={eventResults.map(event => ({
                id: event.id,
                label: event.title,
                sublabel: event.venue?.name 
                  ? `${event.venue.name} • ${new Date(event.start_at).toLocaleDateString()}`
                  : new Date(event.start_at).toLocaleDateString(),
              }))}
              loading={eventLoading}
              placeholder="Event (optional)"
              icon={<Ticket className="w-4 h-4" />}
              createLabel="Create event"
            />
            
            {/* Venue Autocomplete */}
            <AutocompleteInput
              value={venueQuery}
              onChange={(value) => {
                setVenueQuery(value);
                if (value !== selectedVenue?.name) {
                  setSelectedVenue(null);
                }
              }}
              onSelect={handleVenueSelect}
              onCreateNew={handleCreateNewVenue}
              options={venueResults.map(venue => ({
                id: venue.id,
                label: venue.name,
                sublabel: `${venue.city}${venue.country ? `, ${venue.country}` : ''}`,
              }))}
              loading={venueLoading}
              placeholder="Venue (optional)"
              icon={<MapPin className="w-4 h-4" />}
              createLabel="Add venue"
            />
            
            {/* Date - hidden in live mode (auto-set to today) */}
            {!isLive && (
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="pl-10 bg-background/50 border-border/30"
                  required
                />
              </div>
            )}
            
            {/* Notes */}
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-16 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          
          {/* Facet Ratings */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Rate Your Experience (optional)
            </label>
            <div className="p-4 rounded-xl bg-background/30 border border-border/20">
              <FacetRatingsGroup
                ratings={facetRatings}
                onChange={handleFacetChange}
                color={gemColor}
              />
            </div>
          </div>

          {/* Selected gem preview */}
          {(selectedDJ || (djQuery.trim() && selectedGenreId)) && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/30 border border-border/20">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${gemColor}20, ${gemColor}60)`,
                  boxShadow: `0 0 20px ${gemColor}30`
                }}
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path
                    d="M12 2L3 9L12 22L21 9L12 2Z"
                    fill={gemColor}
                    stroke={gemColor}
                    strokeWidth="1"
                  />
                  <path
                    d="M12 2L3 9H21L12 2Z"
                    fill="rgba(255,255,255,0.3)"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium">{currentGenre?.name} Gem</div>
                <div className="text-xs text-muted-foreground">
                  {selectedDJ?.stage_name || djQuery}
                  {selectedEvent && <span> • {selectedEvent.title}</span>}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="neon" 
              className="flex-1"
              disabled={!canSubmit()}
            >
              {submitting ? 'Collecting...' : isLive ? 'Mine Verified Gem' : 'Collect Gem'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Add Event Modal */}
    <AddEventModal
      open={showAddEventModal}
      onOpenChange={setShowAddEventModal}
      onEventCreated={handleEventCreated}
      initialQuery={pendingEventQuery}
    />
    </>
  );
};
