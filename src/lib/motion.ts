import type { Transition, Variants } from 'motion/react';

/**
 * Subtle motion variants shared across the app.
 * Principle: short, taut, with a hint of spring — never bouncy.
 */

export const ease: Transition = {
  duration: 0.35,
  ease: [0.22, 0.61, 0.36, 1],
};

export const easeSlow: Transition = {
  duration: 0.55,
  ease: [0.22, 0.61, 0.36, 1],
};

/** Container that staggers its children's enter animations. */
export const gridContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.05,
    },
  },
};

/** Card / cell entrance — small slide up + fade. */
export const gridItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: ease,
  },
};

/** Hero copy entrance — slightly larger travel, slower curve. */
export const heroItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...easeSlow, delay: 0.08 + custom * 0.08 },
  }),
};

/** Page route fade + tiny lift, used inside AnimatePresence. */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: ease },
  exit: { opacity: 0, y: -4, transition: { duration: 0.18 } },
};

/** Modal spring — gentle, no overshoot. */
export const modalSpring: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 28,
  mass: 0.6,
};
