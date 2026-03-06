import { useState, useEffect } from 'react';
import { Music, MapPin, Calendar, Ticket, ChevronDown, ChevronUp, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { FacetRatingsGroup } from '@/components/FacetRating';
import { GemMiningAnimation } from './GemMiningAnimation';
import { AddEventModal } from './AddEventModal';
import { RecentEventCard, RecentEventsSkeleton } from './RecentEventCard';
import { type CollectionMode } from './CollectionModeChooser';
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
  type FacetRatings
} from '@/hooks/useGemData';
import { useDJRecentPerformances } from '@/hooks/useDJRecentPerformances';
import { type EventEdition } from '@/hooks/useEventSeries';
import { calculateRarity, type RarityResult } from '@/hooks/useRarityCalculator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

// mode prop kept for API compatibility — live detection is now automatic via GPS
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
  isLive?: boolean;
}

export const AddGemModal = ({ open, onOpenChange, onGemAdded }: AddGemModalProps) => {
  const { user } = useAuth();
  const { genres } = useGenres();

  // GPS — captured passively on open, no user action required
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  // Core state — only DJ is required
  const [djQuery, setDjQuery] = useState('');
  const [selectedDJ, setSelectedDJ] = useState<DJ | null>(null);
  const [showNewDJGenreSelect, setShowNewDJGenreSelect] = useState(false);
  const [selectedGenreId, setSelectedGenreId] = useState<string>('');

  // Optional details
  const [venueQuery, setVenueQuery] = useState('');
  const [eventQuery, setEventQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);

  // Enrichment (collapsed by default)
  const [showEnrichment, setShowEnrichment] = useState(false);
  const [notes, setNotes] = useState('');
  const [facetRatings, setFacetRatings] = useState<FacetRatings>({
    sound_quality: null,
    energy: null,
    performance: null,
    crowd: null,
  });

  // Submit + animation
  const [submitting, setSubmitting] = useState(false);
  const [showMiningAnimation, setShowMiningAnimation] = useState(false);
  const [collectedGemInfo, setCollectedGemInfo] = useState<CollectedGemInfo | null>(null);

  // Add Event modal
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [pendingEventQuery, setPendingEventQuery] = useState('');

  // Search hooks
  const { djs: djResults, loading: djLoading } = useDJSearch(djQuery);
  const { venues: venueResults, loading: venueLoading } = useVenueSearch(venueQuery);
  const { events: eventResults, loading: eventLoading } = useEventSearch(eventQuery);
  const { performances: recentPerformances, loading: recentLoading } = useDJRecentPerformances(selectedDJ?.id || null);

  const currentGenre = genres.find(g => g.id === (selectedDJ?.primary_genre_id || selectedGenreId));
  const gemColor = currentGenre?.color_hex || '#1E8C6A';

  // Passively try to capture GPS when modal opens
  useEffect(() => {
    if (!open) return;
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLiveCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        // Silently fail — user just won't get live badge
        setLocating(false);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const resetForm = () => {
    setDjQuery('');
    setVenueQuery('');
    setEventQuery('');
    setSelectedDJ(null);
    setSelectedVenue(null);
    setSelectedEvent(null);
    setSelectedGenreId('');
    setEventDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setFacetRatings({ sound_quality: null, energy: null, performance: null, crowd: null });
    setShowNewDJGenreSelect(false);
    setShowEnrichment(false);
    setShowMiningAnimation(false);
    setCollectedGemInfo(null);
    setLiveCoords(null);
    setLocating(false);
  };

  // DJ handlers
  const handleDJSelect = (option: { id: string; label: string }) => {
    const dj = djResults.find(d => d.id === option.id);
    if (dj) {
      setSelectedDJ(dj);
      setDjQuery(dj.stage_name);
      setShowNewDJGenreSelect(false);
      if (dj.primary_genre_id && !selectedGenreId) setSelectedGenreId(dj.primary_genre_id);
    }
  };

  const handleCreateNewDJ = (stageName: string) => {
    setDjQuery(stageName);
    setSelectedDJ(null);
    setShowNewDJGenreSelect(true);
  };

  // Event handlers
  const handleEventSelect = (option: { id: string; label: string }) => {
    const event = eventResults.find(e => e.id === option.id);
    if (event) {
      setSelectedEvent(event);
      setEventQuery(event.title);
      if (event.venue) { setSelectedVenue(event.venue); setVenueQuery(event.venue.name); }
      if (event.start_at) setEventDate(event.start_at.split('T')[0]);
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
    if (edition.venue) { setSelectedVenue(edition.venue); setVenueQuery(edition.venue.name); }
    if (edition.start_date) setEventDate(edition.start_date);
  };

  // Venue handlers
  const handleVenueSelect = (option: { id: string; label: string }) => {
    const venue = venueResults.find(v => v.id === option.id);
    if (venue) { setSelectedVenue(venue); setVenueQuery(venue.name); }
  };

  const handleCreateNewVenue = async (venueName: string) => {
    const newVenue = await addVenue(venueName, 'club', 'Unknown City', 'Unknown');
    if (newVenue) { setSelectedVenue(newVenue); setVenueQuery(newVenue.name); }
  };

  // Recent performance quick-fill
  const handleRecentPerformanceSelect = (performance: typeof recentPerformances[0]) => {
    if (performance.venue) { setSelectedVenue(performance.venue); setVenueQuery(performance.venue.name); }
    else if (performance.city) setVenueQuery(performance.city);
    if (performance.event_series) {
      const year = new Date(performance.performance_date).getFullYear();
      setEventQuery(`${performance.event_series.name} ${year}`);
    }
    setEventDate(performance.performance_date);
  };

  const handleFacetChange = (category: string, value: number) => {
    setFacetRatings(prev => ({ ...prev, [category]: value }));
  };

  // Only DJ required to submit
  const canSubmit = () => {
    if (submitting) return false;
    if (selectedDJ) return true;
    if (djQuery.trim() && selectedGenreId) return true;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to collect gems'); return; }
    if (!djQuery.trim()) { toast.error('Please enter an artist name'); return; }
    setSubmitting(true);

    try {
      let djToUse = selectedDJ;

      if (!djToUse && djQuery.trim()) {
        if (!selectedGenreId) {
          toast.error('Please select a genre for the new artist');
          setSubmitting(false);
          return;
        }
        djToUse = await addDJ(djQuery.trim(), selectedGenreId);
        if (!djToUse) { toast.error('Failed to create artist'); setSubmitting(false); return; }
      }

      if (!djToUse) { toast.error('Please select or create an artist'); setSubmitting(false); return; }

      const genreId = djToUse.primary_genre_id || selectedGenreId;
      if (!genreId) { toast.error('Artist must have a genre'); setSubmitting(false); return; }

      // Resolve event series ID for rarity calculation
      let eventSeriesId: string | null = null;
      if (selectedEvent?.id) {
        const { data: editionData } = await supabase
          .from('event_editions')
          .select('series_id')
          .eq('id', selectedEvent.id)
          .maybeSingle();
        eventSeriesId = editionData?.series_id ?? null;
      }

      const city = selectedVenue?.city || null;
      const rarityResult = await calculateRarity(
        djToUse.id,
        selectedVenue?.id || null,
        city,
        eventSeriesId,
        eventDate
      );

      // is_live_mined = GPS coords were captured (passive — no explicit user verification step)
      const isLiveMined = liveCoords !== null;

      const gem = await addUserGem({
        user_id: user.id,
        dj_id: djToUse.id,
        primary_genre_id: genreId,
        event_date: eventDate,
        venue_id: selectedVenue?.id,
        event_id: selectedEvent?.id,
        rarity_score: rarityResult?.total_score,
        rarity_tier: rarityResult?.rarity_tier,
        facet_ratings: facetRatings,
        private_note: notes || undefined,
        is_live_mined: isLiveMined,
        live_lat: liveCoords?.lat,
        live_lng: liveCoords?.lng,
      });

      if (gem) {
        const gemGenre = genres.find(g => g.id === genreId);
        setCollectedGemInfo({
          artistName: djToUse.stage_name,
          venueName: selectedVenue?.name,
          eventName: selectedEvent?.title,
          eventDate,
          genreName: gemGenre?.name || 'Unknown',
          gemColor: gemGenre?.color_hex || '#1E8C6A',
          rarityResult,
          isLive: isLiveMined,
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

  const handleMiningContinue = () => resetForm();

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
        <DialogContent
          className="max-w-md max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto border-white/10"
          style={{ background: 'hsl(150 40% 6% / 0.97)', backdropFilter: 'blur(32px) saturate(180%)' }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              {/* Live gem color preview — animates as artist is selected */}
              <div
                className="w-5 h-5 rounded-sm shrink-0 transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${gemColor}40, ${gemColor})`,
                  boxShadow: `0 0 10px ${gemColor}50`,
                }}
              />
              <span className="font-display font-bold text-white text-base">Mine a Gem</span>
              {/* Passive GPS status */}
              {locating && (
                <span className="ml-auto text-[10px] font-normal text-white/40 flex items-center gap-1">
                  <Navigation className="w-3 h-3 animate-pulse" />
                  Locating…
                </span>
              )}
              {!locating && liveCoords && (
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  Live
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">

            {/* ── HERO: Artist search ── */}
            <AutocompleteInput
              value={djQuery}
              onChange={(value) => {
                setDjQuery(value);
                if (value !== selectedDJ?.stage_name) setSelectedDJ(null);
              }}
              onSelect={handleDJSelect}
              onCreateNew={handleCreateNewDJ}
              options={djResults.map(dj => ({
                id: dj.id,
                label: dj.stage_name,
                sublabel: dj.genre?.name || undefined,
              }))}
              loading={djLoading}
              placeholder="Artist / DJ *"
              icon={<Music className="w-4 h-4" />}
              createLabel="Add artist"
            />

            {/* Genre selector — only appears for new DJ */}
            {showNewDJGenreSelect && (
              <Select value={selectedGenreId} onValueChange={setSelectedGenreId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white/70">
                  <SelectValue placeholder="Genre for new artist *" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(genre => (
                    <SelectItem key={genre.id} value={genre.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: genre.color_hex }} />
                        {genre.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* ── Recent performances quick-select ── */}
            {selectedDJ && !showNewDJGenreSelect && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest px-0.5">
                  Recent shows
                </p>
                {recentLoading ? (
                  <RecentEventsSkeleton />
                ) : recentPerformances.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
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
                  <p className="text-xs text-white/25 italic py-1">
                    No recent shows logged for {selectedDJ.stage_name}
                  </p>
                )}
              </div>
            )}

            {/* ── Optional details: venue + event + date ── */}
            <div className="space-y-2.5">
              <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest px-0.5">
                Details <span className="normal-case font-normal opacity-60">(optional)</span>
              </p>

              <AutocompleteInput
                value={venueQuery}
                onChange={(value) => {
                  setVenueQuery(value);
                  if (value !== selectedVenue?.name) setSelectedVenue(null);
                }}
                onSelect={handleVenueSelect}
                onCreateNew={handleCreateNewVenue}
                options={venueResults.map(venue => ({
                  id: venue.id,
                  label: venue.name,
                  sublabel: `${venue.city}${venue.country ? `, ${venue.country}` : ''}`,
                }))}
                loading={venueLoading}
                placeholder="Venue"
                icon={<MapPin className="w-4 h-4" />}
                createLabel="Add venue"
              />

              <AutocompleteInput
                value={eventQuery}
                onChange={(value) => {
                  setEventQuery(value);
                  if (value !== selectedEvent?.title) setSelectedEvent(null);
                }}
                onSelect={handleEventSelect}
                onCreateNew={handleCreateNewEvent}
                options={eventResults.map(event => ({
                  id: event.id,
                  label: event.title,
                  sublabel: event.venue?.name
                    ? `${event.venue.name} · ${new Date(event.start_at).toLocaleDateString()}`
                    : new Date(event.start_at).toLocaleDateString(),
                }))}
                loading={eventLoading}
                placeholder="Event / festival"
                icon={<Ticket className="w-4 h-4" />}
                createLabel="Create event"
              />

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white/80"
                />
              </div>
            </div>

            {/* ── Enrichment toggle: ratings + notes ── */}
            <button
              type="button"
              onClick={() => setShowEnrichment(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm text-white/40 hover:text-white/70 hover:border-white/15 transition-colors"
            >
              <span>Rate this set</span>
              {showEnrichment ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showEnrichment && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="p-4 rounded-xl bg-white/5 border border-white/8">
                  <FacetRatingsGroup
                    ratings={facetRatings}
                    onChange={handleFacetChange}
                    color={gemColor}
                  />
                </div>
                <textarea
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-16 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>
            )}

            {/* ── Gem preview ── */}
            {(selectedDJ || (djQuery.trim() && selectedGenreId)) && (
              <div
                className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${gemColor}08, ${gemColor}15)`,
                  borderColor: `${gemColor}30`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${gemColor}20, ${gemColor}60)`,
                    boxShadow: `0 0 16px ${gemColor}30`,
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M12 2L3 9L12 22L21 9L12 2Z" fill={gemColor} stroke={gemColor} strokeWidth="1" />
                    <path d="M12 2L3 9H21L12 2Z" fill="rgba(255,255,255,0.3)" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-display font-semibold text-white truncate">
                    {selectedDJ?.stage_name || djQuery}
                  </div>
                  <div className="text-xs text-white/40 truncate">
                    {currentGenre?.name || 'Select genre'}
                    {selectedVenue && <span> · {selectedVenue.name}</span>}
                    {selectedEvent && <span> · {selectedEvent.title}</span>}
                    {liveCoords && <span className="text-emerald-400"> · Live</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex gap-3 pt-1">
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
                {submitting ? 'Mining…' : 'Mine Gem'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AddEventModal
        open={showAddEventModal}
        onOpenChange={setShowAddEventModal}
        onEventCreated={handleEventCreated}
        initialQuery={pendingEventQuery}
      />
    </>
  );
};
