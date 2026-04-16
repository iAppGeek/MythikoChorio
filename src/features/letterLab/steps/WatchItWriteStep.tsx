import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Path } from '@shopify/react-native-skia';
import type { GreekLetter, Point, Stroke } from '../../../data/alphabet/letterData';
import { CANVAS_SIZE } from '../../../data/alphabet/letterData';
import { buildPathFromStrokes, buildAnimatedPath } from '../../../shared/utils/skiaPathBuilder';
import { colors } from '../../../app/theme/colors';
import { typography } from '../../../app/theme/typography';
import { gameStyles } from '../../../app/theme/gameStyles';

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

  const ghostPath = useMemo(() => buildPathFromStrokes(letter.strokes), [letter]);

  return (
    <View style={gameStyles.stepBody}>
      <Text style={gameStyles.stepLabel}>Watch It Write</Text>
      <Text style={styles.char}>{letter.char}</Text>

      <View style={gameStyles.canvasWrapper}>
        <Canvas style={styles.canvas}>
          {/* Ghost template */}
          <Path
            path={ghostPath}
            color={colors.border}
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
  char: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
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
