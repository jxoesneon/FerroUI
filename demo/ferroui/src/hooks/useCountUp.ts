import { useState, useEffect } from 'react';

export function useCountUp(end: number, start: number = 0, duration: number = 500, startOn: boolean = true) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!startOn) return;
    
    let startTime: number;
    let animationFrame: number;

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(start + easeProgress * (end - start));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, start, duration, startOn]);

  return count;
}
