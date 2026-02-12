import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';

const THEME_PRESETS = [
  { name: 'Emerald', hue: 145, sat: 75, light: 55, label: '💎' },
  { name: 'Sapphire', hue: 217, sat: 91, light: 60, label: '🔷' },
  { name: 'Amethyst', hue: 280, sat: 75, light: 55, label: '🔮' },
  { name: 'Ruby', hue: 0, sat: 85, light: 55, label: '❤️' },
  { name: 'Amber', hue: 38, sat: 92, light: 50, label: '🔶' },
  { name: 'Rose', hue: 330, sat: 85, light: 60, label: '🌸' },
  { name: 'Cyan', hue: 185, sat: 80, light: 50, label: '🧊' },
] as const;

const STORAGE_KEY = 'gemlist-theme-color';

function applyThemeColor(hue: number, sat: number, light: number) {
  const root = document.documentElement;
  root.style.setProperty('--primary', `${hue} ${sat}% ${light}%`);
  root.style.setProperty('--ring', `${hue} ${sat}% ${light}%`);
  root.style.setProperty('--gem-green', `${hue} ${sat}% ${light}%`);

  // Adjust background/card hues to complement primary
  root.style.setProperty('--background', `${hue} 40% 8%`);
  root.style.setProperty('--foreground', `${hue} 20% 95%`);
  root.style.setProperty('--card', `${hue} 30% 12%`);
  root.style.setProperty('--card-foreground', `${hue} 20% 95%`);
  root.style.setProperty('--popover', `${hue} 30% 10%`);
  root.style.setProperty('--popover-foreground', `${hue} 20% 95%`);
  root.style.setProperty('--primary-foreground', `${hue} 40% 5%`);
  root.style.setProperty('--muted', `${hue} 20% 18%`);
  root.style.setProperty('--muted-foreground', `${hue} 15% 60%`);
  root.style.setProperty('--border', `${hue} 20% 20%`);
  root.style.setProperty('--input', `${hue} 20% 15%`);
}

export function loadSavedTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const { hue, sat, light } = JSON.parse(saved);
      applyThemeColor(hue, sat, light);
    } catch {}
  }
}

export const ThemeColorPicker = () => {
  const [selected, setSelected] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).name || 'Emerald';
      } catch {}
    }
    return 'Emerald';
  });

  const [open, setOpen] = useState(false);

  const handleSelect = (preset: typeof THEME_PRESETS[number]) => {
    setSelected(preset.name);
    applyThemeColor(preset.hue, preset.sat, preset.light);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name: preset.name,
      hue: preset.hue,
      sat: preset.sat,
      light: preset.light,
    }));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="glass-button p-2 rounded-xl flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Change theme color"
      >
        <Palette className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium">{selected}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 glass-card p-3 rounded-xl min-w-[180px] animate-scale-in">
            <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Theme</p>
            <div className="grid grid-cols-4 gap-2">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleSelect(preset)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    selected === preset.name
                      ? 'bg-primary/20 ring-1 ring-primary/50'
                      : 'hover:bg-card/80'
                  }`}
                  title={preset.name}
                >
                  <div
                    className="w-6 h-6 rounded-full ring-1 ring-white/10"
                    style={{ background: `hsl(${preset.hue}, ${preset.sat}%, ${preset.light}%)` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
