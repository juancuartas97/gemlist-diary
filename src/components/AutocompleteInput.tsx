import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2, Plus } from 'lucide-react';

interface AutocompleteOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: AutocompleteOption) => void;
  onCreateNew?: (value: string) => void;
  options: AutocompleteOption[];
  loading?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  allowCreate?: boolean;
  createLabel?: string;
}

export const AutocompleteInput = ({
  value,
  onChange,
  onSelect,
  onCreateNew,
  options,
  loading = false,
  placeholder,
  icon,
  className,
  allowCreate = true,
  createLabel = 'Add new',
}: AutocompleteInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelect = (option: AutocompleteOption) => {
    onSelect(option);
    onChange(option.label);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    if (onCreateNew && value.trim()) {
      onCreateNew(value.trim());
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    const totalOptions = options.length + (allowCreate && value.trim() ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < totalOptions - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : totalOptions - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelect(options[highlightedIndex]);
        } else if (highlightedIndex === options.length && allowCreate && value.trim()) {
          handleCreateNew();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const showDropdown = isOpen && (options.length > 0 || (allowCreate && value.trim().length >= 2));

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
            {icon}
          </div>
        )}
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(icon && 'pl-10', 'bg-background/50 border-border/30')}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-card/95 backdrop-blur-xl border border-border/30 rounded-lg shadow-lg overflow-hidden">
          <ul className="max-h-60 overflow-y-auto">
            {options.map((option, index) => (
              <li
                key={option.id}
                onClick={() => handleSelect(option)}
                className={cn(
                  'px-4 py-2.5 cursor-pointer transition-colors',
                  highlightedIndex === index 
                    ? 'bg-primary/20 text-foreground' 
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="text-sm font-medium">{option.label}</div>
                {option.sublabel && (
                  <div className="text-xs text-muted-foreground">{option.sublabel}</div>
                )}
              </li>
            ))}
            
            {allowCreate && value.trim().length >= 2 && (
              <li
                onClick={handleCreateNew}
                className={cn(
                  'px-4 py-2.5 cursor-pointer transition-colors border-t border-border/30 flex items-center gap-2',
                  highlightedIndex === options.length 
                    ? 'bg-primary/20 text-foreground' 
                    : 'hover:bg-muted/50'
                )}
              >
                <Plus className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  {createLabel}: <span className="font-medium text-primary">{value}</span>
                </span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
