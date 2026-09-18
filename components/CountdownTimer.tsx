
import React, { useState, useEffect } from 'react';
import { getCountdownToReopen } from '../utils/time';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  closedAt: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ closedAt }) => {
  const [timeLeft, setTimeLeft] = useState(getCountdownToReopen(closedAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getCountdownToReopen(closedAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [closedAt]);

  return (
    <div className="flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm border border-rose-200 animate-pulse">
      <Clock size={14} />
      <span>Reopening in: {timeLeft}</span>
    </div>
  );
};

export default CountdownTimer;
