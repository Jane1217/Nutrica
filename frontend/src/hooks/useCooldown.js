import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Counts down from `seconds` after start() is called. Used to stop people from
 * hammering "resend email" buttons (Supabase allows one email per address per
 * minute and answers further requests with a rate-limit error).
 * @returns {[remaining: number, start: () => void]}
 */
export default function useCooldown(seconds = 60) {
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef(null);

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = useCallback(() => {
    stop();
    setRemaining(seconds);
    timerRef.current = setInterval(() => {
      setRemaining(current => {
        if (current <= 1) {
          stop();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, [seconds]);

  useEffect(() => stop, []);

  return [remaining, start];
}
