import { useEffect, useState } from 'react';

/**
 * Returns `true` for `ms` milliseconds, then flips to `false`.
 * Used to fake network-like loading states so skeleton screens
 * have time to feel like a real product.
 */
export function useFakeLoad(ms = 600): boolean {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(timer);
  }, [ms]);

  return loading;
}
