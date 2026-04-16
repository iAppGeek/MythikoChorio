import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Canvas, Path } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import type { GreekLetter } from '../../../data/alphabet/letterData';
import { CANVAS_SIZE } from '../../../data/alphabet/letterData';
import { useTracingCanvas } from '../hooks/useTracingCanvas';
import { buildPathFromStrokes } from '../../../shared/utils/skiaPathBuilder';
import { colors } from '../../../app/theme/colors';
import { typography } from '../../../app/theme/typography';
import { gameStyles } from '../../../app/theme/gameStyles';

type Props = {
  letter: GreekLetter;
  onComplete: () => void;
};

export function FreeWriteStep({ letter, onComplete }: Props): React.JSX.Element {
  const { strokes, gesture, reset, isEmpty } = useTracingCanvas();
  const userPath = useMemo(() => buildPathFromStrokes(strokes), [strokes]);

  return (
    <View style={gameStyles.stepBody}>
      <Text style={gameStyles.stepLabel}>Free Write</Text>
      <Text style={styles.prompt}>
        Now write <Text style={styles.char}>{letter.char}</Text> on your own!
      </Text>

      <GestureDetector gesture={gesture}>
        <View style={[gameStyles.canvasWrapper, gameStyles.canvasWrapperBordered]}>
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
          onPress={isEmpty ? undefined : onComplete}
          accessibilityRole="button"
          accessibilityLabel="Continue to next step"
          accessibilityState={{ disabled: isEmpty }}>
          <Text style={gameStyles.btnText}>Next →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: {
    fontSize: typography.fontSize.body,
    color: colors.oceanBlue,
    textAlign: 'center',
  },
  char: {
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
});
