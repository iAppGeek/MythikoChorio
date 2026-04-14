/**
 * Shared Skia path construction from stroke point arrays.
 * Used by GuidedTraceStep, FreeWriteStep, WatchItWriteStep, LetterRaceScreen.
 */
import { Skia } from '@shopify/react-native-skia';
import type { SkPath } from '@shopify/react-native-skia';

type Point = { x: number; y: number };

/** Build a Skia path from an array of stroke point arrays. */
export function buildPathFromStrokes(strokes: readonly Point[][]): SkPath {
  const p = Skia.Path.Make();
  for (const stroke of strokes) {
    if (stroke.length === 0) continue;
    p.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i++) {
      p.lineTo(stroke[i].x, stroke[i].y);
    }
  }
  return p;
}

/**
 * Build a Skia path from the first `count` points across all strokes.
 * Used for stroke-by-stroke animation in WatchItWriteStep.
 */
export function buildAnimatedPath(
  strokes: readonly Point[][],
  count: number,
): SkPath {
  const skPath = Skia.Path.Make();
  let remaining = count;

  for (const stroke of strokes) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, stroke.length);
    if (take > 0) {
      skPath.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < take; i++) {
        skPath.lineTo(stroke[i].x, stroke[i].y);
      }
    }
    remaining -= stroke.length;
  }

  return skPath;
}
