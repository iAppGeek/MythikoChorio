import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../app/navigationTypes';
import { GREEK_LETTERS } from '../../data/alphabet/letterData';
import { getLevelsForIsland } from '../../data/islands/levelConfig';
import type { IslandId } from '../../data/islands/islandConfig';
import { MeetTheLetterStep } from './steps/MeetTheLetterStep';
import { WatchItWriteStep } from './steps/WatchItWriteStep';
import { GuidedTraceStep } from './steps/GuidedTraceStep';
import { FreeWriteStep } from './steps/FreeWriteStep';
import { LetterChallengeStep } from './steps/LetterChallengeStep';
import { scoreToStars } from './utils/traceAccuracy';
import { upsertLevelProgress } from '../../shared/services/progressService';
import {
  saveGameProgress,
  loadGameProgress,
  clearGameProgress,
} from '../../shared/services/gameProgressCache';
import { useAuthStore } from '../../shared/stores/authStore';
import { colors } from '../../app/theme/colors';
import { spacing } from '../../app/theme/spacing';
import { typography } from '../../app/theme/typography';

type Props = NativeStackScreenProps<PlayerStackParamList, 'LetterLab'>;

type StepType = 'meet' | 'watch' | 'trace' | 'free' | 'challenge';

const STEPS_BY_LEVEL: Record<string, StepType[]> = {
  alpha_meet_letters: ['meet', 'watch', 'challenge'],
  alpha_trace_letters: ['meet', 'watch', 'trace', 'free', 'challenge'],
};

const DEFAULT_STEPS: StepType[] = ['meet', 'watch', 'challenge'];

export function LetterLabScreen({ route, navigation }: Props): React.JSX.Element {
  const { islandId, levelId } = route.params;
  const steps = STEPS_BY_LEVEL[levelId] ?? DEFAULT_STEPS;
  const levelName =
    getLevelsForIsland(islandId as IslandId).find((l) => l.id === levelId)?.name ?? levelId;

  const studentProfile = useAuthStore((s) => s.studentProfile);
  const profileId = studentProfile?.id ?? 'guest';

  const [letterIndex, setLetterIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const scoresRef = useRef<number[]>([]);
  const letterScoresRef = useRef<number[]>([]);

  // Restore saved progress on mount — offer resume if past letter 0
  useEffect(() => {
    loadGameProgress('letterLab', levelId, profileId).then((saved) => {
      if (saved && saved.letterIndex > 0) {
        Alert.alert(
          'Resume game?',
          'You have an unfinished game. Would you like to continue or start fresh?',
          [
            {
              text: 'Start Fresh',
              onPress: (): void => {
                clearGameProgress('letterLab', levelId, profileId).finally(() =>
                  setLoading(false),
                );
              },
            },
            {
              text: 'Continue',
              style: 'default',
              onPress: (): void => {
                setLetterIndex(saved.letterIndex);
                setStepIndex(saved.stepIndex);
                scoresRef.current = saved.scores;
                letterScoresRef.current = saved.letterScores;
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

  const persistProgress = useCallback(
    (li: number, si: number): void => {
      saveGameProgress('letterLab', levelId, profileId, {
        letterIndex: li,
        stepIndex: si,
        scores: scoresRef.current,
        letterScores: letterScoresRef.current,
      }).catch(() => {});
    },
    [levelId, profileId],
  );

  const handleExit = useCallback((): void => {
    Alert.alert('Save & Exit', 'Your progress has been saved. Continue later?', [
      { text: 'Keep Playing', style: 'cancel' },
      {
        text: 'Exit',
        style: 'destructive',
        onPress: (): void => {
          persistProgress(letterIndex, stepIndex);
          navigation.goBack();
        },
      },
    ]);
  }, [letterIndex, stepIndex, persistProgress, navigation]);

  const letter = GREEK_LETTERS[letterIndex];
  const currentStep = steps[stepIndex];

  const finishLevel = useCallback(async (): Promise<void> => {
    setSaving(true);
    const allScores = scoresRef.current;
    const avgScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 100;
    const stars = scoreToStars(avgScore);

    await clearGameProgress('letterLab', levelId, profileId);

    if (studentProfile) {
      try {
        await upsertLevelProgress({
          studentProfileId: studentProfile.id,
          islandId,
          levelId,
          starsEarned: stars,
          bestScore: avgScore,
        });
      } catch {
        // Non-fatal
      }
    }

    setSaving(false);
    navigation.replace('Results', { stars, levelName, islandId, levelId });
  }, [studentProfile, islandId, levelId, levelName, profileId, navigation]);

  const advanceStep = useCallback(
    (score?: number): void => {
      if (score !== undefined) {
        letterScoresRef.current.push(score);
      }

      const nextStepIndex = stepIndex + 1;

      if (nextStepIndex >= steps.length) {
        const ls = letterScoresRef.current;
        const letterAvg =
          ls.length > 0
            ? Math.round(ls.reduce((a, b) => a + b, 0) / ls.length)
            : 100;
        scoresRef.current.push(letterAvg);
        letterScoresRef.current = [];

        const nextLetterIndex = letterIndex + 1;
        if (nextLetterIndex >= GREEK_LETTERS.length) {
          finishLevel().catch(() => {});
        } else {
          setLetterIndex(nextLetterIndex);
          setStepIndex(0);
          persistProgress(nextLetterIndex, 0);
        }
      } else {
        setStepIndex(nextStepIndex);
        persistProgress(letterIndex, nextStepIndex);
      }
    },
    [stepIndex, steps.length, letterIndex, finishLevel, persistProgress],
  );

  if (loading || saving) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.oceanBlue} style={styles.loader} />
      </SafeAreaView>
    );
  }

  const progressText = `${letter.char} · ${letterIndex + 1} / ${GREEK_LETTERS.length}`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.exitBtn}
            onPress={handleExit}
            accessibilityRole="button"
            accessibilityLabel="Save and exit">
            <Text style={styles.exitText}>✕</Text>
          </Pressable>
          <Text style={styles.progress}>{progressText}</Text>
          {/* Spacer to centre the progress text */}
          <View style={styles.exitBtn} />
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((letterIndex + 1) / GREEK_LETTERS.length) * 100}%` },
            ]}
          />
        </View>
        <View style={styles.stepDots}>
          {steps.map((s, i) => (
            <View key={s} style={[styles.dot, i <= stepIndex && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.stepContainer} key={`${letterIndex}-${stepIndex}`}>
        {currentStep === 'meet' && (
          <MeetTheLetterStep letter={letter} onComplete={() => advanceStep()} />
        )}
        {currentStep === 'watch' && (
          <WatchItWriteStep letter={letter} onComplete={() => advanceStep()} />
        )}
        {currentStep === 'trace' && (
          <GuidedTraceStep letter={letter} onComplete={(acc) => advanceStep(acc)} />
        )}
        {currentStep === 'free' && (
          <FreeWriteStep letter={letter} onComplete={() => advanceStep()} />
        )}
        {currentStep === 'challenge' && (
          <LetterChallengeStep
            letter={letter}
            onComplete={(correct) => advanceStep(correct ? 100 : 0)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.softSand,
  },
  loader: {
    flex: 1,
  },

  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exitBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitText: {
    fontSize: 18,
    color: '#8A9BAB',
    fontWeight: typography.fontWeight.medium,
  },
  progress: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.sunshineYellow,
    borderRadius: 3,
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    backgroundColor: colors.oceanBlue,
  },
  stepContainer: {
    flex: 1,
  },
});
