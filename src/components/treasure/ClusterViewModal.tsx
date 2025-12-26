import { format } from 'date-fns';
import { X, MapPin, Calendar, Music } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type UserGem } from '@/hooks/useGemData';
import { CrystalGem } from './CrystalGem';

interface ClusterViewModalProps {
  gems: UserGem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGemClick: (gem: UserGem) => void;
}

export const ClusterViewModal = ({ gems, open, onOpenChange, onGemClick }: ClusterViewModalProps) => {
  if (gems.length === 0) return null;

  const djName = gems[0].dj?.stage_name || 'Unknown Artist';
  const genreColor = gems[0].genre?.color_hex || '#1E8C6A';

  const handleGemClick = (gem: UserGem) => {
    onGemClick(gem);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-background/95 backdrop-blur-xl border-border/30 p-0 overflow-hidden">
        {/* Header */}
        <div 
          className="relative px-6 pt-6 pb-4 border-b border-border/20"
          style={{
            background: `linear-gradient(180deg, ${genreColor}15 0%, transparent 100%)`,
          }}
        >
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: genreColor, boxShadow: `0 0 10px ${genreColor}` }}
            />
            {djName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {gems.length} gem{gems.length > 1 ? 's' : ''} collected
          </p>
        </div>

        {/* Gems List */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-4 space-y-3">
            {gems.map((gem, index) => (
              <button
                key={gem.id}
                onClick={() => handleGemClick(gem)}
                className="w-full flex items-center gap-4 p-3 rounded-xl bg-card/50 hover:bg-card/80 border border-border/20 hover:border-border/40 transition-all duration-200 group text-left"
              >
                {/* Gem Visual */}
                <div className="relative flex-shrink-0">
                  <CrystalGem 
                    gem={gem} 
                    delay={index * 0.1} 
                    size="sm"
                    showLabel={false}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(gem.event_date), 'MMM d, yyyy')}</span>
                  </div>
                  
                  {gem.venue && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{gem.venue.name}</span>
                    </div>
                  )}
                  
                  {gem.genre && (
                    <div className="flex items-center gap-2 text-xs">
                      <Music className="w-3 h-3" style={{ color: gem.genre.color_hex }} />
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{ 
                          backgroundColor: `${gem.genre.color_hex}20`,
                          color: gem.genre.color_hex,
                        }}
                      >
                        {gem.genre.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Arrow indicator */}
                <div className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
