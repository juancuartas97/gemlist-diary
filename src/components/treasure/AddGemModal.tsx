import { useState } from 'react';
import { Music, MapPin, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GemBadge } from '@/components/GemBadge';
import { StarRating } from '@/components/StarRating';
import { addSet, type SetEntry, type GemType } from '@/lib/storage';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const gemTypes: GemType[] = ['Emerald', 'Amethyst', 'Sapphire', 'Ruby'];

interface AddGemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGemAdded: (gem: SetEntry) => void;
}

export const AddGemModal = ({ open, onOpenChange, onGemAdded }: AddGemModalProps) => {
  const [formData, setFormData] = useState({
    djName: '',
    venue: '',
    dateISO: new Date().toISOString().split('T')[0],
    notes: '',
    rating: 5,
    gemType: 'Emerald' as GemType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSet = addSet(formData);
    onGemAdded(newSet);
    setFormData({
      djName: '',
      venue: '',
      dateISO: new Date().toISOString().split('T')[0],
      notes: '',
      rating: 5,
      gemType: 'Emerald',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Music className="w-5 h-5 text-primary" />
            Mine a New Gem
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-3">
            <div className="relative">
              <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                placeholder="DJ / Artist Name"
                value={formData.djName}
                onChange={(e) => setFormData({ ...formData, djName: e.target.value })}
                className="pl-10 bg-background/50 border-border/30"
                required
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                placeholder="Venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="pl-10 bg-background/50 border-border/30"
                required
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                type="date"
                value={formData.dateISO}
                onChange={(e) => setFormData({ ...formData, dateISO: e.target.value })}
                className="pl-10 bg-background/50 border-border/30"
                required
              />
            </div>
            
            <textarea
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full h-20 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Rating</label>
            <StarRating
              rating={formData.rating}
              onChange={(rating) => setFormData({ ...formData, rating })}
              size="lg"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Gem Type</label>
            <div className="flex gap-3 flex-wrap">
              {gemTypes.map((gem) => (
                <button
                  key={gem}
                  type="button"
                  onClick={() => setFormData({ ...formData, gemType: gem })}
                  className={cn(
                    'transition-all duration-200 p-1 rounded-lg',
                    formData.gemType === gem 
                      ? 'scale-110 ring-2 ring-primary/50 bg-primary/10' 
                      : 'opacity-50 hover:opacity-80'
                  )}
                >
                  <GemBadge type={gem} size="lg" showLabel />
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="neon" className="flex-1">
              Add to Vault
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
