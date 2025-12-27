import { parseGemDNA, formatDateCode, getRarityFromCode, getModifierInfos } from '@/hooks/useGemDNA';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GemDNADisplayProps {
  dna: string | null | undefined;
  className?: string;
  compact?: boolean;
}

export const GemDNADisplay = ({ dna, className, compact = false }: GemDNADisplayProps) => {
  const parsed = parseGemDNA(dna);
  
  if (!parsed) {
    return null;
  }
  
  const rarity = getRarityFromCode(parsed.rarityCode);
  const modifiers = getModifierInfos(parsed.modifiers);
  
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background/50 border border-border/30 font-mono text-[10px] text-muted-foreground cursor-help",
              className
            )}>
              <span className="opacity-60">#</span>
              <span>{parsed.fullDNA}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1 text-xs">
              <div><span className="text-muted-foreground">Artist:</span> {parsed.artistCode}</div>
              <div><span className="text-muted-foreground">Venue:</span> {parsed.venueCode}</div>
              <div><span className="text-muted-foreground">Date:</span> {formatDateCode(parsed.dateCode)}</div>
              <div><span className="text-muted-foreground">Rarity:</span> {rarity.emoji} {rarity.label}</div>
              <div><span className="text-muted-foreground">Mint:</span> #{parsed.mintNumber}</div>
              {modifiers.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Modifiers:</span>{' '}
                  {modifiers.map(m => `${m.emoji} ${m.name}`).join(', ')}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* DNA Header */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
          Gem DNA
        </span>
      </div>
      
      {/* Full DNA String */}
      <div className="relative overflow-hidden rounded-lg bg-background/30 border border-border/30 p-3">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <code className="relative font-mono text-sm text-foreground tracking-wider">
          {parsed.fullDNA}
        </code>
      </div>
      
      {/* DNA Breakdown */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="space-y-0.5">
          <div className="text-muted-foreground/60 uppercase tracking-wider text-[10px]">Artist</div>
          <div className="font-mono font-medium">{parsed.artistCode}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-muted-foreground/60 uppercase tracking-wider text-[10px]">Venue</div>
          <div className="font-mono font-medium">{parsed.venueCode}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-muted-foreground/60 uppercase tracking-wider text-[10px]">Date</div>
          <div className="font-mono font-medium">{formatDateCode(parsed.dateCode)}</div>
        </div>
      </div>
      
      {/* Rarity & Mint */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-background/20 border border-border/20">
        <div className="flex items-center gap-2">
          <span className="text-lg">{rarity.emoji}</span>
          <span className="text-sm font-medium" style={{ color: rarity.color }}>
            {rarity.label}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Mint <span className="font-mono font-medium text-foreground">#{parsed.mintNumber}</span>
        </div>
      </div>
      
      {/* Modifiers */}
      {modifiers.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
            Modifiers
          </div>
          <div className="flex flex-wrap gap-2">
            {modifiers.map((mod) => (
              <TooltipProvider key={mod.code}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium cursor-help"
                      style={{ 
                        backgroundColor: `${mod.color}20`,
                        border: `1px solid ${mod.color}40`,
                        color: mod.color,
                      }}
                    >
                      <span>{mod.emoji}</span>
                      <span>{mod.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{mod.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
