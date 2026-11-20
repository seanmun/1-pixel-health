import { useCallback, useMemo, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
} from 'framer-motion';
import StreamGraph from './StreamGraph';
import WorldScene from './world/WorldScene';
import { WORLD_LEN } from './world/scenery';
import { CHAPTERS } from '../../data/chapters';
import { vitalsAt } from '../../data/vitals';
import {
  cameraWindow,
  formatYear,
  yearAtProgress,
  ZOOM_PORTION,
} from '../../utils/timeScale';
import { getDietColor, formatCategory } from '../../utils/dietUtils';
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
const REVEAL_END = 0.9;
const OUTRO_START = 0.92;

// Share of the viewport height given to the truthful (linear) timeline strip.
const STRIP_RATIO = 0.13;
// Length of one walking step in world units, for the "years per step" readout.
const STEP_LENGTH = 0.75;

type Phase = 'intro' | 'reveal' | 'outro';

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** How much time one step covers at journey progress p. */
const paceLabel = (p: number): string => {
  const e = 0.002;
  const a = Math.max(0, Math.min(1 - e, p));
  const yearsPerUnit = (yearAtProgress(a + e) - yearAtProgress(a)) / (e * WORLD_LEN);
  const perStep = yearsPerUnit * STEP_LENGTH;
  if (perStep >= 10) return `1 step ≈ ${Math.round(perStep).toLocaleString()} years`;
  if (perStep >= 1.5) return `1 step ≈ ${perStep.toFixed(1)} years`;
  return `1 step ≈ ${Math.max(1, Math.round(perStep * 12))} months`;
};

const STATS = [
  { key: 'life', short: 'Life exp.', label: 'Life expectancy', hint: 'average from birth' },
  { key: 'infant', short: 'Infant /1,000', label: 'Infant deaths', hint: 'per 1,000, before age 1' },
  { key: 'child', short: 'Died before 15', label: 'Died before 15', hint: 'of all children born' },
  { key: 'adult', short: 'Adults to', label: 'Adults lived to', hint: 'if they reached 15' },
  { key: 'median', short: 'Median death', label: 'Median death age', hint: 'half had died by' },
  { key: 'height', short: 'Height', label: 'Height', hint: 'adult male' },
  { key: 'weight', short: 'Weight', label: 'Weight', hint: 'adult male' },
  { key: 'energy', short: 'Energy / yr', label: 'Energy per person', hint: 'all sources, per year' },
] as const;
type StatKey = (typeof STATS)[number]['key'];

const statValues = (year: number): Record<StatKey, string> => {
  const v = vitalsAt(year);
  return {
    life: `${Math.round(v.lifeExpectancy)} yrs`,
    infant: `${v.infantMortality < 10 ? v.infantMortality.toFixed(1) : Math.round(v.infantMortality)}`,
    child: `${v.childMortality < 10 ? v.childMortality.toFixed(1) : Math.round(v.childMortality)}%`,
    adult: `${Math.round(v.adultAgeAtDeath)} yrs`,
    median: `${Math.round(v.medianAgeAtDeath)} yrs`,
    height: `${Math.round(v.heightCm)} cm`,
    weight: `${Math.round(v.weightKg)} kg`,
    energy: `${(Math.round(v.energyKwh / 100) * 100).toLocaleString()} kWh`,
  };
};

/**
 * What the lifespan numbers mean in each era. A low life expectancy never
 * meant adults died at 30: it is an average dragged down by child deaths.
 */
const lifespanNote = (year: number): { full: string; short: string } => {
  const { childMortality } = vitalsAt(year);
  if (childMortality >= 40)
    return {
      full: 'Not old age at 30. Cold, famine, injury, violence and infection, with no medicine to fight them, killed about half of all children. Those who reached 15 lived to 53 on average, and it was not unusual to reach 70.',
      short: 'Not old age at 30: about half of all children died. Adults often reached their 60s and 70s.',
    };
  if (childMortality >= 8)
    return {
      full: 'Life expectancy is still held down by children dying, not by adults dying young. Those who reached 15 could expect to live to around 60.',
      short: 'Held down by child deaths: those who reached 15 lived to about 60.',
    };
  return {
    full: 'Fewer than 1 in 10 children now die before 15, against about half for most of history. Adults gained too, but most of the rise in life expectancy is children surviving.',
    short: 'Children surviving is most of the rise; adults gained too.',
  };
};

const Journey = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Imperatively-updated DOM (no per-frame React renders).
  const yearRef = useRef<HTMLSpanElement>(null);
  const paceRef = useRef<HTMLSpanElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);
  const noteShortRef = useRef<HTMLParagraphElement>(null);
  const statRefs = useRef<Partial<Record<StatKey, HTMLSpanElement | null>>>({});
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

  // Journey progress [0,1] drives the walking world; zoom [0,1] drives the
  // linear timeline strip's camera.
  const progressMV = useMotionValue(0);
  const zoomMV = useMotionValue(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  // Without WebGL we fall back to the full-height 2D streamgraph.
  const [webgl, setWebgl] = useState(true);
  const onUnavailable = useCallback(() => setWebgl(false), []);

  const chapterYears = useMemo(() => CHAPTERS.map((c) => c.year), []);
  const initialStats = useMemo(() => statValues(yearAtProgress(0)), []);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const p = clamp01((v - REVEAL_START) / (REVEAL_END - REVEAL_START));
    const z = Math.min(1, p / ZOOM_PORTION);
    progressMV.set(p);
    zoomMV.set(z);

    // The year the walkers are in. While the strip's camera zooms it is the
    // oldest year on the strip; afterwards it sweeps across the modern window.
    const focus = yearAtProgress(p);
    const { start: viewStart } = cameraWindow(z);

    // Intro / hint / outro / progress bar.
    if (introRef.current) {
      const t = clamp01(v / 0.06);
      introRef.current.style.opacity = `${1 - t}`;
      introRef.current.style.transform = `translateY(${-50 * t}px)`;
    }
    if (hintRef.current) hintRef.current.style.opacity = `${1 - clamp01(v / 0.03)}`;
    // The closing panel waits until the walk has fully reached the present.
    if (outroRef.current)
      outroRef.current.style.opacity = `${clamp01((v - OUTRO_START) / (1 - OUTRO_START - 0.02))}`;
    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    // The opening thesis annotation only reads while we're still zoomed out.
    if (annotationRef.current)
      annotationRef.current.style.opacity = `${1 - clamp01(p / 0.1)}`;

    // Live HUD.
    if (yearRef.current) yearRef.current.textContent = formatYear(focus);
    if (paceRef.current) paceRef.current.textContent = paceLabel(p);
    const values = statValues(focus);
    const note = lifespanNote(focus);
    if (noteRef.current && noteRef.current.textContent !== note.full) noteRef.current.textContent = note.full;
    if (noteShortRef.current && noteShortRef.current.textContent !== note.short)
      noteShortRef.current.textContent = note.short;
    for (const s of STATS) {
      const el = statRefs.current[s.key];
      if (el) el.textContent = values[s.key];
    }
    if (leftAxisRef.current) leftAxisRef.current.textContent = formatYear(viewStart);

    // Active chapter (discrete).
    let idx = 0;
    for (let i = 0; i < chapterYears.length; i++) {
      if (chapterYears[i] <= focus + 1) idx = i;
    }
    setActiveIndex((prev) => (prev === idx ? prev : idx));

    const next: Phase =
      v < REVEAL_START * 0.9 ? 'intro' : v > OUTRO_START + 0.01 ? 'outro' : 'reveal';
    setPhase((prev) => (prev === next ? prev : next));
  });

  const active = CHAPTERS[activeIndex];
  const stripTop = `${STRIP_RATIO * 100}svh`;

  return (
    <div ref={containerRef} className="relative bg-[#0a0a0f]" style={{ height: '900vh' }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-gradient-to-b from-[#0a0a0f] via-[#0b0b12] to-[#050507]">
        {/* The walking world */}
        {webgl && <WorldScene progress={progressMV} onUnavailable={onUnavailable} />}

        {/* The truthful timeline: linear in years, present pinned right. A thin
            strip under the world, or the whole scene if WebGL is unavailable. */}
        {webgl && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-white/15 bg-[#07070c]"
            style={{ height: stripTop }}
          />
        )}
        <StreamGraph zoom={zoomMV} heightRatio={webgl ? STRIP_RATIO : 0.82} />

        {/* Legibility gradients */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-[#05050a]/85 via-[#05050a]/30 to-transparent" />
        {/* Scrim behind the HUD + chapter card column (desktop) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[620px] bg-gradient-to-r from-[#05050a]/80 via-[#05050a]/45 to-transparent md:block" />
        {/* Scrim behind the HUD (mobile) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[17rem] bg-gradient-to-b from-[#05050a]/85 via-[#05050a]/60 to-transparent md:hidden" />
        <div
          className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-t from-[#05050a]/70 to-transparent"
          style={{ bottom: webgl ? stripTop : 0 }}
        />

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

        {/* Timeline strip captions */}
        <div
          className="pointer-events-none absolute inset-x-0 z-20 flex items-end justify-between px-4 pb-1.5 font-mono text-[10px] tracking-wide md:px-6 md:text-xs"
          style={{ bottom: stripTop }}
        >
          <span className="text-white/60">
            <span ref={leftAxisRef}>300k BCE</span>
            <span className="text-white/35"> · you are here</span>
          </span>
          <span className="hidden text-white/35 md:inline">
            linear timeline · every year drawn the same width
          </span>
          <span className="text-white/60">NOW · 2025</span>
        </div>
        {/* Opening thesis annotation — only visible while fully zoomed out */}
        <div
          ref={annotationRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] will-change-[opacity]"
          style={{ height: stripTop }}
        >
          <div className="absolute left-1/2 top-1/2 w-[92%] -translate-x-1/2 -translate-y-1/2 text-center text-xs font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] md:text-base">
            ≈ 300,000 years of essentially one diet
          </div>
          <div className="absolute bottom-1 right-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] md:right-5 md:text-xs">
            all the change is in here →
          </div>
        </div>

        {/* Live HUD — sits below the nav + top legend (hidden during intro) */}
        <div
          className={`under-nav-hud absolute left-4 right-4 z-20 md:left-10 md:right-auto ${
            phase === 'intro' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="hidden text-[11px] font-semibold uppercase tracking-[0.25em] text-white/45 md:block">
            You are in
          </div>
          <div className="flex items-baseline gap-3 md:mt-0.5">
            <span
              ref={yearRef}
              className="font-mono text-2xl font-bold tabular-nums text-white md:text-4xl"
            >
              300k BCE
            </span>
            <span
              ref={paceRef}
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/45 md:text-[11px]"
            >
              {paceLabel(0)}
            </span>
          </div>
          <dl className="mt-1 grid grid-cols-4 gap-x-2 gap-y-1 md:mt-3 md:w-[600px] md:gap-x-6 md:gap-y-2">
            {STATS.map((s) => (
              <div key={s.key}>
                <dt className="whitespace-nowrap text-[8px] font-semibold uppercase leading-tight tracking-[0.08em] text-white/45 md:text-[10px] md:tracking-[0.12em]">
                  <span className="md:hidden">{s.short}</span>
                  <span className="hidden md:inline">{s.label}</span>
                </dt>
                <dd className="whitespace-nowrap font-mono text-xs font-bold tabular-nums text-white md:mt-0.5 md:text-lg">
                  <span
                    ref={(el) => {
                      statRefs.current[s.key] = el;
                    }}
                  >
                    {initialStats[s.key]}
                  </span>
                </dd>
                <div className="hidden text-[10px] text-white/35 md:block">{s.hint}</div>
              </div>
            ))}
          </dl>
<p ref={noteShortRef} className="mt-1 text-[10px] leading-snug text-white/60 md:hidden">
            {lifespanNote(yearAtProgress(0)).short}
          </p>
          <p ref={noteRef} className="mt-2 hidden max-w-[600px] text-xs leading-snug text-white/60 md:block">
            {lifespanNote(yearAtProgress(0)).full}
          </p>
        </div>

        {/* Intro hero */}
        <div
          ref={introRef}
          className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#05050a]/55 px-6 text-center will-change-[opacity,transform]"
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
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/70 md:text-lg">
            For nearly all of human history, we ate the same way. Then, in the
            final sliver of the timeline, everything changed. Scroll to walk it.
          </p>
          <p className="mt-4 max-w-md text-xs leading-relaxed text-white/50 md:text-sm">
            The strip below is strictly linear — every year is drawn the same
            width, nothing stretched. The walk above it is a time-lapse that
            slows as it nears today.
          </p>
        </div>

        {/* Scroll hint */}
        <div
          ref={hintRef}
          className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 text-center will-change-[opacity]"
          style={{ bottom: `calc(${stripTop} + 2rem)` }}
        >
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/50">
            Scroll to walk
          </div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto mt-2 h-6 w-[2px] rounded bg-white/40"
          />
        </div>

        {/* Active chapter card (single keyed node — never stalls or stacks) */}
        {phase === 'reveal' && active && (
          <div
            className="absolute left-1/2 z-20 w-[min(94%,540px)] -translate-x-1/2 px-1 md:bottom-auto md:left-10 md:top-[calc(50%+5rem)] md:w-[420px] md:translate-x-0 md:-translate-y-1/2"
            style={{ bottom: `calc(${stripTop} + 1.75rem)` }}
          >
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="rounded-2xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur-xl md:p-6">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#FFD93D]">
                    {active.kicker}
                  </span>
                  <span className="text-[11px] font-medium text-white/40">
                    · {formatYear(active.year)}
                  </span>
                </div>
                <h2 className="text-lg font-bold leading-tight text-white md:text-2xl">
                  {active.title}
                </h2>
                <p className="mt-2 hidden text-sm leading-relaxed text-white/75 md:block md:text-[15px]">
                  {active.body}
                </p>
                <dl className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-[13px] leading-snug md:text-sm">
                  <div className="flex gap-2">
                    <dt className="w-[4.5rem] shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#FF6B6B] md:pt-0.5">
                      Eating
                    </dt>
                    <dd className="text-white/80">{active.eating}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-[4.5rem] shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#FFD93D] md:pt-0.5">
                      Prepared
                    </dt>
                    <dd className="text-white/80">{active.prepared}</dd>
                  </div>
                </dl>
              </div>
            </motion.div>
          </div>
        )}

        {/* Legend — pinned to the top under the nav. One swipeable row on
            mobile; wrapped and centered on desktop. (hidden during intro) */}
        <div
          className={`no-scrollbar under-nav-legend absolute left-1/2 z-30 flex w-[94%] max-w-[94%] -translate-x-1/2 flex-nowrap items-center justify-start gap-x-3 gap-y-1 overflow-x-auto md:w-auto md:flex-wrap md:justify-center md:overflow-visible ${
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
            Seed oils and ultra-processed foods went from 0% to more than half
            our diet — in roughly the last 0.07% of human history.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Journey;
