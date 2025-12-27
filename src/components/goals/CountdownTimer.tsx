import { useMemo } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export const CountdownTimer = ({ 
  targetDate, 
  size = 'sm', 
  showLabel = false,
  className 
}: CountdownTimerProps) => {
  const countdown = useMemo(() => {
    const target = parseISO(targetDate);
    const now = new Date();

    if (isPast(target)) {
      return { isPast: true, text: 'Event passed' };
    }

    const days = differenceInDays(target, now);
    const hours = differenceInHours(target, now) % 24;
    const minutes = differenceInMinutes(target, now) % 60;

    if (days > 30) {
      const months = Math.floor(days / 30);
      return { 
        isPast: false, 
        text: `${months}mo ${days % 30}d`,
        days,
      };
    }

    if (days > 0) {
      return { isPast: false, text: `${days}d ${hours}h`, days };
    }

    if (hours > 0) {
      return { isPast: false, text: `${hours}h ${minutes}m`, days: 0 };
    }

    return { isPast: false, text: `${minutes}m`, days: 0 };
  }, [targetDate]);

  const sizeStyles = {
    xs: 'text-[9px]',
    sm: 'text-xs',
    md: 'text-sm',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  if (countdown.isPast) {
    return (
      <span className={cn(
        'text-muted-foreground/50 italic',
        sizeStyles[size],
        className
      )}>
        Passed
      </span>
    );
  }

  // Color based on urgency
  const urgencyColor = countdown.days !== undefined
    ? countdown.days <= 7 
      ? 'text-orange-400' 
      : countdown.days <= 30 
        ? 'text-yellow-400' 
        : 'text-primary'
    : 'text-primary';

  return (
    <div className={cn(
      'flex items-center gap-1',
      urgencyColor,
      sizeStyles[size],
      className
    )}>
      <Clock className={iconSizes[size]} />
      {showLabel && <span className="text-muted-foreground">in</span>}
      <span className="font-mono font-medium">{countdown.text}</span>
    </div>
  );
};
