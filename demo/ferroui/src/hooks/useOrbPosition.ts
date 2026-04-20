import { useCallback, useRef } from 'react';
import { useMotionValue, useAnimation } from 'framer-motion';

const ORB_SIZE = 64; // px
const CORNER_PADDING = 24; // px from edge

export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface CornerPosition {
  x: number;
  y: number;
  corner: Corner;
}

/**
 * Returns the x/y coordinates (from top-left of viewport) for each corner.
 */
function getCornerPositions(): CornerPosition[] {
  const { innerWidth: vw, innerHeight: vh } = window;
  const pad = CORNER_PADDING;
  const orb = ORB_SIZE;
  return [
    { corner: 'top-left',     x: pad,              y: pad },
    { corner: 'top-right',    x: vw - orb - pad,   y: pad },
    { corner: 'bottom-left',  x: pad,              y: vh - orb - pad },
    { corner: 'bottom-right', x: vw - orb - pad,   y: vh - orb - pad },
  ];
}

/**
 * Scores how "clear" a corner is by checking if any layout elements overlap it.
 * Lower score = more clear.
 */
function scoreCorner(cx: number, cy: number, layoutSelector: string): number {
  const orbRect = {
    left: cx,
    top: cy,
    right: cx + ORB_SIZE + 20, // 20px buffer
    bottom: cy + ORB_SIZE + 20,
  };

  const elements = document.querySelectorAll<HTMLElement>(layoutSelector);
  let overlap = 0;

  for (const el of elements) {
    const r = el.getBoundingClientRect();
    // Check rectangle intersection
    const intersects =
      r.left < orbRect.right &&
      r.right > orbRect.left &&
      r.top < orbRect.bottom &&
      r.bottom > orbRect.top;

    if (intersects) {
      // Weight the overlap by intersection area
      const ix = Math.min(r.right, orbRect.right) - Math.max(r.left, orbRect.left);
      const iy = Math.min(r.bottom, orbRect.bottom) - Math.max(r.top, orbRect.top);
      overlap += ix * iy;
    }
  }

  return overlap;
}

/**
 * Given the current rendered layout, returns the corner with the least content overlap.
 * Falls back to 'bottom-right' if measurement fails.
 */
function findBestCorner(layoutSelector: string): CornerPosition {
  const positions = getCornerPositions();
  let best = positions[3]; // default: bottom-right
  let bestScore = Infinity;

  for (const pos of positions) {
    const score = scoreCorner(pos.x, pos.y, layoutSelector);
    if (score < bestScore) {
      bestScore = score;
      best = pos;
    }
  }

  return best;
}

/**
 * Snap x/y to the nearest corner of the viewport.
 */
function snapToNearestCorner(cx: number, cy: number): CornerPosition {
  const positions = getCornerPositions();
  let nearest = positions[0];
  let nearestDist = Infinity;

  for (const pos of positions) {
    const dist = Math.hypot(cx - pos.x, cy - pos.y);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = pos;
    }
  }

  return nearest;
}

export interface UseOrbPositionReturn {
  x: ReturnType<typeof useMotionValue<number>>;
  y: ReturnType<typeof useMotionValue<number>>;
  controls: ReturnType<typeof useAnimation>;
  onDragEnd: () => void;
  snapToBestCorner: (layoutSelector?: string) => void;
}

export function useOrbPosition(): UseOrbPositionReturn {
  const { innerWidth: vw, innerHeight: vh } = window;

  // Start centered at the bottom
  const initialX = vw / 2 - ORB_SIZE / 2;
  const initialY = vh - ORB_SIZE - CORNER_PADDING;

  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);
  const controls = useAnimation();

  // Track if the user has manually dragged (overrides auto-position once)
  const userDragged = useRef(false);

  const animateTo = useCallback(
    async (pos: CornerPosition) => {
      await controls.start({
        x: pos.x,
        y: pos.y,
        transition: {
          type: 'spring',
          stiffness: 200,
          damping: 28,
          mass: 1,
        },
      });
      // Sync motion values after animation
      x.set(pos.x);
      y.set(pos.y);
    },
    [controls, x, y]
  );

  const onDragEnd = useCallback(() => {
    userDragged.current = true;
    // Snap to the nearest corner after user releases
    const corner = snapToNearestCorner(x.get(), y.get());
    animateTo(corner);
  }, [animateTo, x, y]);

  const snapToBestCorner = useCallback(
    (layoutSelector = '[data-layout-panel]') => {
      // If user explicitly dragged, respect their last position; only auto-move once
      if (userDragged.current) return;

      // Use rAF to ensure DOM has painted before measuring
      requestAnimationFrame(() => {
        const best = findBestCorner(layoutSelector);
        animateTo(best);
      });
    },
    [animateTo]
  );

  return { x, y, controls, onDragEnd, snapToBestCorner };
}
