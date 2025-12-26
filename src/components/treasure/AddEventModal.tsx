import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Calendar, Music, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { 
  useGenres, 
  useVenueSearch,
  addVenue,
  addEvent,
  type Venue,
  type Genre,
  type Event
} from '@/hooks/useGemData';
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
import { supabase } from '@/integrations/supabase/client';

interface AIEventDetails {
  event_title: string;
  venue_name: string | null;
  city: string | null;
  country: string | null;
  estimated_date: string | null;
  genre: string | null;
  typical_headliners: string[];
  description: string | null;
  confidence: 'high' | 'medium' | 'low';
}

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: (event: Event) => void;
  initialQuery?: string;
}

export const AddEventModal = ({ 
  open, 
  onOpenChange, 
  onEventCreated,
  initialQuery = ''
}: AddEventModalProps) => {
  const { genres } = useGenres();
  
  // Form state
  const [eventTitle, setEventTitle] = useState(initialQuery);
  const [venueQuery, setVenueQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedGenreId, setSelectedGenreId] = useState<string>('');
  const [eventDate, setEventDate] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiDetails, setAiDetails] = useState<AIEventDetails | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Search results
  const { venues: venueResults, loading: venueLoading } = useVenueSearch(venueQuery);

  // Update event title when initialQuery changes
  useEffect(() => {
    if (open && initialQuery) {
      setEventTitle(initialQuery);
    }
  }, [open, initialQuery]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setEventTitle('');
      setVenueQuery('');
      setSelectedVenue(null);
      setSelectedGenreId('');
      setEventDate('');
      setAiDetails(null);
      setIsSearchingAI(false);
    }
  }, [open]);

  const handleVenueSelect = (option: { id: string; label: string }) => {
    const venue = venueResults.find(v => v.id === option.id);
    if (venue) {
      setSelectedVenue(venue);
      setVenueQuery(venue.name);
    }
  };

  const handleCreateNewVenue = async (venueName: string) => {
    // Use AI details if available, otherwise defaults
    const city = aiDetails?.city || 'Unknown City';
    const country = aiDetails?.country || 'Unknown';
    
    const newVenue = await addVenue(venueName, 'festival', city, country);
    if (newVenue) {
      setSelectedVenue(newVenue);
      setVenueQuery(newVenue.name);
      toast.success(`Created venue: ${newVenue.name}`);
    }
  };

  const searchWithAI = async () => {
    if (!eventTitle.trim()) {
      toast.error('Please enter an event name first');
      return;
    }

    setIsSearchingAI(true);
    setAiDetails(null);

    try {
      const { data, error } = await supabase.functions.invoke('search-event-details', {
        body: { query: eventTitle }
      });

      if (error) {
        console.error('AI search error:', error);
        toast.error('Failed to search for event details');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.data) {
        const details = data.data as AIEventDetails;
        setAiDetails(details);
        
        // Auto-fill fields from AI response
        if (details.event_title) {
          setEventTitle(details.event_title);
        }
        
        if (details.venue_name) {
          setVenueQuery(details.venue_name);
          // Try to match to existing venue
          // We'll let the user confirm or create new
        }
        
        if (details.estimated_date) {
          // Handle both YYYY-MM-DD and YYYY-MM formats
          if (details.estimated_date.length === 7) {
            setEventDate(details.estimated_date + '-01');
          } else {
            setEventDate(details.estimated_date);
          }
        }
        
        if (details.genre) {
          // Try to match genre to our database
          const matchedGenre = genres.find(g => 
            g.name.toLowerCase() === details.genre?.toLowerCase() ||
            g.name.toLowerCase().includes(details.genre?.toLowerCase() || '') ||
            details.genre?.toLowerCase().includes(g.name.toLowerCase())
          );
          if (matchedGenre) {
            setSelectedGenreId(matchedGenre.id);
          }
        }

        toast.success(`Found details for ${details.event_title}`, {
          description: details.confidence === 'low' 
            ? 'Low confidence - please verify details' 
            : undefined
        });
      }
    } catch (err) {
      console.error('AI search error:', err);
      toast.error('Failed to search for event details');
    } finally {
      setIsSearchingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventTitle.trim()) {
      toast.error('Please enter an event title');
      return;
    }

    if (!eventDate) {
      toast.error('Please select a date');
      return;
    }

    setSubmitting(true);

    try {
      const newEvent = await addEvent({
        title: eventTitle.trim(),
        start_at: eventDate,
        venue_id: selectedVenue?.id,
        primary_genre_id: selectedGenreId || undefined,
      });

      if (newEvent) {
        toast.success(`Created event: ${newEvent.title}`);
        onEventCreated(newEvent);
        onOpenChange(false);
      } else {
        toast.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Something went wrong');
    }

    setSubmitting(false);
  };

  const currentGenre = genres.find(g => g.id === selectedGenreId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border/30 max-w-md max-h-[85vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="w-5 h-5 text-primary" />
            Create New Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Event Title with AI Search */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event name (e.g., Tomorrowland 2025)"
                className="flex-1 bg-background/50 border-border/30"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={searchWithAI}
                disabled={isSearchingAI || !eventTitle.trim()}
                className={cn(
                  "shrink-0",
                  isSearchingAI && "animate-pulse"
                )}
                title="Search with AI"
              >
                {isSearchingAI ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </Button>
            </div>
            {aiDetails && (
              <div className="text-xs text-muted-foreground bg-background/30 rounded-lg p-2 border border-border/20">
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="font-medium">AI Found:</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] uppercase",
                    aiDetails.confidence === 'high' && "bg-emerald-500/20 text-emerald-400",
                    aiDetails.confidence === 'medium' && "bg-amber-500/20 text-amber-400",
                    aiDetails.confidence === 'low' && "bg-red-500/20 text-red-400"
                  )}>
                    {aiDetails.confidence} confidence
                  </span>
                </div>
                {aiDetails.description && (
                  <p className="text-muted-foreground/80">{aiDetails.description}</p>
                )}
                {aiDetails.typical_headliners?.length > 0 && (
                  <p className="mt-1">
                    <span className="text-muted-foreground/60">Typical artists:</span>{' '}
                    {aiDetails.typical_headliners.slice(0, 3).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Venue */}
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
            placeholder="Venue / Location"
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

          {/* Genre */}
          <Select value={selectedGenreId} onValueChange={setSelectedGenreId}>
            <SelectTrigger className="bg-background/50 border-border/30">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-muted-foreground/50" />
                <SelectValue placeholder="Genre (optional)" />
              </div>
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

          {/* Preview */}
          {eventTitle.trim() && eventDate && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/30 border border-border/20">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ 
                  background: currentGenre 
                    ? `linear-gradient(135deg, ${currentGenre.color_hex}20, ${currentGenre.color_hex}60)`
                    : 'linear-gradient(135deg, hsl(var(--primary)/0.2), hsl(var(--primary)/0.6))',
                }}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium">{eventTitle}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedVenue?.name && `${selectedVenue.name} • `}
                  {new Date(eventDate).toLocaleDateString()}
                  {currentGenre && ` • ${currentGenre.name}`}
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
              disabled={submitting || !eventTitle.trim() || !eventDate}
            >
              {submitting ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
