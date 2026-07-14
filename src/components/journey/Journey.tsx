import { useMemo, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
} from 'framer-motion';
import StreamGraph from './StreamGraph';
import { CHAPTERS } from '../../data/chapters';
import {
  cameraWindow,
  formatYear,
  formatSpan,
  MIN_SPAN,
  YEAR_MAX,
} from '../../utils/timeScale';
import { getDietData, getDietColor, formatCategory } from '../../utils/dietUtils';
import { DietComposition } from '../../types';

const LEGEND: (keyof DietComposition)[] = [
  'animal',
  'vegetables',
  'fruits',
  'nuts',
  'grains',
  'seedOils',
  'processedTraditional',
  'processedModern',
];

// Scroll fractions carved out for the intro hero and closing panel.
const REVEAL_START = 0.08;
const REVEAL_END = 0.92;
// Portion of the reveal spent zooming in; the remainder "dwells" on the modern
// window while the final chapters play out.
const ZOOM_PORTION = 0.78;

type Phase = 'intro' | 'reveal' | 'outro';

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const Journey = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  // Imperatively-updated DOM (no per-frame React renders).
  const yearRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLSpanElement>(null);
  const leftAxisRef = useRef<HTMLSpanElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const annotationRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Camera zoom [0,1] consumed by StreamGraph.
  const zoomMV = useMotionValue(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');

  const chapterYears = useMemo(() => CHAPTERS.map((c) => c.year), []);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const p = clamp01((v - REVEAL_START) / (REVEAL_END - REVEAL_START));
    const z = Math.min(1, p / ZOOM_PORTION);
    zoomMV.set(z);

    const { start: viewStart, span } = cameraWindow(z);

    // The era we're currently narrating. During the zoom it's the oldest year
    // on screen; during the closing dwell it sweeps across the modern window.
    const focus =
      p < ZOOM_PORTION
        ? viewStart
        : lerp(YEAR_MAX - MIN_SPAN, YEAR_MAX, (p - ZOOM_PORTION) / (1 - ZOOM_PORTION));

    // Intro / hint / outro / progress bar.
    if (introRef.current) {
      const t = clamp01(v / 0.06);
      introRef.current.style.opacity = `${1 - t}`;
      introRef.current.style.transform = `translateY(${-50 * t}px)`;
    }
    if (hintRef.current) hintRef.current.style.opacity = `${1 - clamp01(v / 0.03)}`;
    if (outroRef.current) outroRef.current.style.opacity = `${clamp01((p - 0.9) / 0.08)}`;
    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    // The opening thesis annotation only reads while we're still zoomed out.
    if (annotationRef.current)
      annotationRef.current.style.opacity = `${1 - clamp01(p / 0.1)}`;

    // Live HUD.
    if (yearRef.current) yearRef.current.textContent = formatYear(focus);
    if (metaRef.current) {
      const comp = getDietData(focus);
      metaRef.current.textContent = `${formatSpan(span)} yrs on screen · ${Math.round(
        comp.seedOils + comp.processedModern
      )}% ultra-processed`;
    }
    if (leftAxisRef.current) leftAxisRef.current.textContent = formatYear(viewStart);

    // Active chapter (discrete).
    let idx = 0;
    for (let i = 0; i < chapterYears.length; i++) {
      if (chapterYears[i] <= focus + 1) idx = i;
    }
    setActiveIndex((prev) => (prev === idx ? prev : idx));

    const next: Phase =
      v < REVEAL_START * 0.9 ? 'intro' : p > 0.92 ? 'outro' : 'reveal';
    setPhase((prev) => (prev === next ? prev : next));
  });

  const active = CHAPTERS[activeIndex];

  return (
    <div ref={containerRef} className="relative bg-[#0a0a0f]" style={{ height: '900vh' }}>
      <div
        ref={sceneRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden bg-gradient-to-b from-[#0a0a0f] via-[#0b0b12] to-[#050507]"
      >
        <StreamGraph zoom={zoomMV} heightRatio={0.82} />

        {/* Legibility gradients */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#05050a]/90 via-[#05050a]/30 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#05050a]/85 to-transparent" />

        {/* Climax vignette pulse */}
        <AnimatePresence>
          {active?.climax && phase === 'reveal' && (
            <motion.div
              key="climax"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.15, 0.32, 0.15] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(120% 90% at 92% 100%, rgba(255,93,162,0.4), transparent 55%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div
          ref={barRef}
          className="absolute left-0 top-0 z-[60] h-[3px] w-full origin-left bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#FF5DA2]"
          style={{ transform: 'scaleX(0)' }}
        />

        {/* Opening thesis annotation — only visible while fully zoomed out */}
        <div
          ref={annotationRef}
          className="pointer-events-none absolute inset-0 z-[15] will-change-[opacity]"
        >
          <div className="absolute left-1/2 top-[32%] w-[min(90%,780px)] -translate-x-1/2 text-center">
            <div className="text-lg font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] md:text-2xl">
              ≈ 300,000 years of essentially <span className="text-[#FF6B6B]">one diet</span>
            </div>
            <div className="mx-auto mt-3 h-px w-[80%] bg-gradient-to-r from-transparent via-white/40 to-white/60" />
          </div>
          <div className="absolute right-4 top-[46%] text-right md:right-8">
            <div className="ml-auto mb-1 h-8 w-px bg-gradient-to-t from-[#FF5DA2] to-transparent md:h-12" />
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#FF5DA2] drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] md:text-sm">
              all the change
              <br />
              is in here →
            </div>
          </div>
        </div>

        {/* Live HUD — sits below the nav + top legend */}
        <div className="absolute left-5 top-[6.25rem] z-20 md:left-10 md:top-28">
          <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/45">
            Oldest on screen
          </div>
          <div className="mt-1">
            <span
              ref={yearRef}
              className="font-mono text-2xl font-bold tabular-nums text-white md:text-4xl"
            >
              300k BCE
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
            <span ref={metaRef} className="font-mono">
              302,025 yrs on screen · 0% ultra-processed
            </span>
          </div>
        </div>

        {/* Intro hero */}
        <div
          ref={introRef}
          className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center will-change-[opacity,transform]"
        >
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/50">
            Human Diet
          </div>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] text-white md:text-7xl">
            300,000 years
            <br />
            <span className="bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#FF5DA2] bg-clip-text text-transparent">
              of eating
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/60 md:text-lg">
            For nearly all of human history, we ate the same way. Then, in the
            final sliver of the timeline, everything changed. Scroll to zoom in.
          </p>
        </div>

        {/* Scroll hint */}
        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-7 left-1/2 z-30 -translate-x-1/2 text-center will-change-[opacity]"
        >
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/50">
            Scroll to zoom in
          </div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto mt-2 h-6 w-[2px] rounded bg-white/40"
          />
        </div>

        {/* Active chapter card (single keyed node — never stalls or stacks) */}
        {phase === 'reveal' && active && (
          <div className="absolute bottom-24 left-1/2 z-20 w-[min(92%,540px)] -translate-x-1/2 px-1 md:bottom-auto md:left-10 md:top-1/2 md:w-[420px] md:translate-x-0 md:-translate-y-1/2">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="rounded-2xl border border-white/10 bg-black/45 p-6 shadow-2xl backdrop-blur-xl md:p-8">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#FFD93D]">
                    {active.kicker}
                  </span>
                  <span className="text-[11px] font-medium text-white/40">
                    · {formatYear(active.year)}
                  </span>
                </div>
                <h2 className="text-xl font-bold leading-tight text-white md:text-2xl">
                  {active.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-[15px]">
                  {active.body}
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Axis labels at the graph's lower corners */}
        <div className="pointer-events-none absolute bottom-[4.5rem] left-4 z-20 font-mono text-[10px] tracking-wide text-white/45 md:bottom-20 md:left-6 md:text-xs">
          <span ref={leftAxisRef}>300k BCE</span>
        </div>
        <div className="pointer-events-none absolute bottom-[4.5rem] right-4 z-20 text-right font-mono text-[10px] tracking-wide text-white/60 md:bottom-20 md:right-6 md:text-xs">
          NOW · 2025
        </div>

        {/* Legend — pinned to the top under the nav. One swipeable row on
            mobile; wrapped and centered on desktop. (hidden during intro) */}
        <div
          className={`no-scrollbar absolute left-1/2 top-[3.5rem] z-30 flex w-[94%] max-w-[94%] -translate-x-1/2 flex-nowrap items-center justify-start gap-x-3 gap-y-1 overflow-x-auto md:w-auto md:flex-wrap md:justify-center md:overflow-visible transition-opacity duration-500 ${
            phase === 'intro' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {LEGEND.map((cat) => (
            <div key={cat} className="flex shrink-0 items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getDietColor(cat) }} />
              <span className="whitespace-nowrap text-[10px] font-medium text-white/55 md:text-[11px]">
                {formatCategory(cat)}
              </span>
            </div>
          ))}
        </div>

        {/* Outro panel */}
        <div
          ref={outroRef}
          style={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#05050a]/70 px-6 text-center backdrop-blur-sm will-change-[opacity]"
        >
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/50">
            Today
          </div>
          <h2 className="max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
            All of that change
            <br />
            <span className="text-[#FF5DA2]">happened in the last sliver.</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/60">
            Seed oils and ultra-processed foods went from 0% to nearly half our
            diet — in roughly the last 0.07% of human history.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Journey;
