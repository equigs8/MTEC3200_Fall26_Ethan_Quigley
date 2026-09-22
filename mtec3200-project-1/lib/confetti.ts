import confetti from "canvas-confetti";

/**
 * Fires a celebratory soccer pitch confetti burst (emerald green, gold, white, teal)
 */
export const triggerRSVPConfetti = () => {
  if (typeof window === "undefined") return;

  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#00e676", "#10b981", "#34d399", "#f59e0b", "#ffffff"],
    shapes: ["circle", "square"],
    ticks: 200,
    gravity: 1.2,
    scalar: 1.1,
  });
};

/**
 * Fires dual cannon celebration for squad readiness or sub confirmed
 */
export const triggerSquadReadyConfetti = () => {
  if (typeof window === "undefined") return;

  const count = 100;
  const defaults = {
    origin: { y: 0.7 },
    colors: ["#00e676", "#3b82f6", "#f59e0b", "#a855f7", "#ffffff"],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
