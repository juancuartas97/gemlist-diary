import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateGoal, CreateGoalParams } from '@/hooks/useUserGoals';
import { useDJSearch, useVenueSearch, useEventSearch } from '@/hooks/useGemData';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Target, User, MapPin } from 'lucide-react';

interface AddGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddGoalModal = ({ open, onOpenChange }: AddGoalModalProps) => {
  const { user } = useAuth();
  const createGoal = useCreateGoal();

  const [activeTab, setActiveTab] = useState<'event' | 'artist' | 'venue'>('event');
  
  // Event goal state
  const [eventQuery, setEventQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; name: string } | null>(null);
  const [targetDate, setTargetDate] = useState('');
  
  // Artist goal state
  const [artistQuery, setArtistQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<{ id: string; name: string } | null>(null);
  
  // Venue goal state
  const [venueQuery, setVenueQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<{ id: string; name: string } | null>(null);

  const { events, loading: eventsLoading } = useEventSearch(eventQuery);
  const { djs, loading: djsLoading } = useDJSearch(artistQuery);
  const { venues, loading: venuesLoading } = useVenueSearch(venueQuery);

  const handleSubmit = () => {
    if (!user?.id) return;

    let goalParams: CreateGoalParams;

    switch (activeTab) {
      case 'event':
        if (!eventQuery.trim()) return;
        goalParams = {
          goal_type: 'target_event',
          reference_id: selectedEvent?.id,
          reference_name: selectedEvent?.name || eventQuery,
          target_date: targetDate || undefined,
        };
        break;
      case 'artist':
        if (!selectedArtist && !artistQuery.trim()) return;
        goalParams = {
          goal_type: 'holy_grail_artist',
          reference_id: selectedArtist?.id,
          reference_name: selectedArtist?.name || artistQuery,
        };
        break;
      case 'venue':
        if (!selectedVenue && !venueQuery.trim()) return;
        goalParams = {
          goal_type: 'holy_grail_venue',
          reference_id: selectedVenue?.id,
          reference_name: selectedVenue?.name || venueQuery,
        };
        break;
    }

    createGoal.mutate(
      { userId: user.id, goal: goalParams },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setEventQuery('');
    setSelectedEvent(null);
    setTargetDate('');
    setArtistQuery('');
    setSelectedArtist(null);
    setVenueQuery('');
    setSelectedVenue(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Add New Quest
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="event" className="flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              Event
            </TabsTrigger>
            <TabsTrigger value="artist" className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Artist
            </TabsTrigger>
            <TabsTrigger value="venue" className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              Venue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="event" className="space-y-4">
            <div>
              <Label>Target Event</Label>
              <AutocompleteInput
                value={eventQuery}
                onChange={setEventQuery}
                placeholder="Search or type event name..."
                options={events?.map(e => ({ id: e.id, label: e.title })) || []}
                loading={eventsLoading}
                onSelect={(item) => {
                  setSelectedEvent({ id: item.id, name: item.label });
                  setEventQuery(item.label);
                }}
              />
            </div>
            <div>
              <Label>Event Date (optional)</Label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Set a date for countdown tracking
              </p>
            </div>
          </TabsContent>

          <TabsContent value="artist" className="space-y-4">
            <div>
              <Label>Holy Grail Artist</Label>
              <AutocompleteInput
                value={artistQuery}
                onChange={setArtistQuery}
                placeholder="Search artist..."
                options={djs?.map(d => ({ id: d.id, label: d.stage_name })) || []}
                loading={djsLoading}
                onSelect={(item) => {
                  setSelectedArtist({ id: item.id, name: item.label });
                  setArtistQuery(item.label);
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get notified when they play nearby
              </p>
            </div>
          </TabsContent>

          <TabsContent value="venue" className="space-y-4">
            <div>
              <Label>Holy Grail Venue</Label>
              <AutocompleteInput
                value={venueQuery}
                onChange={setVenueQuery}
                placeholder="Search venue..."
                options={venues?.map(v => ({ id: v.id, label: `${v.name}, ${v.city}` })) || []}
                loading={venuesLoading}
                onSelect={(item) => {
                  setSelectedVenue({ id: item.id, name: item.label });
                  setVenueQuery(item.label);
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                A venue on your bucket list
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={createGoal.isPending}
          >
            {createGoal.isPending ? 'Adding...' : 'Add Quest'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
