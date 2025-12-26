import { useState, useEffect } from 'react';
import { Music, MapPin, Calendar, Ticket, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { FacetRatingsGroup } from '@/components/FacetRating';
import { GemMiningAnimation } from './GemMiningAnimation';
import { AddEventModal } from './AddEventModal';
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
import { type EventEdition } from '@/hooks/useEventSeries';
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
}

interface CollectedGemInfo {
  artistName: string;
  venueName?: string;
  eventName?: string;
  eventDate: string;
  genreName: string;
  gemColor: string;
}

export const AddGemModal = ({ open, onOpenChange, onGemAdded }: AddGemModalProps) => {
  const { user } = useAuth();
  const { genres } = useGenres();
  
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

  // Determine if form is valid for submission
  const canSubmit = () => {
    if (submitting) return false;
    
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

      const gem = await addUserGem({
        user_id: user.id,
        dj_id: djToUse.id,
        primary_genre_id: genreId,
        event_date: eventDate,
        venue_id: selectedVenue?.id,
        event_id: selectedEvent?.id,
        facet_ratings: facetRatings,
        private_note: notes || undefined,
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
            Mine a New Gem
          </DialogTitle>
        </DialogHeader>

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
            
            {/* Date */}
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
              {submitting ? 'Collecting...' : 'Collect Gem'}
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