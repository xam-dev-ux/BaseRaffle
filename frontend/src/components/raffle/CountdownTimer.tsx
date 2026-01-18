import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  endTime: bigint;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(endTime: number): TimeLeft {
  const now = Math.floor(Date.now() / 1000);
  const diff = endTime - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
    total: diff,
  };
}

export function CountdownTimer({
  endTime,
  className,
  showIcon = true,
  size = 'md',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(Number(endTime))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(Number(endTime)));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const isEnded = timeLeft.total <= 0;
  const isUrgent = timeLeft.total > 0 && timeLeft.total < 3600; // Less than 1 hour

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (isEnded) {
    return (
      <div className={cn('flex items-center gap-1 text-gray-400', sizeClasses[size], className)}>
        {showIcon && <Clock className="w-4 h-4" />}
        <span>Ended</span>
      </div>
    );
  }

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 font-mono',
        isUrgent ? 'text-red-400' : 'text-gray-300',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <Clock className={cn('w-4 h-4', isUrgent && 'animate-pulse')} />
      )}
      <span>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:
        {formatNumber(timeLeft.seconds)}
      </span>
    </div>
  );
}
