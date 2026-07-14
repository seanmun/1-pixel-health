import { useEffect, useRef } from 'react';
import { MotionValue } from 'framer-motion';
import { cameraWindow } from '../../utils/timeScale';
import { getDietData, getDietColor } from '../../utils/dietUtils';
import { DietComposition } from '../../types';

// Bottom -> top stacking order. Modern processed sits on top so its late
// explosion grows dramatically across the ceiling of the graph.
const STACK_ORDER: (keyof DietComposition)[] = [
  'animal',
  'vegetables',
  'fruits',
  'nuts',
  'grains',
  'seedOils',
  'processedTraditional',
  'processedModern',
];

const SAMPLES = 640; // columns sampled across the visible window each render

interface StreamGraphProps {
  /** Camera zoom in [0,1]. 0 = the whole 302,025-year timeline; 1 = ~last 150 years. */
  zoom: MotionValue<number>;
  /** Fraction of viewport height the graph occupies, anchored to the bottom. */
  heightRatio?: number;
}

/**
 * A GPU-friendly <canvas> streamgraph of diet composition. The x-axis is
 * ALWAYS linear (equal years); scrolling zooms the camera rather than warping
 * the data. Driven imperatively by a Framer Motion value so scrolling stays at
 * 60fps without re-rendering React on every frame.
 */
const StreamGraph = ({ zoom, heightRatio = 0.82 }: StreamGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const zoomRef = useRef(0);
  const rafRef = useRef(0);
  const dirtyRef = useRef(true);

  useEffect(() => {
    const unsub = zoom.on('change', (v) => {
      zoomRef.current = v;
      dirtyRef.current = true;
    });
    zoomRef.current = zoom.get();
    return () => unsub();
  }, [zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      sizeRef.current = { w, h, dpr };
      dirtyRef.current = true;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      if (dirtyRef.current) {
        dirtyRef.current = false;
        render(ctx, sizeRef.current, zoomRef.current, heightRatio);
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [heightRatio]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ display: 'block' }} />
  );
};

interface Sample {
  fx: number; // 0..1 across the visible window (linear in year)
  comp: DietComposition;
}

function render(
  ctx: CanvasRenderingContext2D,
  size: { w: number; h: number; dpr: number },
  zoom: number,
  heightRatio: number
) {
  const { w, h, dpr } = size;
  if (w === 0 || h === 0) return;

  const { start, span } = cameraWindow(zoom);

  // Sample the composition linearly across the visible window.
  const samples: Sample[] = new Array(SAMPLES + 1);
  for (let i = 0; i <= SAMPLES; i++) {
    const year = start + (i / SAMPLES) * span;
    const comp = { ...getDietData(year) };
    const sum = Object.values(comp).reduce((a, v) => a + v, 0) || 1;
    (Object.keys(comp) as (keyof DietComposition)[]).forEach((k) => {
      comp[k] = (comp[k] / sum) * 100;
    });
    samples[i] = { fx: i / SAMPLES, comp };
  }

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const graphH = h * heightRatio;
  const top = h - graphH;

  const cumulativeBelow = new Array(samples.length).fill(0);

  for (const cat of STACK_ORDER) {
    const color = getDietColor(cat);
    ctx.beginPath();
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const px = s.fx * w;
      const topFrac = (cumulativeBelow[i] + s.comp[cat]) / 100;
      const py = top + graphH * (1 - topFrac);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    for (let i = samples.length - 1; i >= 0; i--) {
      const s = samples[i];
      const px = s.fx * w;
      const py = top + graphH * (1 - cumulativeBelow[i] / 100);
      ctx.lineTo(px, py);
    }
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, top, 0, h);
    grad.addColorStop(0, withAlpha(color, 0.95));
    grad.addColorStop(1, withAlpha(color, 0.78));
    ctx.fillStyle = grad;
    ctx.fill();

    for (let i = 0; i < samples.length; i++) cumulativeBelow[i] += samples[i].comp[cat];
  }

  // "NOW" marker — the present is always pinned to the right edge.
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(255,255,255,0.9)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(w - 1, top);
  ctx.lineTo(w - 1, h);
  ctx.stroke();

  ctx.restore();
}

// Convert a #rrggbb hex to an rgba() string with the given alpha.
function withAlpha(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default StreamGraph;
