import { useMemo } from 'react';
import { Music2, MapPin, Calendar, Activity, Gem, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserGems } from '@/hooks/useGemData';

// ── SVG Radar chart (4 axes: Sound, Energy, Performance, Crowd) ────────────

const FACETS = [
  { key: 'sound_quality', label: 'Sound'   },
  { key: 'energy',        label: 'Energy'  },
  { key: 'performance',   label: 'Perform' },
  { key: 'crowd',         label: 'Crowd'   },
] as const;

type FacetKey = typeof FACETS[number]['key'];

function RadarChart({ averages }: { averages: Record<FacetKey, number> }) {
  const size    = 180;
  const cx      = size / 2;
  const cy      = size / 2;
  const maxR    = 68;

  // 4 axes, starting at top, clockwise
  const angles = FACETS.map((_, i) => (i * 360) / FACETS.length - 90);

  const polarToXY = (angle: number, r: number) => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  });

  // Grid levels
  const levels = [0.25, 0.5, 0.75, 1];

  const gridPolygon = (ratio: number) =>
    angles
      .map(a => {
        const p = polarToXY(a, maxR * ratio);
        return `${p.x},${p.y}`;
      })
      .join(' ');

  // Data polygon — normalize 0-100 → 0-1
  const dataPolygon = FACETS.map(f => {
    const val = (averages[f.key] ?? 0) / 100;
    const p = polarToXY(angles[FACETS.indexOf(f)], maxR * Math.max(0.02, val));
    return `${p.x},${p.y}`;
  }).join(' ');

  // Axis endpoints for labels
  const axisPoints = FACETS.map((f, i) => ({
    ...polarToXY(angles[i], maxR + 18),
    label: f.label,
    value: Math.round(averages[f.key] ?? 0),
  }));

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id="radar-fill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(145 75% 55%)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="hsl(280 95% 60%)" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* Background grid */}
      {levels.map(ratio => (
        <polygon
          key={ratio}
          points={gridPolygon(ratio)}
          fill="none"
          stroke="white"
          strokeOpacity={ratio === 1 ? 0.12 : 0.06}
          strokeWidth={ratio === 1 ? 0.8 : 0.5}
        />
      ))}

      {/* Axis lines */}
      {FACETS.map((_, i) => {
        const end = polarToXY(angles[i], maxR);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke="white"
            strokeOpacity="0.08"
            strokeWidth="0.7"
          />
        );
      })}

      {/* Data fill */}
      <polygon
        points={dataPolygon}
        fill="url(#radar-fill-grad)"
        stroke="hsl(145 75% 65%)"
        strokeWidth="1.5"
        strokeOpacity="0.7"
      />

      {/* Data dots */}
      {FACETS.map((f, i) => {
        const val = (averages[f.key] ?? 0) / 100;
        const p   = polarToXY(angles[i], maxR * Math.max(0.02, val));
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="hsl(145 75% 65%)"
            fillOpacity={0.9}
          />
        );
      })}

      {/* Axis labels */}
      {axisPoints.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fill="white"
          fillOpacity="0.5"
          fontFamily="Inter, sans-serif"
        >
          {p.label}
        </text>
      ))}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={2} fill="white" fillOpacity="0.15" />
    </svg>
  );
}

// ── Stat chip ───────────────────────────────────────────────────────────────

function StatChip({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="glass-card flex-1 p-3 text-center">
      <Icon className="w-4 h-4 mx-auto mb-1.5 text-white/40" />
      <p
        className="font-display font-bold text-white text-lg leading-none mb-0.5"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      <p className="text-[9px] text-white/35 uppercase tracking-wide">{label}</p>
    </div>
  );
}

// ── Main tab ─────────────────────────────────────────────────────────────────

export const TasteMapTab = () => {
  const { user } = useAuth();
  const { gems, loading } = useUserGems(user?.id);

  const stats = useMemo(() => {
    if (!gems.length) {
      return null;
    }

    const total = gems.length;

    // ── Facet averages (only from rated gems) ─────────────────────────────
    const ratedGems = gems.filter(g => g.is_rated && g.facet_ratings);

    const facetAverages: Record<FacetKey, number> = {
      sound_quality: 0,
      energy:        0,
      performance:   0,
      crowd:         0,
    };

    if (ratedGems.length > 0) {
      FACETS.forEach(f => {
        const sum = ratedGems.reduce((acc, g) => acc + (g.facet_ratings[f.key] ?? 0), 0);
        facetAverages[f.key] = sum / ratedGems.length;
      });
    }

    // ── Genre breakdown ──────────────────────────────────────────────────
    const genreCounts: Record<string, { count: number; color: string }> = {};
    gems.forEach(g => {
      const name  = g.genre?.name ?? 'Unknown';
      const color = g.genre?.color_hex ?? '#6ee7b7';
      if (!genreCounts[name]) genreCounts[name] = { count: 0, color };
      genreCounts[name].count++;
    });

    const genreList = Object.entries(genreCounts)
      .map(([name, { count, color }]) => ({
        name,
        color,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // ── Other metrics ──────────────────────────────────────────────────
    const uniqueArtists = new Set(gems.map(g => g.dj_id)).size;
    const uniqueVenues  = new Set(gems.map(g => g.venue_id).filter(Boolean)).size;

    // Most visited venue
    const venueCounts: Record<string, { name: string; count: number }> = {};
    gems.forEach(g => {
      if (g.venue_id && g.venue?.name) {
        if (!venueCounts[g.venue_id]) venueCounts[g.venue_id] = { name: g.venue.name, count: 0 };
        venueCounts[g.venue_id].count++;
      }
    });
    const topVenue = Object.values(venueCounts).sort((a, b) => b.count - a.count)[0] ?? null;

    // Most collected artist
    const artistCounts: Record<string, { name: string; count: number }> = {};
    gems.forEach(g => {
      if (g.dj_id && g.dj?.stage_name) {
        if (!artistCounts[g.dj_id]) artistCounts[g.dj_id] = { name: g.dj.stage_name, count: 0 };
        artistCounts[g.dj_id].count++;
      }
    });
    const topArtist = Object.values(artistCounts).sort((a, b) => b.count - a.count)[0] ?? null;

    // Avg overall (mean of all 4 facet averages)
    const overallAvg = ratedGems.length > 0
      ? Math.round(FACETS.reduce((s, f) => s + facetAverages[f.key], 0) / FACETS.length)
      : null;

    // Recent 5 gems
    const recent = gems.slice(0, 5);

    return {
      total,
      ratedGems: ratedGems.length,
      facetAverages,
      genreList,
      uniqueArtists,
      uniqueVenues,
      topVenue,
      topArtist,
      overallAvg,
      recent,
    };
  }, [gems]);

  // ── Empty state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="relative mb-5">
          <div className="absolute inset-0 blur-3xl bg-purple-400/15 scale-[2] rounded-full" />
          <Activity className="relative w-14 h-14 text-white/15" strokeWidth={1} />
        </div>
        <p className="font-display font-semibold text-white/50 text-base mb-1">
          Your TasteMap is empty
        </p>
        <p className="text-white/30 text-sm max-w-[200px] leading-relaxed">
          Mine a few gems and your listening personality will emerge here.
        </p>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="pb-4">

      {/* ── Tab header ───────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 px-4 pt-4 pb-2.5 mb-4 border-b border-white/5"
        style={{
          background: 'hsl(150 40% 6% / 0.92)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        }}
      >
        <h2 className="font-display font-bold text-white text-lg">TasteMap</h2>
        <p className="text-[11px] text-white/35 mt-0.5">Your listening personality</p>
      </div>

      <div className="px-4 space-y-5">

      {/* ── Section: Stats row ──────────────────────────────────── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium mb-2.5">
          Overview
        </p>
        <div className="flex gap-2">
          <StatChip icon={Gem}   label="Gems"    value={stats.total}          accent="hsl(145 75% 65%)" />
          <StatChip icon={Users} label="Artists" value={stats.uniqueArtists} />
          <StatChip icon={MapPin} label="Venues" value={stats.uniqueVenues}  />
          {stats.overallAvg !== null && (
            <StatChip icon={Activity} label="Avg score" value={`${stats.overallAvg}`} accent="hsl(280 95% 70%)" />
          )}
        </div>
      </div>

      {/* ── Section: Facet radar ─────────────────────────────────── */}
      {stats.ratedGems > 0 ? (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display font-semibold text-white text-sm uppercase tracking-wide">
                Your Sound Profile
              </p>
              <p className="text-[10px] text-white/35 mt-0.5">
                Based on {stats.ratedGems} rated gem{stats.ratedGems !== 1 ? 's' : ''}
              </p>
            </div>
            {stats.overallAvg !== null && (
              <div className="text-right">
                <p className="font-display font-bold text-2xl text-white">{stats.overallAvg}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wide">/ 100</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <RadarChart averages={stats.facetAverages} />
          </div>

          {/* Facet score row below radar */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {FACETS.map(f => (
              <div key={f.key} className="text-center">
                <p className="font-display font-bold text-white text-sm">
                  {Math.round(stats.facetAverages[f.key])}
                </p>
                <p className="text-[9px] text-white/35">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card p-5">
          <p className="font-display font-semibold text-white text-sm uppercase tracking-wide mb-2">
            Your Sound Profile
          </p>
          <p className="text-white/35 text-xs text-center py-4">
            Rate your gems to see your sound profile here.
          </p>
        </div>
      )}

      {/* ── Section: Genre breakdown ─────────────────────────────── */}
      {stats.genreList.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Music2 className="w-4 h-4 text-primary" />
            <p className="font-display font-semibold text-white text-sm uppercase tracking-wide">
              Genre Breakdown
            </p>
          </div>

          <div className="space-y-3">
            {stats.genreList.slice(0, 6).map((g, i) => (
              <div key={g.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: g.color }}
                    />
                    <span className="text-[11px] font-medium text-white/70">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/35">{g.count} gem{g.count !== 1 ? 's' : ''}</span>
                    <span className="text-[10px] font-semibold text-white/50 w-8 text-right">{g.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${g.pct}%`,
                      backgroundColor: g.color,
                      opacity: 0.75,
                      transitionDelay: `${i * 60}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section: Highlights ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {stats.topArtist && (
          <div className="glass-card p-4">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1.5">Top Artist</p>
            <p className="font-display font-bold text-white text-sm leading-tight truncate">
              {stats.topArtist.name}
            </p>
            <p className="text-[10px] text-white/35 mt-1">
              {stats.topArtist.count} gem{stats.topArtist.count !== 1 ? 's' : ''}
            </p>
          </div>
        )}
        {stats.topVenue && (
          <div className="glass-card p-4">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1.5">Top Venue</p>
            <p className="font-display font-bold text-white text-sm leading-tight truncate">
              {stats.topVenue.name}
            </p>
            <p className="text-[10px] text-white/35 mt-1">
              {stats.topVenue.count} visit{stats.topVenue.count !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* ── Section: Recent gems ─────────────────────────────────── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium mb-2.5">
          Recent
        </p>
        <div className="space-y-2.5">
          {stats.recent.map(gem => {
            const color    = gem.genre?.color_hex ?? '#6ee7b7';
            const dateStr  = gem.event_date
              ? new Date(gem.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : null;

            return (
              <div key={gem.id} className="glass-card p-3 flex items-center gap-3">
                {/* Color dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}88` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-white text-sm truncate">
                    {gem.dj?.stage_name ?? 'Unknown Artist'}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-white/35 mt-0.5 overflow-hidden">
                    {gem.venue?.name && (
                      <span className="flex items-center gap-1 truncate min-w-0">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{gem.venue.name}</span>
                      </span>
                    )}
                    {dateStr && (
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar className="w-2.5 h-2.5" />
                        {dateStr}
                      </span>
                    )}
                  </div>
                </div>
                {/* Genre tag — truncated */}
                <span
                  className="text-[9px] font-medium px-2 py-0.5 rounded-full border shrink-0 max-w-[80px] truncate"
                  style={{
                    color,
                    backgroundColor: color + '18',
                    borderColor:     color + '44',
                  }}
                >
                  {gem.genre?.name ?? '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      </div>{/* end px-4 space-y-5 */}
    </div>
  );
};
