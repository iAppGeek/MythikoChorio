import { useState, useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { Point, Stroke } from '../../../data/alphabet/letterData';

type TracingCanvasResult = {
  strokes: Stroke[];
  gesture: ReturnType<typeof Gesture.Pan>;
  reset: () => void;
  isEmpty: boolean;
};

/**
 * Tracks pan gesture input for a Skia tracing canvas.
 * Each finger-down → finger-up cycle becomes one stroke.
 *
 * Gesture callbacks run as worklets on the UI thread (RNGH v2 + New Architecture),
 * so state updates must be dispatched back to the JS thread via runOnJS.
 */
export function useTracingCanvas(): TracingCanvasResult {
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  const reset = useCallback((): void => {
    setStrokes([]);
  }, []);

  const beginStroke = useCallback((x: number, y: number): void => {
    const p: Point = { x, y };
    setStrokes((prev) => [...prev, [p]]);
  }, []);

  const appendPoint = useCallback((x: number, y: number): void => {
    const p: Point = { x, y };
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      next[next.length - 1] = [...next[next.length - 1], p];
      return next;
    });
  }, []);

  const gesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      runOnJS(beginStroke)(e.x, e.y);
    })
    .onChange((e) => {
      runOnJS(appendPoint)(e.x, e.y);
    });

  return { strokes, gesture, reset, isEmpty: strokes.length === 0 };
}
