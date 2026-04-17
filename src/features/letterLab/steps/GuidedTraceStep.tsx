import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Canvas, Path } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import type { GreekLetter } from '../../../data/alphabet/letterData';
import { CANVAS_SIZE } from '../../../data/alphabet/letterData';
import { useTracingCanvas } from '../../../shared/hooks/useTracingCanvas';
import { calculateTraceAccuracy } from '../../../shared/utils/traceAccuracy';
import { buildPathFromStrokes } from '../../../shared/utils/skiaPathBuilder';
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';
import { gameStyles } from '../../../app/theme/gameStyles';

type Props = {
  letter: GreekLetter;
  onComplete: (accuracy: number) => void;
};

type Phase = 'tracing' | 'result';

export function GuidedTraceStep({ letter, onComplete }: Props): React.JSX.Element {
  const { strokes, gesture, reset, isEmpty } = useTracingCanvas();
  const [phase, setPhase] = useState<Phase>('tracing');
  const [accuracy, setAccuracy] = useState(0);

  const ghostPath = useMemo(() => buildPathFromStrokes(letter.strokes), [letter]);
  const userPath = useMemo(() => buildPathFromStrokes(strokes), [strokes]);

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
    <View style={gameStyles.stepBody}>
      <Text style={gameStyles.stepLabel}>Guided Trace</Text>
      <Text style={styles.char}>{letter.char}</Text>

      <GestureDetector gesture={gesture}>
        <View style={gameStyles.canvasWrapper}>
          <Canvas style={styles.canvas}>
            {/* Ghost template */}
            <Path
              path={ghostPath}
              color={colors.border}
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
        <View style={gameStyles.row}>
          <Pressable
            style={({ pressed }) => [gameStyles.btnSecondary, pressed && gameStyles.btnPressed]}
            onPress={reset}
            accessibilityRole="button"
            accessibilityLabel="Clear canvas">
            <Text style={gameStyles.btnSecondaryText}>Clear</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              gameStyles.btn,
              isEmpty && gameStyles.btnDisabled,
              pressed && !isEmpty && gameStyles.btnPressed,
            ]}
            onPress={isEmpty ? undefined : handleDone}
            accessibilityRole="button"
            accessibilityLabel="Check my tracing"
            accessibilityState={{ disabled: isEmpty }}>
            <Text style={gameStyles.btnText}>Done ✓</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.resultBox}>
          <Text style={styles.resultEmoji}>{resultEmoji}</Text>
          <Text style={styles.resultMsg}>{resultMsg}</Text>
          <Text style={styles.resultScore}>{accuracy}% covered</Text>
          <View style={gameStyles.row}>
            <Pressable
              style={({ pressed }) => [gameStyles.btnSecondary, pressed && gameStyles.btnPressed]}
              onPress={handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Try again">
              <Text style={gameStyles.btnSecondaryText}>Try again</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [gameStyles.btn, pressed && gameStyles.btnPressed]}
              onPress={() => onComplete(accuracy)}
              accessibilityRole="button"
              accessibilityLabel="Continue to next step">
              <Text style={gameStyles.btnText}>Next →</Text>
            </Pressable>
          </View>
        </View>
      )}
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
