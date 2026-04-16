/**
 * Letter Race — Boss Challenge.
 * A letter name is shown; the player must write the correct character from memory.
 * Each round: 8 seconds to draw, then accuracy is scored.
 * 12 rounds (Α–Μ in random order).
 * Stars: avg accuracy ≥80% → 3, ≥55% → 2, else 1.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Canvas, Path } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../app/navigationTypes';
import { GREEK_LETTERS, CANVAS_SIZE } from '../../data/alphabet/letterData';
import type { GreekLetter } from '../../data/alphabet/letterData';
import { getLevelsForIsland } from '../../data/islands/levelConfig';
import type { IslandId } from '../../data/islands/islandConfig';
import { useTracingCanvas } from '../letterLab/hooks/useTracingCanvas';
import { calculateTraceAccuracy, scoreToStars } from '../letterLab/utils/traceAccuracy';
import {
  saveGameProgress,
  loadGameProgress,
} from '../../shared/services/gameProgressCache';
import { buildPathFromStrokes } from '../../shared/utils/skiaPathBuilder';
import { finishGame } from '../../shared/utils/finishGame';
import { useExitConfirmation } from '../../shared/hooks/useExitConfirmation';
import { useAuthStore } from '../../shared/stores/authStore';
import { colors } from '../../app/theme/colors';
import { spacing } from '../../app/theme/spacing';
import { typography } from '../../app/theme/typography';
import { gameStyles } from '../../app/theme/gameStyles';

type Props = NativeStackScreenProps<PlayerStackParamList, 'LetterRace'>;

const TIME_PER_ROUND = 8;

type Phase = 'drawing' | 'result';

const LETTER_BY_ID = new Map<string, GreekLetter>(GREEK_LETTERS.map((l) => [l.id, l]));

export function LetterRaceScreen({ route, navigation }: Props): React.JSX.Element {
  const { islandId, levelId } = route.params;
  const levelName =
    getLevelsForIsland(islandId as IslandId).find((l) => l.id === levelId)?.name ?? levelId;
  const studentProfile = useAuthStore((s) => s.studentProfile);
  const profileId = studentProfile?.id ?? 'guest';

  const freshLetterIds = useMemo(
    () => [...GREEK_LETTERS].sort(() => Math.random() - 0.5).map((l) => l.id),
    [],
  );

  const [letterIds, setLetterIds] = useState<string[]>(freshLetterIds);
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('drawing');
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [roundAccuracy, setRoundAccuracy] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const { strokes, gesture, reset, isEmpty } = useTracingCanvas();

  const letters = useMemo(
    () => letterIds.map((id) => LETTER_BY_ID.get(id)).filter((l): l is GreekLetter => l !== undefined),
    [letterIds],
  );
  const total = letters.length;
  const letter = letters[roundIndex] ?? GREEK_LETTERS[0];

  // Restore or offer resume on mount
  useEffect(() => {
    loadGameProgress('letterRace', levelId, profileId).then((saved) => {
      if (saved && saved.letterIds.length > 0 && saved.roundIndex > 0) {
        Alert.alert(
          'Resume game?',
          'You have an unfinished game. Would you like to continue or start fresh?',
          [
            {
              text: 'Start Fresh',
              onPress: (): void => {
                import('../../shared/services/gameProgressCache')
                  .then(({ clearGameProgress }) =>
                    clearGameProgress('letterRace', levelId, profileId),
                  )
                  .finally(() => setLoading(false));
              },
            },
            {
              text: 'Continue',
              style: 'default',
              onPress: (): void => {
                setLetterIds(saved.letterIds);
                setRoundIndex(saved.roundIndex);
                setScores(saved.scores);
                setLoading(false);
              },
            },
          ],
          { cancelable: false },
        );
      } else {
        setLoading(false);
      }
    });
  }, [levelId, profileId]);

  const handleSave = useCallback((): void => {
    saveGameProgress('letterRace', levelId, profileId, {
      letterIds,
      roundIndex,
      scores,
    }).catch(() => {});
  }, [letterIds, roundIndex, scores, levelId, profileId]);

  const handleExit = useExitConfirmation(navigation, handleSave);

  const userPath = useMemo(() => buildPathFromStrokes(strokes), [strokes]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const submitRound = useCallback((): void => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    const accuracy = isEmpty ? 0 : calculateTraceAccuracy(letter.strokes, strokes);
    setRoundAccuracy(accuracy);
    setPhase('result');
  }, [isEmpty, letter, strokes]);

  useEffect(() => {
    if (phase !== 'drawing') return;
    setTimeLeft(TIME_PER_ROUND);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return (): void => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [phase, roundIndex, submitRound]);

  const handleFinishGame = useCallback(
    async (allScores: number[]): Promise<void> => {
      const avg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      const stars = scoreToStars(avg);
      await finishGame({
        game: 'letterRace',
        levelId,
        profileId,
        studentProfileId: studentProfile?.id,
        islandId,
        stars,
        bestScore: avg,
        setSaving,
        onComplete: () =>
          navigation.replace('Results', { stars, levelName, islandId, levelId }),
      });
    },
    [studentProfile, islandId, levelId, levelName, profileId, navigation],
  );

  function handleNext(): void {
    const newScores = [...scores, roundAccuracy];
    setScores(newScores);
    const next = roundIndex + 1;
    if (next >= total) {
      handleFinishGame(newScores).catch(() => {});
    } else {
      const nextIndex = next;
      setRoundIndex(nextIndex);
      setPhase('drawing');
      reset();
      saveGameProgress('letterRace', levelId, profileId, {
        letterIds,
        roundIndex: nextIndex,
        scores: newScores,
      }).catch(() => {});
    }
  }

  const resultEmoji = roundAccuracy >= 80 ? '🌟' : roundAccuracy >= 50 ? '👍' : '💪';

  if (loading || saving) {
    return (
      <SafeAreaView style={gameStyles.container}>
        <ActivityIndicator size="large" color={colors.oceanBlue} style={gameStyles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={gameStyles.container} edges={['top', 'bottom']}>
      <View style={gameStyles.header}>
        <View style={gameStyles.headerRow}>
          <Pressable
            style={gameStyles.exitBtn}
            onPress={handleExit}
            accessibilityRole="button"
            accessibilityLabel="Save and exit">
            <Text style={gameStyles.exitText}>✕</Text>
          </Pressable>
          <Text style={gameStyles.title}>Letter Race 👑</Text>
          <View style={gameStyles.exitBtn} />
        </View>
        <Text style={gameStyles.subtitle}>
          {roundIndex + 1} / {total}
        </Text>
        <View style={gameStyles.progressTrack}>
          <View
            style={[gameStyles.progressFill, { width: `${((roundIndex + 1) / total) * 100}%` }]}
          />
        </View>
      </View>

      <View style={styles.body}>
        {phase === 'drawing' ? (
          <>
            <View style={styles.promptRow}>
              <Text style={styles.prompt}>Write:</Text>
              <Text style={styles.letterName}>{letter.name}</Text>
              <Text style={styles.greekName}>{letter.greekName}</Text>
            </View>

            <View style={[styles.timer, timeLeft <= 3 && styles.timerUrgent]}>
              <Text style={[styles.timerText, timeLeft <= 3 && styles.timerTextUrgent]}>
                {timeLeft}s
              </Text>
            </View>

            <GestureDetector gesture={gesture}>
              <View style={[gameStyles.canvasWrapper, gameStyles.canvasWrapperBordered]}>
                <Canvas style={styles.canvas}>
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

            <View style={gameStyles.row}>
              <Pressable
                style={({ pressed }) => [gameStyles.btnSecondary, pressed && gameStyles.btnPressed]}
                onPress={reset}
                accessibilityRole="button"
                accessibilityLabel="Clear">
                <Text style={gameStyles.btnSecondaryText}>Clear</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  gameStyles.btn,
                  isEmpty && gameStyles.btnDisabled,
                  pressed && !isEmpty && gameStyles.btnPressed,
                ]}
                onPress={isEmpty ? undefined : submitRound}
                accessibilityRole="button"
                accessibilityLabel="Submit"
                accessibilityState={{ disabled: isEmpty }}>
                <Text style={gameStyles.btnText}>Submit ✓</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.resultEmoji}>{resultEmoji}</Text>
            <Text style={styles.revealLabel}>The letter was</Text>
            <Text style={styles.revealChar}>{letter.char}</Text>
            <Text style={styles.revealName}>{letter.greekName}</Text>
            <Text style={styles.accuracyText}>{roundAccuracy}% accuracy</Text>

            <Pressable
              style={({ pressed }) => [gameStyles.btn, pressed && gameStyles.btnPressed]}
              onPress={handleNext}
              accessibilityRole="button"
              accessibilityLabel={roundIndex + 1 >= total ? 'Finish' : 'Next letter'}>
              <Text style={gameStyles.btnText}>
                {roundIndex + 1 >= total ? 'Finish 🏁' : 'Next →'}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
    gap: spacing.md,
  },

  promptRow: {
    alignItems: 'center',
    gap: 2,
  },
  prompt: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  letterName: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
  greekName: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
  },

  timer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: colors.oceanBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerUrgent: {
    borderColor: colors.error,
  },
  timerText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
  timerTextUrgent: {
    color: colors.error,
  },

  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },

  resultEmoji: { fontSize: 56 },
  revealLabel: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
  },
  revealChar: {
    fontSize: 100,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    lineHeight: 116,
  },
  revealName: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.semibold,
    color: colors.oceanBlue,
  },
  accuracyText: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
    marginBottom: spacing.sm,
  },
});
