// src/utils/animations.js

export const cardFadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
  viewport: { once: true, amount: 0.2 },
};

export const hoverScale = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.98 },
};
