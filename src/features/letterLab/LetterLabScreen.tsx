import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../app/navigationTypes';
import { getLettersForIsland } from '../../data/alphabet/letterData';
import { getLevelsForIsland } from '../../data/islands/levelConfig';
import type { IslandId } from '../../data/islands/islandConfig';
import { MeetTheLetterStep } from './steps/MeetTheLetterStep';
import { WatchItWriteStep } from './steps/WatchItWriteStep';
import { GuidedTraceStep } from './steps/GuidedTraceStep';
import { FreeWriteStep } from './steps/FreeWriteStep';
import { LetterChallengeStep } from './steps/LetterChallengeStep';
import { scoreToStars } from './utils/traceAccuracy';
import {
  saveGameProgress,
  loadGameProgress,
  clearGameProgress,
} from '../../shared/services/gameProgressCache';
import { finishGame } from '../../shared/utils/finishGame';
import { useExitConfirmation } from '../../shared/hooks/useExitConfirmation';
import { useAuthStore } from '../../shared/stores/authStore';
import { colors } from '../../app/theme/colors';
import { typography } from '../../app/theme/typography';
import { gameStyles } from '../../app/theme/gameStyles';

type Props = NativeStackScreenProps<PlayerStackParamList, 'LetterLab'>;

type StepType = 'meet' | 'watch' | 'trace' | 'free' | 'challenge';

const STEPS_BY_LEVEL: Record<string, StepType[]> = {
  alpha_meet_letters: ['meet', 'watch', 'challenge'],
  alpha_trace_letters: ['meet', 'watch', 'trace', 'free', 'challenge'],
  beta_meet_letters: ['meet', 'watch', 'challenge'],
  beta_trace_letters: ['meet', 'watch', 'trace', 'free', 'challenge'],
};

const DEFAULT_STEPS: StepType[] = ['meet', 'watch', 'challenge'];

export function LetterLabScreen({ route, navigation }: Props): React.JSX.Element {
  const { islandId, levelId } = route.params;
  const steps = STEPS_BY_LEVEL[levelId] ?? DEFAULT_STEPS;
  const levelName =
    getLevelsForIsland(islandId as IslandId).find((l) => l.id === levelId)?.name ?? levelId;
  const letters = useMemo(() => getLettersForIsland(islandId), [islandId]);

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

  const handleSave = useCallback((): void => {
    persistProgress(letterIndex, stepIndex);
  }, [letterIndex, stepIndex, persistProgress]);

  const handleExit = useExitConfirmation(navigation, handleSave);

  const letter = letters[letterIndex];
  const currentStep = steps[stepIndex];

  const finishLevel = useCallback(async (): Promise<void> => {
    const allScores = scoresRef.current;
    const avgScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 100;
    const stars = scoreToStars(avgScore);

    await finishGame({
      game: 'letterLab',
      levelId,
      profileId,
      studentProfileId: studentProfile?.id,
      islandId,
      stars,
      bestScore: avgScore,
      setSaving,
      onComplete: () =>
        navigation.replace('Results', { stars, levelName, islandId, levelId }),
    });
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
        if (nextLetterIndex >= letters.length) {
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
      <SafeAreaView style={gameStyles.container}>
        <ActivityIndicator size="large" color={colors.oceanBlue} style={gameStyles.loader} />
      </SafeAreaView>
    );
  }

  const progressText = `${letter.char} · ${letterIndex + 1} / ${letters.length}`;

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
          <Text style={styles.progress}>{progressText}</Text>
          {/* Spacer to centre the progress text */}
          <View style={gameStyles.exitBtn} />
        </View>
        <View style={gameStyles.progressTrack}>
          <View
            style={[
              gameStyles.progressFill,
              { width: `${((letterIndex + 1) / letters.length) * 100}%` },
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
  progress: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
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
    backgroundColor: colors.dotInactive,
  },
  dotActive: {
    backgroundColor: colors.oceanBlue,
  },
  stepContainer: {
    flex: 1,
  },
});
