import { MapPin, Clock, BookOpen, Sparkles, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CollectionMode = 'memory' | 'live';

interface CollectionModeChooserProps {
  open: boolean;
  onSelect: (mode: CollectionMode) => void;
  onClose: () => void;
}

export const CollectionModeChooser = ({ open, onSelect, onClose }: CollectionModeChooserProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-sm space-y-4 animate-scale-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Collect a Gem</h2>
          <p className="text-sm text-muted-foreground mt-1">How are you adding this gem?</p>
        </div>

        {/* Log a Memory */}
        <button
          onClick={() => onSelect('memory')}
          className={cn(
            "w-full p-5 rounded-2xl text-left transition-all duration-200",
            "bg-card/60 backdrop-blur-xl border border-border/30",
            "hover:border-amber-500/50 hover:bg-amber-500/5",
            "active:scale-[0.98]",
            "group"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 group-hover:bg-amber-500/25 transition-colors">
              <BookOpen className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                Log a Memory
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Record a past event you attended. Add details, rate the experience, and keep it in your collection.
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground/70">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Any past date
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Diary entry
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Mine Live */}
        <button
          onClick={() => onSelect('live')}
          className={cn(
            "w-full p-5 rounded-2xl text-left transition-all duration-200",
            "bg-card/60 backdrop-blur-xl border border-border/30",
            "hover:border-emerald-500/50 hover:bg-emerald-500/5",
            "active:scale-[0.98]",
            "group relative overflow-hidden"
          )}
        >
          {/* Subtle pulse glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/25 transition-colors">
              <Navigation className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                Mine Live
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                You're at an event right now. We'll verify your location to generate a unique verified Gem ID.
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground/70">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location required
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Verified DNA
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
