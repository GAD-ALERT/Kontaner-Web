import { useEffect, useState } from 'react';

/**
 * Extracts dominant colors from an image URL using colorthief v3+.
 * Returns up to `count` hex strings (default 5). Returns `null`
 * while extraction is running and `[]` if extraction fails.
 *
 * The img element behind the scenes uses crossOrigin="anonymous"
 * so the source MUST send permissive CORS headers (picsum.photos,
 * images.unsplash.com, and bundled /public/ all work).
 */
export function useDominantColors(
  src: string | undefined,
  count = 5,
): string[] | null {
  const [colors, setColors] = useState<string[] | null>(null);

  useEffect(() => {
    if (!src) {
      queueMicrotask(() => setColors([]));
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setColors(null);
    });

    const run = async (): Promise<void> => {
      try {
        const { getPalette } = await import('colorthief');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('image load failed'));
          img.src = src;
        });
        if (cancelled) return;

        const palette = await getPalette(img, { colorCount: count });
        if (cancelled) return;

        if (!palette || palette.length === 0) {
          setColors([]);
          return;
        }
        setColors(palette.map((c) => c.hex()));
      } catch {
        if (!cancelled) setColors([]);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [src, count]);

  return colors;
}
