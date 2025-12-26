import { useState } from 'react';
import { format } from 'date-fns';
import { X, MapPin, Calendar, Music, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FacetRatingsGroup } from '@/components/FacetRating';
import { type UserGem, type FacetRatings } from '@/hooks/useGemData';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface GemDetailModalProps {
  gem: UserGem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGemDeleted?: () => void;
  onGemUpdated?: () => void;
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 30, g: 140, b: 106 };
};

const adjustColor = (hex: string, amount: number) => {
  const rgb = hexToRgb(hex);
  const adjust = (c: number) => Math.max(0, Math.min(255, c + amount));
  return `rgb(${adjust(rgb.r)}, ${adjust(rgb.g)}, ${adjust(rgb.b)})`;
};

export const GemDetailModal = ({ 
  gem, 
  open, 
  onOpenChange,
  onGemDeleted,
  onGemUpdated,
}: GemDetailModalProps) => {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedNote, setEditedNote] = useState('');
  const [editedRatings, setEditedRatings] = useState<FacetRatings>({
    sound_quality: null,
    energy: null,
    performance: null,
    crowd: null,
  });

  if (!gem) return null;

  const baseColor = gem.genre?.color_hex || '#1E8C6A';
  const djName = gem.dj?.stage_name || 'Unknown Artist';
  const genreName = gem.genre?.name || 'Unknown Genre';
  const venueName = gem.venue?.name || 'Unknown Venue';
  const venueLocation = gem.venue ? `${gem.venue.city}${gem.venue.state ? `, ${gem.venue.state}` : ''}, ${gem.venue.country}` : '';
  const eventDate = format(new Date(gem.event_date), 'MMMM d, yyyy');

  const handleStartEdit = () => {
    setEditedNote(gem.private_note || '');
    setEditedRatings(gem.facet_ratings);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedNote('');
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    
    const { error } = await supabase
      .from('user_gems')
      .update({
        private_note: editedNote || null,
        facet_ratings: editedRatings as unknown as Json,
        is_rated: Object.values(editedRatings).some(v => v !== null),
      })
      .eq('id', gem.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update gem",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Gem Updated",
        description: "Your gem has been updated successfully",
      });
      setIsEditing(false);
      onGemUpdated?.();
    }
    
    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    const { error } = await supabase
      .from('user_gems')
      .delete()
      .eq('id', gem.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete gem",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Gem Deleted",
        description: "The gem has been removed from your collection",
      });
      onOpenChange(false);
      onGemDeleted?.();
    }
    
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleRatingChange = (category: string, value: number) => {
    setEditedRatings(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 transition-all duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          onClick={() => !isEditing && onOpenChange(false)}
        />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col">
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-6 h-6" />
            </Button>
            
            <div className="flex gap-2">
              {!isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleStartEdit}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Gem Visual */}
            <div className="relative h-64 flex items-center justify-center mb-4">
              {/* Large glow */}
              <div 
                className="absolute w-64 h-64 blur-3xl opacity-40"
                style={{ 
                  background: `radial-gradient(circle, ${baseColor} 0%, transparent 70%)`,
                }}
              />
              
              {/* Large Diamond SVG */}
              <svg 
                viewBox="0 0 100 85" 
                className="w-40 h-40 relative z-10"
                style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.6))' }}
              >
                <defs>
                  <linearGradient id="detail-body" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={adjustColor(baseColor, 60)} stopOpacity="0.9" />
                    <stop offset="30%" stopColor={baseColor} stopOpacity="0.85" />
                    <stop offset="70%" stopColor={adjustColor(baseColor, -40)} stopOpacity="0.95" />
                    <stop offset="100%" stopColor={baseColor} stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="detail-crown" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                    <stop offset="40%" stopColor={adjustColor(baseColor, 60)} stopOpacity="0.7" />
                    <stop offset="100%" stopColor={baseColor} stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="detail-pavilion" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor={baseColor} stopOpacity="0.95" />
                    <stop offset="50%" stopColor={adjustColor(baseColor, -40)} stopOpacity="1" />
                    <stop offset="100%" stopColor={adjustColor(baseColor, -40)} stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Crown facets */}
                <polygon points="30,20 70,20 65,28 35,28" fill="url(#detail-crown)" stroke="white" strokeOpacity="0.2" strokeWidth="0.5" />
                <polygon points="30,20 35,28 25,32 15,25" fill={adjustColor(baseColor, 60)} fillOpacity="0.8" stroke="white" strokeOpacity="0.15" strokeWidth="0.3" />
                <polygon points="70,20 85,25 75,32 65,28" fill={baseColor} fillOpacity="0.7" stroke="white" strokeOpacity="0.15" strokeWidth="0.3" />
                <polygon points="15,25 25,32 20,38 5,32" fill={baseColor} fillOpacity="0.85" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
                <polygon points="85,25 95,32 80,38 75,32" fill={adjustColor(baseColor, -40)} fillOpacity="0.9" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
                <polygon points="25,32 35,28 40,38 20,38" fill="url(#detail-body)" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
                <polygon points="35,28 50,30 55,38 40,38" fill={adjustColor(baseColor, 60)} fillOpacity="0.75" stroke="white" strokeOpacity="0.15" strokeWidth="0.3" />
                <polygon points="50,30 65,28 60,38 55,38" fill={baseColor} fillOpacity="0.8" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
                <polygon points="65,28 75,32 80,38 60,38" fill={adjustColor(baseColor, -40)} fillOpacity="0.85" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />

                {/* Girdle */}
                <polygon points="5,32 20,38 40,38 55,38 60,38 80,38 95,32 80,40 60,42 55,42 40,42 20,40" fill={baseColor} fillOpacity="0.95" stroke="white" strokeOpacity="0.2" strokeWidth="0.5" />

                {/* Pavilion */}
                <polygon points="5,32 20,40 50,85" fill={baseColor} fillOpacity="0.9" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
                <polygon points="20,40 40,42 50,85" fill="url(#detail-pavilion)" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
                <polygon points="40,42 55,42 50,85" fill={adjustColor(baseColor, -40)} fillOpacity="0.95" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
                <polygon points="55,42 60,42 50,85" fill={baseColor} fillOpacity="0.85" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
                <polygon points="60,42 80,40 50,85" fill={adjustColor(baseColor, -40)} fillOpacity="0.9" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
                <polygon points="80,40 95,32 50,85" fill={baseColor} fillOpacity="0.8" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />

                {/* Highlights */}
                <polygon points="32,21 45,21 42,26 34,26" fill="white" fillOpacity="0.6" />
                <polygon points="33,22 40,22 38,25 35,25" fill="white" fillOpacity="0.8" />
                <circle cx="38" cy="24" r="1.5" fill="white" fillOpacity="0.9">
                  <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>

            {/* Info Section */}
            <div className="px-6 pb-8 space-y-6">
              {/* Artist Name */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">{djName}</h2>
                <div 
                  className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full"
                  style={{ 
                    background: `${baseColor}20`,
                    border: `1px solid ${baseColor}40`,
                  }}
                >
                  <Music className="w-3 h-3" style={{ color: baseColor }} />
                  <span className="text-sm font-medium" style={{ color: baseColor }}>
                    {genreName}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{eventDate}</span>
                </div>
                {gem.venue && (
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground">{venueName}</p>
                      <p className="text-xs text-muted-foreground">{venueLocation}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-border/30" />

              {/* Facet Ratings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
                  Experience Rating
                </h3>
                <FacetRatingsGroup
                  ratings={isEditing ? editedRatings : gem.facet_ratings}
                  onChange={isEditing ? handleRatingChange : undefined}
                  readonly={!isEditing}
                />
              </div>

              {/* Private Note */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
                  Private Notes
                </h3>
                {isEditing ? (
                  <Textarea
                    value={editedNote}
                    onChange={(e) => setEditedNote(e.target.value)}
                    placeholder="Add your personal notes about this experience..."
                    className="min-h-[100px] bg-background/50 border-border/30 resize-none"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {gem.private_note || 'No notes added yet'}
                  </p>
                )}
              </div>

              {/* Edit Actions */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}

              {/* Collected Date */}
              <div className="pt-4 text-center">
                <p className="text-xs text-muted-foreground/50">
                  Collected on {format(new Date(gem.collected_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this gem?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-semibold text-foreground">{djName}</span> from your collection. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Gem'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
