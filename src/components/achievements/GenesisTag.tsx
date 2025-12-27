import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GenesisTagProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const GenesisTag = ({ className, size = 'sm' }: GenesisTagProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full',
              'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
              'border border-yellow-500/40',
              'text-yellow-400',
              size === 'sm' ? 'text-[9px]' : 'text-xs',
              className
            )}
          >
            <Zap className={cn(size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
            <span className="font-bold tracking-wide">GENESIS</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="glass-card border-border/50">
          <p className="text-xs">First to mine this gem! ⚡</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
