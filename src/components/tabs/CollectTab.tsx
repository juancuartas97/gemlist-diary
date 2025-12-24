import { useState } from 'react';
import { Plus, Trash2, Calendar, MapPin, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GemBadge } from '@/components/GemBadge';
import { StarRating } from '@/components/StarRating';
import { getSets, addSet, deleteSet, type SetEntry, type GemType } from '@/lib/storage';
import { cn } from '@/lib/utils';

const gemTypes: GemType[] = ['Emerald', 'Amethyst', 'Sapphire', 'Ruby'];

export const CollectTab = () => {
  const [sets, setSets] = useState<SetEntry[]>(getSets);
  const [showForm, setShowForm] = useState(false);
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
    setSets([newSet, ...sets]);
    setFormData({
      djName: '',
      venue: '',
      dateISO: new Date().toISOString().split('T')[0],
      notes: '',
      rating: 5,
      gemType: 'Emerald',
    });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteSet(id);
    setSets(sets.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Add button */}
      {!showForm && (
        <Button
          variant="neon"
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          <Plus className="w-5 h-5 mr-2" />
          Mine a Gem
        </Button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-5 rounded-2xl space-y-4 animate-scale-in">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            New Set Entry
          </h3>
          
          <Input
            placeholder="DJ / Artist Name"
            value={formData.djName}
            onChange={(e) => setFormData({ ...formData, djName: e.target.value })}
            required
          />
          
          <Input
            placeholder="Venue"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            required
          />
          
          <Input
            type="date"
            value={formData.dateISO}
            onChange={(e) => setFormData({ ...formData, dateISO: e.target.value })}
            required
          />
          
          <textarea
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full h-20 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
          
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
            <div className="flex gap-2 flex-wrap">
              {gemTypes.map((gem) => (
                <button
                  key={gem}
                  type="button"
                  onClick={() => setFormData({ ...formData, gemType: gem })}
                  className={cn(
                    'transition-all duration-200',
                    formData.gemType === gem ? 'scale-110' : 'opacity-50 hover:opacity-80'
                  )}
                >
                  <GemBadge type={gem} size="lg" showLabel />
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="glass" onClick={() => setShowForm(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="neon" className="flex-1">
              Save Gem
            </Button>
          </div>
        </form>
      )}

      {/* Sets list */}
      <div className="space-y-3">
        {sets.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center">
            <Music className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No gems collected yet.</p>
            <p className="text-sm text-muted-foreground/60">Add your first set to start your collection!</p>
          </div>
        ) : (
          sets.map((set, i) => (
            <div
              key={set.id}
              className="glass-card p-4 rounded-xl animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <GemBadge type={set.gemType} size="sm" />
                    <h4 className="font-semibold text-foreground truncate">{set.djName}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {set.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(set.dateISO).toLocaleDateString()}
                    </span>
                  </div>
                  <StarRating rating={set.rating} readonly size="sm" />
                  {set.notes && (
                    <p className="text-sm text-muted-foreground/80 mt-2 line-clamp-2">{set.notes}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(set.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
