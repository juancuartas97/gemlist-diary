import { useState, useEffect, useCallback } from 'react';
import {
  ListMusic, Upload, FileText, Check, ChevronLeft, ChevronRight,
  Loader2, CheckSquare, Square, Sparkles, X, ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { useAuth } from '@/hooks/useAuth';
import { useGenres, addDJ, addUserGem, type Genre, type DJ } from '@/hooks/useGemData';
import {
  useEventSeriesSearch,
  getEditionForYear,
  addEventSeries,
  addEventEdition,
  type EventSeries,
  type EventEdition,
} from '@/hooks/useEventSeries';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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

interface FestivalLineupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGemsAdded: () => void;
}

interface EnrichedArtist {
  originalName: string;
  stage_name: string;
  genre: string;
  home_city: string | null;
  confidence: string;
  matchedDJ: DJ | null;
  matchedGenre: Genre | null;
  resolvedGenreId: string | null;
  enriching: boolean;
  enriched: boolean;
  selected: boolean;
}

type WizardStep = 'info' | 'lineup' | 'select' | 'confirm';

export const FestivalLineupModal = ({ open, onOpenChange, onGemsAdded }: FestivalLineupModalProps) => {
  const { user } = useAuth();
  const { genres } = useGenres();

  // Step 1 – Festival Info
  const [seriesQuery, setSeriesQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<EventSeries | null>(null);
  const [manualName, setManualName] = useState('');
  const [festivalDate, setFestivalDate] = useState('');
  const { series: seriesResults, loading: seriesLoading } = useEventSeriesSearch(seriesQuery);

  // Step 2 – Lineup Input
  const [textLineup, setTextLineup] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  // Step 3 – Artist Selection
  const [artists, setArtists] = useState<EnrichedArtist[]>([]);

  // Step 4 – Confirm
  const [submitting, setSubmitting] = useState(false);

  // Wizard navigation
  const [step, setStep] = useState<WizardStep>('info');

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep('info');
      setSeriesQuery('');
      setSelectedSeries(null);
      setManualName('');
      setFestivalDate('');
      setTextLineup('');
      setImageFile(null);
      setImagePreview(null);
      setParsing(false);
      setArtists([]);
      setSubmitting(false);
    }
  }, [open]);

  const festivalName = selectedSeries?.name || manualName;
  const normalizedFestivalName = festivalName.trim().toLowerCase();
  const resolveGenreByName = useCallback((genreName: string) => {
    const normalizedGenreName = genreName.trim().toLowerCase();
    return genres.find((genre) => genre.name.trim().toLowerCase() === normalizedGenreName) || null;
  }, [genres]);

  // Step 1 helpers
  const handleSeriesSelect = (option: { id: string; label: string }) => {
    const s = seriesResults.find(sr => sr.id === option.id);
    if (s) {
      setSelectedSeries(s);
      setSeriesQuery(s.name);
    }
  };

  const handleCreateSeries = (name: string) => {
    setSelectedSeries(null);
    setManualName(name);
    setSeriesQuery(name);
  };

  const canProceedFromInfo = (festivalName.trim().length > 0) && festivalDate;

  // Step 2 helpers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleParseLineup = async () => {
    if (!imageFile && !textLineup.trim()) {
      toast.error('Please upload an image or paste a lineup');
      return;
    }

    setParsing(true);

    try {
      let payload: { image_base64?: string; text_lineup?: string } = {};

      if (imageFile) {
        const base64 = await fileToBase64(imageFile);
        payload.image_base64 = base64;
      } else {
        payload.text_lineup = textLineup.trim();
      }

      const { data, error } = await supabase.functions.invoke('parse-festival-lineup', {
        body: payload,
      });

      if (error) throw error;

      const parsedNames: string[] = data?.artists || [];

      if (parsedNames.length === 0) {
        toast.error('No artists found. Try a different image or text.');
        setParsing(false);
        return;
      }

      // Check existing DJs and build initial artist list
      const enrichedList: EnrichedArtist[] = [];

      for (const name of parsedNames) {
        // Check if artist already exists in DB
        const { data: existing } = await supabase
          .from('djs')
          .select('*, genre:genres(*)')
          .ilike('stage_name', name.trim())
          .limit(1);

        const matchedDJ = existing?.[0] as DJ | undefined;
        const matchedGenre = matchedDJ?.genre || null;

        enrichedList.push({
          originalName: name,
          stage_name: matchedDJ?.stage_name || name,
          genre: matchedGenre?.name || '',
          home_city: matchedDJ?.home_city || null,
          confidence: matchedDJ ? 'matched' : 'pending',
          matchedDJ: matchedDJ || null,
          matchedGenre: matchedGenre || null,
          resolvedGenreId: matchedDJ?.primary_genre_id || matchedGenre?.id || null,
          enriching: false,
          enriched: !!matchedDJ,
          selected: true,
        });
      }

      setArtists(enrichedList);
      setStep('select');

      // Auto-enrich unknown artists in background
      enrichUnknownArtists(enrichedList);
    } catch (err) {
      console.error('Parse error:', err);
      toast.error('Failed to parse lineup. Please try again.');
    }

    setParsing(false);
  };

  const enrichUnknownArtists = useCallback(async (list: EnrichedArtist[]) => {
    const unknowns = list.filter(a => !a.enriched);
    if (unknowns.length === 0) return;

    for (let i = 0; i < unknowns.length; i++) {
      const artist = unknowns[i];
      const idx = list.findIndex(a => a.originalName === artist.originalName);

      // Mark as enriching
      setArtists(prev => prev.map((a, j) => j === idx ? { ...a, enriching: true } : a));

      try {
        const { data, error } = await supabase.functions.invoke('enrich-artist', {
          body: { artist_name: artist.originalName },
        });

        if (!error && data) {
          // Match genre from genres table
          const matchedGenre = resolveGenreByName(data.genre || '');

          setArtists(prev => prev.map((a, j) =>
            j === idx
              ? {
                  ...a,
                  stage_name: data.stage_name || a.originalName,
                  genre: data.genre || '',
                  home_city: data.home_city || null,
                  confidence: data.confidence || 'low',
                  matchedGenre,
                  resolvedGenreId: matchedGenre?.id || null,
                  enriching: false,
                  enriched: true,
                }
              : a
          ));
        } else {
          setArtists(prev => prev.map((a, j) =>
            j === idx ? { ...a, enriching: false, enriched: true, confidence: 'low' } : a
          ));
        }
      } catch {
        setArtists(prev => prev.map((a, j) =>
          j === idx ? { ...a, enriching: false, enriched: true, confidence: 'low' } : a
        ));
      }

      // Small delay between enrichment calls to avoid rate limits
      if (i < unknowns.length - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    }
  }, [resolveGenreByName]);

  const setArtistGenre = (idx: number, genreId: string) => {
    const matchedGenre = genres.find((genre) => genre.id === genreId) || null;
    setArtists((prev) => prev.map((artist, index) => (
      index === idx
        ? {
            ...artist,
            matchedGenre,
            resolvedGenreId: genreId,
            genre: matchedGenre?.name || artist.genre,
          }
        : artist
    )));
  };

  const getArtistGenreId = (artist: EnrichedArtist) => (
    artist.matchedDJ?.primary_genre_id ||
    artist.matchedGenre?.id ||
    artist.resolvedGenreId
  );

  // Step 3 helpers
  const toggleArtist = (idx: number) => {
    setArtists(prev => prev.map((a, i) => i === idx ? { ...a, selected: !a.selected } : a));
  };

  const toggleAll = () => {
    const allSelected = artists.every(a => a.selected);
    setArtists(prev => prev.map(a => ({ ...a, selected: !allSelected })));
  };

  const selectedArtists = artists.filter((artist) => artist.selected);
  const selectedCount = selectedArtists.length;
  const selectedArtistsStillEnriching = selectedArtists.some((artist) => artist.enriching);
  const unresolvedSelectedArtists = selectedArtists.filter((artist) => !getArtistGenreId(artist));

  const resolveFestivalEdition = useCallback(async (): Promise<EventEdition | null> => {
    const trimmedFestivalName = festivalName.trim();
    if (!trimmedFestivalName) return null;

    const editionYear = new Date(`${festivalDate}T00:00:00`).getFullYear();
    let series = selectedSeries;

    if (!series) {
      const { data } = await supabase
        .from('event_series')
        .select(`
          *,
          default_venue:venues(*),
          genre:genres(*)
        `)
        .ilike('name', trimmedFestivalName);

      const existingSeries = (data as EventSeries[] | null)?.find(
        (item) => item.name.trim().toLowerCase() === normalizedFestivalName
      );

      if (existingSeries) {
        series = existingSeries;
      } else {
        series = await addEventSeries({
          name: trimmedFestivalName,
          first_year: editionYear,
        });
      }
    }

    if (!series) return null;

    const existingEdition = await getEditionForYear(series.id, editionYear);
    if (existingEdition) return existingEdition;

    return addEventEdition({
      series_id: series.id,
      year: editionYear,
      start_date: festivalDate,
      end_date: festivalDate,
    });
  }, [festivalDate, festivalName, normalizedFestivalName, selectedSeries]);

  // Step 4 – Submit
  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in');
      return;
    }

    if (selectedCount === 0) {
      toast.error('Select at least one artist');
      return;
    }

    if (selectedArtistsStillEnriching) {
      toast.error('Wait for artist enrichment to finish before continuing');
      setStep('select');
      return;
    }

    if (unresolvedSelectedArtists.length > 0) {
      toast.error('Select a genre for each new artist before collecting gems');
      setStep('select');
      return;
    }

    setSubmitting(true);

    try {
      const edition = await resolveFestivalEdition();
      if (!edition) {
        throw new Error('Unable to resolve festival edition');
      }

      const createdGems: string[] = [];

      for (const artist of selectedArtists) {
        let dj = artist.matchedDJ;
        const genreId = getArtistGenreId(artist);

        if (!genreId) {
          throw new Error(`Missing genre for ${artist.stage_name}`);
        }

        if (!dj) {
          dj = await addDJ(artist.stage_name, genreId);
        }

        if (!dj) continue;

        const gem = await addUserGem({
          user_id: user.id,
          dj_id: dj.id,
          primary_genre_id: genreId,
          event_date: festivalDate,
          edition_id: edition.id,
          facet_ratings: { sound_quality: null, energy: null, performance: null, crowd: null },
        });

        if (gem) {
          createdGems.push(gem.id);
        }
      }

      if (createdGems.length === 0) {
        throw new Error('Unable to create gems for the selected artists');
      }

      const badgeColors = ['purple', 'gold', 'blue', 'green', 'red', 'silver'];
      const badgeColor = badgeColors[Math.floor(Math.random() * badgeColors.length)];

      const { error: badgeError } = await supabase.from('user_festival_badges').insert({
        user_id: user.id,
        edition_id: edition.id,
        series_name: festivalName.trim(),
        festival_date: festivalDate,
        badge_color: badgeColor,
        artist_count: createdGems.length,
      });

      if (badgeError) {
        throw badgeError;
      }

      toast.success(`Added ${createdGems.length} gems + 1 festival badge!`);
      onGemsAdded();
      onOpenChange(false);
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Something went wrong while creating gems');
    }

    setSubmitting(false);
  };

  const stepIndex = { info: 0, lineup: 1, select: 2, confirm: 3 };
  const stepLabels = ['Festival Info', 'Lineup', 'Artists', 'Confirm'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border/30 max-w-md max-h-[85vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-violet-400/40 to-violet-600"
                 style={{ boxShadow: '0 0 10px rgba(139,92,246,0.5)' }} />
            Log a Festival
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 mb-2">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn(
                "h-1 w-full rounded-full transition-colors",
                i <= stepIndex[step] ? "bg-violet-500" : "bg-border/30"
              )} />
              <span className={cn(
                "text-[10px]",
                i === stepIndex[step] ? "text-violet-400 font-medium" : "text-muted-foreground/50"
              )}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1 – Festival Info */}
        {step === 'info' && (
          <div className="space-y-4 pt-2">
            <AutocompleteInput
              value={seriesQuery}
              onChange={(v) => {
                setSeriesQuery(v);
                if (v !== selectedSeries?.name) {
                  setSelectedSeries(null);
                  setManualName(v);
                }
              }}
              onSelect={handleSeriesSelect}
              onCreateNew={handleCreateSeries}
              options={seriesResults.map(s => ({
                id: s.id,
                label: s.name,
                sublabel: s.genre?.name || undefined,
              }))}
              loading={seriesLoading}
              placeholder="Festival name (e.g., EDC, Tomorrowland)"
              icon={<ListMusic className="w-4 h-4" />}
              createLabel="Use this name"
            />

            <Input
              type="date"
              value={festivalDate}
              onChange={(e) => setFestivalDate(e.target.value)}
              className="bg-background/50 border-border/30"
              required
            />

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="neon"
                className="flex-1"
                disabled={!canProceedFromInfo}
                onClick={() => setStep('lineup')}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2 – Lineup Input */}
        {step === 'lineup' && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Upload a photo of the lineup poster or paste the artist names.
            </p>

            {/* Two options side by side */}
            <div className="grid grid-cols-2 gap-3">
              {/* Upload Photo */}
              <label className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
                imageFile
                  ? "border-violet-500/50 bg-violet-500/5"
                  : "border-border/30 hover:border-violet-500/30 hover:bg-violet-500/5"
              )}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                {imagePreview ? (
                  <div className="relative w-full">
                    <img src={imagePreview} alt="Lineup" className="w-full h-20 object-cover rounded-lg" />
                    <button
                      onClick={(e) => { e.preventDefault(); removeImage(); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-violet-400/60" />
                    <span className="text-xs text-muted-foreground text-center">Upload Photo</span>
                  </>
                )}
              </label>

              {/* Paste Text */}
              <div className={cn(
                "flex flex-col gap-1 p-2 rounded-xl border-2 border-dashed transition-colors",
                textLineup.trim()
                  ? "border-violet-500/50 bg-violet-500/5"
                  : "border-border/30"
              )}>
                <div className="flex items-center gap-1 px-1">
                  <FileText className="w-3 h-3 text-violet-400/60" />
                  <span className="text-[10px] text-muted-foreground">Paste Text</span>
                </div>
                <textarea
                  value={textLineup}
                  onChange={(e) => setTextLineup(e.target.value)}
                  placeholder={"Skrillex\nDeadmau5\nZedd\n..."}
                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep('info')} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                variant="neon"
                className="flex-1"
                disabled={parsing || (!imageFile && !textLineup.trim())}
                onClick={handleParseLineup}
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Parsing lineup...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1" />
                    Parse Lineup
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 – Artist Selection */}
        {step === 'select' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedCount} of {artists.length} artists selected
              </p>
              <button
                onClick={toggleAll}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                {artists.every(a => a.selected) ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-[45vh] overflow-y-auto space-y-1.5 -mx-1 px-1">
              {artists.map((artist, idx) => (
                <div
                  key={artist.originalName + idx}
                  className={cn(
                    "rounded-xl border border-border/20 transition-all",
                    artist.selected
                      ? "bg-violet-500/10 border-violet-500/30"
                      : "bg-background/30 hover:bg-background/50"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleArtist(idx)}
                    className="w-full flex items-center gap-3 p-3 text-left"
                  >
                    {artist.selected ? (
                      <CheckSquare className="w-4 h-4 text-violet-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    )}

                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: artist.matchedGenre?.color_hex || '#6B7280',
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {artist.stage_name}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        {artist.enriching ? (
                          <span className="flex items-center gap-1 text-violet-400">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Enriching...
                          </span>
                        ) : (
                          <>
                            {artist.genre && <span>{artist.genre}</span>}
                            {artist.matchedDJ && (
                              <span className="text-emerald-400 flex items-center gap-0.5">
                                <Check className="w-3 h-3" />
                                Matched
                              </span>
                            )}
                            {!artist.matchedDJ && artist.enriched && (
                              <span className="text-amber-400">New</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  {artist.selected && !artist.enriching && !getArtistGenreId(artist) && (
                    <div className="px-3 pb-3">
                      <p className="mb-2 text-[11px] text-amber-300/80">
                        Confirm a genre for this artist before importing.
                      </p>
                      <Select
                        value={artist.resolvedGenreId || ''}
                        onValueChange={(value) => setArtistGenre(idx, value)}
                      >
                        <SelectTrigger className="bg-background/50 border-border/30">
                          <SelectValue placeholder={artist.genre ? `Suggested: ${artist.genre}` : 'Select a genre'} />
                        </SelectTrigger>
                        <SelectContent>
                          {genres.map((genre) => (
                            <SelectItem key={genre.id} value={genre.id}>
                              {genre.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedArtistsStillEnriching && (
              <p className="text-[11px] text-muted-foreground">
                Wait for AI enrichment to finish before continuing.
              </p>
            )}

            {unresolvedSelectedArtists.length > 0 && (
              <p className="text-[11px] text-amber-300/80">
                Choose a genre for each new artist before reviewing the import.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep('lineup')} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                variant="neon"
                className="flex-1"
                disabled={selectedCount === 0 || selectedArtistsStillEnriching || unresolvedSelectedArtists.length > 0}
                onClick={() => setStep('confirm')}
              >
                Review
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4 – Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-background/30 border border-border/20 space-y-3">
              <h3 className="font-semibold text-foreground">{festivalName}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(festivalDate + 'T00:00:00').toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{selectedCount}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Gems</div>
                  </div>
                </div>

                <div className="text-muted-foreground/30 text-lg">+</div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <ListMusic className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">1</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Badge</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Artist list summary */}
            <div className="max-h-[25vh] overflow-y-auto space-y-1">
              {artists.filter(a => a.selected).map((artist, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        genres.find((genre) => genre.id === getArtistGenreId(artist))?.color_hex || '#6B7280',
                    }}
                  />
                  <span className="truncate">{artist.stage_name}</span>
                  {artist.matchedDJ && (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-auto" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep('select')} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                variant="neon"
                className="flex-1"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating gems...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1" />
                    Collect {selectedCount} Gems
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Helper: convert File to base64 string (without data URI prefix)
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
