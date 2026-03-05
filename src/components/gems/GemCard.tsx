import { memo } from 'react';
import { UserGem } from '@/hooks/useGemData';
import { format } from 'date-fns';

// ── Gem cut shapes (SVG) keyed by rarity tier ──────────────────────────────

function GemCutRaw({ color }: { color: string }) {
  // Rough, unpolished crystal — irregular polygon
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="raw-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="60%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="raw-shine" x1="0%" y1="0%" x2="60%" y2="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Rough crystal body */}
      <polygon
        points="32,4 52,18 58,38 46,58 18,58 8,40 12,18"
        fill="url(#raw-fill)"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.6"
      />
      {/* Internal cleavage lines */}
      <line x1="32" y1="4"  x2="28" y2="30" stroke={color} strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="12" y1="18" x2="36" y2="22" stroke={color} strokeWidth="0.5" strokeOpacity="0.3" />
      <line x1="52" y1="18" x2="30" y2="26" stroke={color} strokeWidth="0.5" strokeOpacity="0.3" />
      {/* Shine */}
      <polygon points="32,4 46,16 38,20 26,12" fill="url(#raw-shine)" />
    </svg>
  );
}

function GemCutCabochon({ color }: { color: string }) {
  // Smooth dome — oval with gradient suggesting depth
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="cab-fill" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="60%" stopColor={color} stopOpacity="0.65" />
          <stop offset="100%" stopColor={color} stopOpacity="0.25" />
        </radialGradient>
        <radialGradient id="cab-shine" cx="35%" cy="30%" r="40%">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Base flat girdle */}
      <ellipse cx="32" cy="50" rx="22" ry="5" fill={color} fillOpacity="0.2" />
      {/* Dome body */}
      <ellipse cx="32" cy="32" rx="22" ry="26" fill="url(#cab-fill)" stroke={color} strokeWidth="0.8" strokeOpacity="0.5" />
      {/* Highlight */}
      <ellipse cx="32" cy="32" rx="22" ry="26" fill="url(#cab-shine)" />
    </svg>
  );
}

function GemCutBrilliant({ color }: { color: string }) {
  // Classic brilliant-cut diamond — round with radiating facets
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="brill-fill" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="50%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* Table (top octagon) */}
      <polygon
        points="32,4 52,16 58,38 46,58 18,58 8,38 14,16"
        fill="url(#brill-fill)"
        stroke={color}
        strokeWidth="0.8"
        strokeOpacity="0.7"
      />
      {/* Table facet */}
      <polygon points="32,12 46,20 50,36 40,50 24,50 16,36 20,20" fill={color} fillOpacity="0.15" />
      {/* Star facets */}
      {[0, 51.4, 102.8, 154.2, 205.6, 257, 308.4].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const ox = 32 + 20 * Math.sin(rad);
        const oy = 32 - 20 * Math.cos(rad);
        return (
          <line key={i} x1="32" y1="32" x2={ox} y2={oy} stroke="white" strokeWidth="0.4" strokeOpacity="0.25" />
        );
      })}
      {/* Crown shine */}
      <polygon points="32,4 42,14 32,16 24,14" fill="white" fillOpacity="0.45" />
    </svg>
  );
}

function GemCutEmerald({ color }: { color: string }) {
  // Emerald cut — rectangular with stepped corner cuts
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="em-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="50%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Outer outline — octagonal rectangle */}
      <polygon
        points="16,4 48,4 60,16 60,48 48,60 16,60 4,48 4,16"
        fill="url(#em-fill)"
        stroke={color}
        strokeWidth="0.8"
        strokeOpacity="0.7"
      />
      {/* Step 1 */}
      <polygon points="20,10 44,10 54,20 54,44 44,54 20,54 10,44 10,20"
        fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.4" />
      {/* Step 2 (table) */}
      <polygon points="24,16 40,16 48,24 48,40 40,48 24,48 16,40 16,24"
        fill={color} fillOpacity="0.12" stroke={color} strokeWidth="0.4" strokeOpacity="0.5" />
      {/* Long axis shine */}
      <line x1="16" y1="32" x2="48" y2="32" stroke="white" strokeWidth="0.4" strokeOpacity="0.2" />
      <polygon points="16,4 48,4 44,10 20,10" fill="white" fillOpacity="0.3" />
    </svg>
  );
}

function GemCutMarquise({ color }: { color: string }) {
  // Marquise / navette — dramatic pointed oval
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="mq-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="55%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </radialGradient>
        <filter id="mq-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Outer pointed oval */}
      <path
        d="M32 4 C52 16, 60 24, 60 32 C60 40, 52 48, 32 60 C12 48, 4 40, 4 32 C4 24, 12 16, 32 4 Z"
        fill="url(#mq-fill)"
        stroke={color}
        strokeWidth="0.8"
        strokeOpacity="0.7"
        filter="url(#mq-glow)"
      />
      {/* Inner table */}
      <path
        d="M32 12 C46 20, 52 26, 52 32 C52 38, 46 44, 32 52 C18 44, 12 38, 12 32 C12 26, 18 20, 32 12 Z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="0.4"
        strokeOpacity="0.5"
      />
      {/* Radial facets */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const ox = 32 + 18 * Math.sin(rad);
        const oy = 32 - 18 * Math.cos(rad);
        return (
          <line key={i} x1="32" y1="32" x2={ox} y2={oy} stroke="white" strokeWidth="0.4" strokeOpacity="0.2" />
        );
      })}
      {/* Crown flash */}
      <path d="M32 4 C38 10, 44 14, 44 18 L32 16 L20 18 C20 14, 26 10, 32 4 Z"
        fill="white" fillOpacity="0.4" />
    </svg>
  );
}

// ── Rarity → visual config ────────────────────────────────────────────────

type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Mythic';

interface RarityConfig {
  label: string;
  textClass: string;
  borderColor: string;
  GemShape: React.FC<{ color: string }>;
}

const RARITY_CONFIG: Record<string, RarityConfig> = {
  Common: {
    label: 'Raw',
    textClass: 'rarity-common',
    borderColor: 'rgba(255,255,255,0.06)',
    GemShape: GemCutRaw,
  },
  Uncommon: {
    label: 'Cabochon',
    textClass: 'rarity-uncommon',
    borderColor: 'hsl(145 75% 55% / 0.25)',
    GemShape: GemCutCabochon,
  },
  Rare: {
    label: 'Brilliant',
    textClass: 'rarity-rare',
    borderColor: 'hsl(217 91% 60% / 0.35)',
    GemShape: GemCutBrilliant,
  },
  Legendary: {
    label: 'Emerald Cut',
    textClass: 'rarity-legendary',
    borderColor: 'hsl(38 92% 55% / 0.45)',
    GemShape: GemCutEmerald,
  },
  Mythic: {
    label: 'Marquise',
    textClass: 'rarity-mythic',
    borderColor: 'hsl(280 95% 60% / 0.55)',
    GemShape: GemCutMarquise,
  },
};

function getRarityConfig(tier?: string | null): RarityConfig {
  if (tier && tier in RARITY_CONFIG) return RARITY_CONFIG[tier];
  return RARITY_CONFIG.Common;
}

// ── Facet dot row ─────────────────────────────────────────────────────────

function FacetDots({ label, value }: { label: string; value: number | null }) {
  const filled = Math.round((value ?? 0) / 20); // 0–100 → 0–5 dots
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-white/40 w-14 shrink-0 leading-none">{label}</span>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i < filled ? 'bg-white/70' : 'bg-white/12'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main GemCard ──────────────────────────────────────────────────────────

interface GemCardProps {
  gem: UserGem;
  onClick?: (gem: UserGem) => void;
  compact?: boolean; // 2-col grid mode
}

function GemCard({ gem, onClick, compact = false }: GemCardProps) {
  const rarity = getRarityConfig(gem.rarity_tier);
  const { GemShape } = rarity;

  // Determine gem color from genre hex
  const gemColor = gem.genre?.color_hex ?? '#6ee7b7';

  const djName = gem.dj?.stage_name ?? 'Unknown Artist';
  const genreName = gem.genre?.name ?? 'Unknown Genre';
  const venueName = gem.venue?.name;

  const dateStr = gem.event_date
    ? format(new Date(gem.event_date), 'MMM d, yyyy')
    : null;

  const hasRatings = gem.is_rated && gem.facet_ratings;

  return (
    <button
      onClick={() => onClick?.(gem)}
      className={`
        glass-card w-full text-left
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-xl
        active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
        ${compact ? 'p-3' : 'p-4'}
      `}
      style={{ borderColor: rarity.borderColor }}
    >
      <div className={`flex gap-3 ${compact ? 'items-center' : 'items-start'}`}>
        {/* Gem cut icon */}
        <div
          className={`
            shrink-0 relative
            ${compact ? 'w-10 h-10' : 'w-14 h-14'}
          `}
        >
          {/* Ambient glow behind gem */}
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-40"
            style={{ backgroundColor: gemColor }}
          />
          <GemShape color={gemColor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: DJ + genesis badge */}
          <div className="flex items-start justify-between gap-1 mb-1">
            <p
              className="font-display font-semibold text-white leading-tight truncate"
              style={{ fontSize: compact ? '0.8rem' : '0.95rem' }}
            >
              {djName}
            </p>

            <div className="flex items-center gap-1 shrink-0">
              {gem.is_genesis_mint && (
                <span className="text-[9px] font-semibold font-display uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/25">
                  Genesis
                </span>
              )}
              {gem.mint_number && (
                <span className="text-[9px] text-white/35 font-mono">
                  #{gem.mint_number}
                </span>
              )}
            </div>
          </div>

          {/* Genre tag */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: gemColor + '22',
                borderColor: gemColor + '55',
                color: gemColor,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: gemColor }}
              />
              {genreName}
            </span>

            <span className={`text-[10px] font-display font-semibold uppercase tracking-wide ${rarity.textClass}`}>
              {rarity.label}
            </span>
          </div>

          {/* Meta: venue + date */}
          {!compact && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-2">
              {venueName && (
                <span className="text-[11px] text-white/50 truncate">
                  📍 {venueName}
                </span>
              )}
              {dateStr && (
                <span className="text-[11px] text-white/35">
                  {dateStr}
                </span>
              )}
            </div>
          )}

          {/* Facet dots — only in full mode if rated */}
          {!compact && hasRatings && (
            <div className="grid grid-cols-2 gap-y-1 mt-1.5">
              <FacetDots label="Sound"   value={gem.facet_ratings.sound_quality} />
              <FacetDots label="Energy"  value={gem.facet_ratings.energy} />
              <FacetDots label="Perform" value={gem.facet_ratings.performance} />
              <FacetDots label="Crowd"   value={gem.facet_ratings.crowd} />
            </div>
          )}

          {/* Compact: just venue + date inline */}
          {compact && (
            <p className="text-[10px] text-white/40 truncate">
              {[venueName, dateStr].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export default memo(GemCard);
export { RARITY_CONFIG, getRarityConfig };
export type { RarityTier };
