/**
 * Kontaner icon — Google Material Symbols (Rounded).
 *
 * One component, one font, a fixed size scale:
 *   16 — inline with text / tags / meta rows
 *   20 — buttons, inputs, nav controls (default)
 *   24 — feature rows, menu headers
 *   32/40/56 — decorative hero & empty-state art only
 *
 * `filled` switches the FILL variation axis for active states
 * (e.g. a saved bookmark, an active heart).
 *
 * Icon names: https://fonts.google.com/icons
 */

export type IconSize = 16 | 20 | 24 | 32 | 40 | 56;

interface IconProps {
  /** Material Symbols glyph name, e.g. "bookmark", "cloud_upload". */
  name: string;
  size?: IconSize;
  filled?: boolean;
  className?: string;
}

export function Icon({ name, size = 20, filled = false, className }: IconProps) {
  const classes = [
    'msr',
    `msr-${size}`,
    filled ? 'msr-filled' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} aria-hidden="true">
      {name}
    </span>
  );
}
