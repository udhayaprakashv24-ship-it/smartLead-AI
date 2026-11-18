import type { Variants } from 'motion/react';

export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const VIEWPORT_REVEAL = {
  once: true,
  amount: 0.15,
} as const;

export const staggerContainer = (staggerChildren = 0.06, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: EASE_OUT_EXPO,
    },
  },
};

export const cardHoverLift = {
  y: -4,
  transition: { duration: 0.18, ease: EASE_OUT_EXPO },
} as const;
