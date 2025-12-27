import { MapPin, Calendar, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecentPerformance } from '@/hooks/useDJRecentPerformances';
import { format } from 'date-fns';

interface RecentEventCardProps {
  performance: RecentPerformance;
  onClick: () => void;
  genreColor?: string;
}

export const RecentEventCard = ({ performance, onClick, genreColor = '#1E8C6A' }: RecentEventCardProps) => {
  const venueName = performance.venue?.name || performance.city;
  const eventName = performance.event_series?.name;
  const date = format(new Date(performance.performance_date), 'MMM d, yyyy');

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start p-3 rounded-xl",
        "bg-background/40 border border-border/30",
        "hover:bg-background/60 hover:border-primary/40",
        "transition-all duration-200 cursor-pointer",
        "text-left w-full min-w-[140px] max-w-[160px]",
        "group"
      )}
      style={{
        boxShadow: `0 0 0 0 ${genreColor}40`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 15px ${genreColor}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 0 ${genreColor}40`;
      }}
    >
      {/* Event name or venue icon */}
      <div className="flex items-center gap-1.5 mb-1">
        {eventName ? (
          <Ticket className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        ) : (
          <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-xs font-medium truncate max-w-[110px]" style={{ color: eventName ? genreColor : undefined }}>
          {eventName || venueName}
        </span>
      </div>
      
      {/* Venue (if different from event) */}
      {eventName && (
        <div className="flex items-center gap-1.5 mb-1">
          <MapPin className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate max-w-[110px]">
            {venueName}
          </span>
        </div>
      )}
      
      {/* Date */}
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
    </button>
  );
};

export const RecentEventsSkeleton = () => (
  <div className="flex gap-2 overflow-x-auto pb-1">
    {[1, 2, 3].map((i) => (
      <div 
        key={i}
        className="flex flex-col p-3 rounded-xl bg-background/30 border border-border/20 min-w-[140px] animate-pulse"
      >
        <div className="h-3.5 w-20 bg-muted/30 rounded mb-2" />
        <div className="h-3 w-16 bg-muted/20 rounded mb-1" />
        <div className="h-3 w-24 bg-muted/20 rounded" />
      </div>
    ))}
  </div>
);
