import { useState } from 'react';
import { Calendar, MapPin, Music, Filter, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMockEvents, type Event } from '@/lib/storage';
import { cn } from '@/lib/utils';

const genres = ['All', 'Techno', 'House', 'Drum & Bass', 'Trance', 'Ambient'];

export const EventsTab = () => {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const events = getMockEvents();

  const filteredEvents = selectedGenre === 'All'
    ? events
    : events.filter((e) => e.genre === selectedGenre);

  return (
    <div className="space-y-4">
      {/* Filter toggle */}
      <Button
        variant="glass"
        onClick={() => setShowFilters(!showFilters)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
          {selectedGenre !== 'All' && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {selectedGenre}
            </span>
          )}
        </span>
        <ChevronRight className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-90')} />
      </Button>

      {/* Filters panel */}
      {showFilters && (
        <div className="glass-card p-4 rounded-xl animate-fade-in">
          <p className="text-sm font-medium text-muted-foreground mb-3">Genre</p>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                  selectedGenre === genre
                    ? 'bg-primary text-primary-foreground shadow-neon'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Events list */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No events found for this filter.</p>
          </div>
        ) : (
          filteredEvents.map((event, i) => (
            <EventCard key={event.id} event={event} delay={i * 0.05} />
          ))
        )}
      </div>
    </div>
  );
};

const EventCard = ({ event, delay }: { event: Event; delay: number }) => {
  const eventDate = new Date(event.date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('en-US', { month: 'short' });

  return (
    <div
      className="glass-card p-4 rounded-xl flex gap-4 hover:border-primary/40 transition-all duration-300 cursor-pointer group animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Date badge */}
      <div className="shrink-0 w-14 h-14 glass-button rounded-xl flex flex-col items-center justify-center group-hover:border-primary/40 transition-colors">
        <span className="text-lg font-bold text-primary leading-none">{day}</span>
        <span className="text-xs text-muted-foreground uppercase">{month}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {event.name}
        </h4>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {event.venue}
          </span>
          <span className="flex items-center gap-1">
            <Music className="w-3.5 h-3.5" />
            {event.genre}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground/60">{event.distance}</span>
          <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
};
