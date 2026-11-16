import { useEffect, useRef } from 'react';
import { MotionValue } from 'framer-motion';
import { createWorld } from './world';

interface WorldSceneProps {
  /** Journey progress in [0,1]. */
  progress: MotionValue<number>;
  /** Called once if WebGL can't be initialised, so the parent can fall back. */
  onUnavailable: () => void;
}

/** Full-bleed three.js canvas for the walking world. */
const WorldScene = ({ progress, onUnavailable }: WorldSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onUnavailableRef = useRef(onUnavailable);
  onUnavailableRef.current = onUnavailable;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let world;
    try {
      world = createWorld(canvas);
    } catch {
      onUnavailableRef.current();
      return;
    }
    world.setProgress(progress.get());
    const unsub = progress.on('change', world.setProgress);
    return () => {
      unsub();
      world.dispose();
    };
  }, [progress]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ display: 'block' }} />
  );
};

export default WorldScene;
