import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import type { GreekLetter, Point, Stroke } from '../../../data/alphabet/letterData';
import { CANVAS_SIZE } from '../../../data/alphabet/letterData';
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';

const POINTS_PER_FRAME = 2;
const FRAME_MS = 80;
const PAUSE_AFTER_MS = 900;

/** Densely interpolate a polyline so the animation looks smooth. */
function interpolateStroke(stroke: Stroke, density = 8): Stroke {
  if (stroke.length < 2) return stroke;
  const result: Point[] = [stroke[0]];
  for (let i = 0; i < stroke.length - 1; i++) {
    const a = stroke[i];
    const b = stroke[i + 1];
    const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / density));
    for (let j = 1; j <= steps; j++) {
      const t = j / steps;
      result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return result;
}

/** Build a Skia path from the first `count` points across all strokes. */
function buildAnimatedPath(
  strokes: Stroke[],
  count: number,
): ReturnType<typeof Skia.Path.Make> {
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

type Props = {
  letter: GreekLetter;
  onComplete: () => void;
};

export function WatchItWriteStep({ letter, onComplete }: Props): React.JSX.Element {
  const animStrokes = useMemo(
    () => letter.strokes.map((s) => interpolateStroke(s)),
    [letter],
  );
  const totalPoints = useMemo(
    () => animStrokes.reduce((sum, s) => sum + s.length, 0),
    [animStrokes],
  );

  const [revealed, setRevealed] = useState(0);
  const done = revealed >= totalPoints;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset when letter changes
  useEffect(() => {
    setRevealed(0);
    return (): void => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [letter]);

  // Run animation
  useEffect(() => {
    if (done) return;
    intervalRef.current = setInterval(() => {
      setRevealed((prev) => {
        const next = prev + POINTS_PER_FRAME;
        if (next >= totalPoints) {
          if (intervalRef.current !== null) clearInterval(intervalRef.current);
          return totalPoints;
        }
        return next;
      });
    }, FRAME_MS);
    return (): void => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [done, totalPoints, letter]);

  // Auto-advance after pause
  useEffect(() => {
    if (!done) return;
    timeoutRef.current = setTimeout(() => {
      onCompleteRef.current();
    }, PAUSE_AFTER_MS);
    return (): void => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [done]);

  const animPath = useMemo(
    () => buildAnimatedPath(animStrokes, revealed),
    [animStrokes, revealed],
  );

  // Ghost path (full letter, light gray)
  const ghostPath = useMemo(() => {
    const p = Skia.Path.Make();
    for (const stroke of letter.strokes) {
      if (stroke.length === 0) continue;
      p.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        p.lineTo(stroke[i].x, stroke[i].y);
      }
    }
    return p;
  }, [letter]);

  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>Watch It Write</Text>
      <Text style={styles.char}>{letter.char}</Text>

      <View style={styles.canvasWrapper}>
        <Canvas style={styles.canvas}>
          {/* Ghost template */}
          <Path
            path={ghostPath}
            color="#E2E8F0"
            style="stroke"
            strokeWidth={18}
            strokeCap="round"
            strokeJoin="round"
          />
          {/* Animated stroke */}
          <Path
            path={animPath}
            color={colors.oceanBlue}
            style="stroke"
            strokeWidth={18}
            strokeCap="round"
            strokeJoin="round"
          />
        </Canvas>
      </View>

      <Text style={styles.hint}>
        {done ? '✓ Done!' : 'Watch carefully…'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.screen,
    gap: spacing.lg,
  },
  stepLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  char: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
  canvasWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.cloudWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
  hint: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
  },
});
