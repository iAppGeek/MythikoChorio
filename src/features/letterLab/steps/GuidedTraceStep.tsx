import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import type { GreekLetter } from '../../../data/alphabet/letterData';
import { CANVAS_SIZE } from '../../../data/alphabet/letterData';
import { useTracingCanvas } from '../hooks/useTracingCanvas';
import { calculateTraceAccuracy } from '../utils/traceAccuracy';
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';

type Props = {
  letter: GreekLetter;
  onComplete: (accuracy: number) => void;
};

type Phase = 'tracing' | 'result';

export function GuidedTraceStep({ letter, onComplete }: Props): React.JSX.Element {
  const { strokes, gesture, reset, isEmpty } = useTracingCanvas();
  const [phase, setPhase] = useState<Phase>('tracing');
  const [accuracy, setAccuracy] = useState(0);

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

  const userPath = useMemo(() => {
    const p = Skia.Path.Make();
    for (const stroke of strokes) {
      if (stroke.length === 0) continue;
      p.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        p.lineTo(stroke[i].x, stroke[i].y);
      }
    }
    return p;
  }, [strokes]);

  function handleDone(): void {
    const score = calculateTraceAccuracy(letter.strokes, strokes);
    setAccuracy(score);
    setPhase('result');
  }

  function handleRetry(): void {
    reset();
    setPhase('tracing');
    setAccuracy(0);
  }

  const resultEmoji = accuracy >= 80 ? '🌟' : accuracy >= 50 ? '👍' : '💪';
  const resultMsg =
    accuracy >= 80
      ? 'Amazing tracing!'
      : accuracy >= 50
        ? 'Good job!'
        : 'Keep practising!';

  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>Guided Trace</Text>
      <Text style={styles.char}>{letter.char}</Text>

      <GestureDetector gesture={gesture}>
        <View style={styles.canvasWrapper}>
          <Canvas style={styles.canvas}>
            {/* Ghost template */}
            <Path
              path={ghostPath}
              color="#E2E8F0"
              style="stroke"
              strokeWidth={20}
              strokeCap="round"
              strokeJoin="round"
            />
            {/* User trace */}
            <Path
              path={userPath}
              color={colors.terracotta}
              style="stroke"
              strokeWidth={14}
              strokeCap="round"
              strokeJoin="round"
            />
          </Canvas>
        </View>
      </GestureDetector>

      {phase === 'tracing' ? (
        <View style={styles.row}>
          <Pressable
            style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnPressed]}
            onPress={reset}
            accessibilityRole="button"
            accessibilityLabel="Clear canvas">
            <Text style={styles.btnSecondaryText}>Clear</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              isEmpty && styles.btnDisabled,
              pressed && !isEmpty && styles.btnPressed,
            ]}
            onPress={isEmpty ? undefined : handleDone}
            accessibilityRole="button"
            accessibilityLabel="Check my tracing"
            accessibilityState={{ disabled: isEmpty }}>
            <Text style={styles.btnText}>Done ✓</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.resultBox}>
          <Text style={styles.resultEmoji}>{resultEmoji}</Text>
          <Text style={styles.resultMsg}>{resultMsg}</Text>
          <Text style={styles.resultScore}>{accuracy}% covered</Text>
          <View style={styles.row}>
            <Pressable
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnPressed]}
              onPress={handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Try again">
              <Text style={styles.btnSecondaryText}>Try again</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
              onPress={() => onComplete(accuracy)}
              accessibilityRole="button"
              accessibilityLabel="Continue to next step">
              <Text style={styles.btnText}>Next →</Text>
            </Pressable>
          </View>
        </View>
      )}
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btn: {
    backgroundColor: colors.oceanBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnPressed: {
    opacity: 0.75,
  },
  btnText: {
    color: colors.cloudWhite,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.oceanBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: colors.oceanBlue,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  resultBox: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultEmoji: {
    fontSize: 48,
  },
  resultMsg: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
  resultScore: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
    marginBottom: spacing.sm,
  },
});
