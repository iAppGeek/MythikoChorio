import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import type { GreekLetter } from '../../../data/alphabet/letterData';
import { CANVAS_SIZE } from '../../../data/alphabet/letterData';
import { useTracingCanvas } from '../hooks/useTracingCanvas';
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';

type Props = {
  letter: GreekLetter;
  onComplete: () => void;
};

export function FreeWriteStep({ letter, onComplete }: Props): React.JSX.Element {
  const { strokes, gesture, reset, isEmpty } = useTracingCanvas();

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

  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>Free Write</Text>
      <Text style={styles.prompt}>
        Now write <Text style={styles.char}>{letter.char}</Text> on your own!
      </Text>

      <GestureDetector gesture={gesture}>
        <View style={styles.canvasWrapper}>
          <Canvas style={styles.canvas}>
            <Path
              path={userPath}
              color={colors.oliveGreen}
              style="stroke"
              strokeWidth={14}
              strokeCap="round"
              strokeJoin="round"
            />
          </Canvas>
        </View>
      </GestureDetector>

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
          onPress={isEmpty ? undefined : onComplete}
          accessibilityRole="button"
          accessibilityLabel="Continue to next step"
          accessibilityState={{ disabled: isEmpty }}>
          <Text style={styles.btnText}>Next →</Text>
        </Pressable>
      </View>
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
  prompt: {
    fontSize: typography.fontSize.body,
    color: colors.oceanBlue,
    textAlign: 'center',
  },
  char: {
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
  canvasWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.cloudWhite,
    borderWidth: 2,
    borderColor: '#E2E8F0',
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
});
