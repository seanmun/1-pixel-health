import { useEffect, useRef } from 'react';
import { render } from './journey/StreamGraph';

/**
 * The picture X, Facebook and LinkedIn show when the site is shared: the whole
 * linear graph with a few words over it. Not part of the site's navigation; it
 * is opened at /?share-card and photographed by tools/share/card.cjs, which
 * saves public/share.png (1200 x 630, the size those sites expect).
 */
const ShareCard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 1200 * dpr;
    canvas.height = 330 * dpr;
    render(canvas.getContext('2d')!, { w: 1200, h: 330, dpr }, 0, 1);
  }, []);
  return (
    <div className="relative h-[630px] w-[1200px] overflow-hidden bg-[#05050a] font-sans">
      <canvas ref={canvasRef} className="absolute bottom-0 left-0 h-[330px] w-[1200px]" />
      <div className="absolute inset-x-0 bottom-0 h-[330px] bg-gradient-to-b from-[#05050a]/35 via-transparent to-transparent" />
      <div className="absolute left-16 top-12">
        <div className="text-[17px] font-semibold uppercase tracking-[0.4em] text-white/55">Human Diet</div>
        <h1 className="mt-3 text-[84px] font-extrabold leading-[1.02] text-white">
          300,000 years{' '}
          <span className="bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#FF5DA2] bg-clip-text text-transparent">
            of eating
          </span>
        </h1>
        <p className="mt-4 max-w-[900px] text-[29px] leading-snug text-white/75">
          For nearly all of human history we ate the same way. Then, in the last sliver of the timeline, everything
          changed.
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-[150px] text-center text-[34px] font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">
        ≈ 300,000 years of essentially one diet
      </div>
      <div className="absolute bottom-[86px] right-6 text-[24px] font-bold uppercase tracking-[0.12em] text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.6)]">
        All the change is in here →
      </div>
      <div className="absolute bottom-6 left-16 text-[22px] font-medium text-white/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.6)]">
        Every year drawn the same width · human-diet.com
      </div>
    </div>
  );
};

export default ShareCard;
