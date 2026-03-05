import { memo } from 'react';
import { Genre } from '@/hooks/useGemData';

// ── Size variants ──────────────────────────────────────────────────────────

type TagSize = 'xs' | 'sm' | 'md';

const SIZE_CLASSES: Record<TagSize, string> = {
  xs: 'text-[10px] px-2 py-0.5 gap-1',
  sm: 'text-[11px] px-2.5 py-1 gap-1.5',
  md: 'text-[13px] px-3 py-1.5 gap-1.5',
};

const DOT_CLASSES: Record<TagSize, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
};

// ── Props ──────────────────────────────────────────────────────────────────

interface GenreTagProps {
  genre: Genre;
  size?: TagSize;
  selected?: boolean;
  onClick?: (genre: Genre) => void;
  className?: string;
}

function GenreTag({
  genre,
  size = 'sm',
  selected = false,
  onClick,
  className = '',
}: GenreTagProps) {
  const hex = genre.color_hex ?? '#6ee7b7';
  const isInteractive = !!onClick;

  const baseStyle = {
    backgroundColor: selected ? hex + '33' : hex + '18',
    borderColor:     selected ? hex + '88' : hex + '44',
    color:           hex,
  };

  const Tag = isInteractive ? 'button' : 'span';

  return (
    <Tag
      onClick={isInteractive ? () => onClick(genre) : undefined}
      className={`
        inline-flex items-center font-medium rounded-full border
        transition-all duration-200
        ${SIZE_CLASSES[size]}
        ${isInteractive
          ? 'cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30'
          : 'cursor-default'
        }
        ${selected ? 'shadow-sm' : ''}
        ${className}
      `}
      style={baseStyle}
    >
      {/* Color dot */}
      <span
        className={`rounded-full shrink-0 ${DOT_CLASSES[size]}`}
        style={{ backgroundColor: hex }}
      />
      {genre.name}
    </Tag>
  );
}

// ── Multi-select filter row ────────────────────────────────────────────────

interface GenreFilterRowProps {
  genres: Genre[];
  selectedIds: string[];
  onToggle: (genreId: string) => void;
  showAll?: boolean;
  allLabel?: string;
}

export function GenreFilterRow({
  genres,
  selectedIds,
  onToggle,
  showAll = true,
  allLabel = 'All',
}: GenreFilterRowProps) {
  const allSelected = selectedIds.length === 0;

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
      {showAll && (
        <button
          onClick={() => {
            // Clear all selected
            selectedIds.forEach(id => onToggle(id));
          }}
          className={`
            inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full border
            transition-all duration-200 shrink-0
            ${allSelected
              ? 'bg-white/15 border-white/25 text-white'
              : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
            }
          `}
        >
          {allLabel}
        </button>
      )}

      {genres.map(genre => (
        <div key={genre.id} className="shrink-0">
          <GenreTag
            genre={genre}
            size="xs"
            selected={selectedIds.includes(genre.id)}
            onClick={() => onToggle(genre.id)}
          />
        </div>
      ))}
    </div>
  );
}

export default memo(GenreTag);
