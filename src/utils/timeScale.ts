// src/utils/timeScale.ts
// A TRUTHFUL time scale. Every year gets exactly equal weight — the axis is
// perfectly linear. The whole point of this app is to show how staggeringly
// LONG the human diet stayed the same, and how the last ~200 years is a
// razor-thin sliver by comparison. We never distort that.
//
// A pure linear reveal would be unusable (all the change lives in the last
// 0.07% of the timeline), so instead of warping the data we navigate it with
// an honest CAMERA: we open fully zoomed out on the truthful whole-history
// frame, then zoom toward the present. The present is always pinned to the
// right edge, so you're always looking at "how we got to now."

export const YEAR_MIN = -300000;
export const YEAR_MAX = 2025;
export const FULL_SPAN = YEAR_MAX - YEAR_MIN; // 302,025 years

// The most zoomed-in view spans this many years (1875 -> 2025), enough to see
// the entire modern industrial/ultra-processed explosion at full detail.
export const MIN_SPAN = 150;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/**
 * Span of years currently on screen for a given zoom in [0,1].
 * Exponential so the zoom feels like a smooth continuous dive (constant zoom
 * rate), and so equal scroll deltas cover equal *multiplicative* time — which
 * naturally gives deep prehistory roughly half the journey and recent history
 * the other half, all while the on-screen axis stays perfectly linear.
 */
export const spanForZoom = (zoom: number): number =>
  FULL_SPAN * Math.pow(MIN_SPAN / FULL_SPAN, clamp01(zoom));

export interface CameraWindow {
  start: number; // oldest year visible (left edge)
  end: number; // newest year visible (right edge) — always YEAR_MAX
  span: number; // years on screen
}

/** The visible year window for a given zoom, pinned to the present at the right. */
export const cameraWindow = (zoom: number): CameraWindow => {
  const span = spanForZoom(zoom);
  return { start: YEAR_MAX - span, end: YEAR_MAX, span };
};

/** Human-readable year label. */
export const formatYear = (year: number): string => {
  const y = Math.round(year);
  if (y <= -10000) return `${Math.round(Math.abs(y) / 1000)}k BCE`;
  if (y < 0) return `${Math.abs(y).toLocaleString()} BCE`;
  if (y === 0) return '1 CE';
  return `${y.toLocaleString()} CE`;
};

/** Compact "years on screen" count, e.g. 302,025 or 150. */
export const formatSpan = (years: number): string => Math.round(years).toLocaleString();
