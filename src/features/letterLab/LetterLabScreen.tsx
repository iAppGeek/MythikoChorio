import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../app/navigationTypes';
import { getLettersForIsland } from '../../data/alphabet/letterData';
import type { IslandId } from '../../data/islands/islandConfig';
import { MeetTheLetterStep } from './steps/MeetTheLetterStep';
import { WatchItWriteStep } from './steps/WatchItWriteStep';
import { GuidedTraceStep } from './steps/GuidedTraceStep';
import { FreeWriteStep } from './steps/FreeWriteStep';
import { LetterChallengeStep } from './steps/LetterChallengeStep';
import { scoreToStars } from '../../shared/utils/traceAccuracy';
import {
  useGameSession,
  useResumeGame,
} from '../games/shared/useGameSession';
import { GameShell } from '../games/shared/GameShell';
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
  const letters = useMemo(
    () => getLettersForIsland(islandId as IslandId),
    [islandId],
  );

  const session = useGameSession({
    game: 'letterLab',
    islandId,
    levelId,
    navigation,
  });

  const [letterIndex, setLetterIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const scoresRef = useRef<number[]>([]);
  const letterScoresRef = useRef<number[]>([]);

  useResumeGame(
    session,
    (saved) => saved.letterIndex > 0,
    (saved) => {
      setLetterIndex(saved.letterIndex);
      setStepIndex(saved.stepIndex);
      scoresRef.current = saved.scores;
      letterScoresRef.current = saved.letterScores;
    },
  );

  const persistProgress = useCallback(
    (li: number, si: number): void => {
      session
        .save({
          letterIndex: li,
          stepIndex: si,
          scores: scoresRef.current,
          letterScores: letterScoresRef.current,
        })
        .catch(() => {});
    },
    [session],
  );

  const handleSave = useCallback((): void => {
    persistProgress(letterIndex, stepIndex);
  }, [letterIndex, stepIndex, persistProgress]);

  const handleExit = useMemo(
    () => session.makeExitHandler(handleSave),
    [session, handleSave],
  );

  const letter = letters[letterIndex];
  const currentStep = steps[stepIndex];

  const finishLevel = useCallback(async (): Promise<void> => {
    const allScores = scoresRef.current;
    const avgScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 100;
    const stars = scoreToStars(avgScore);

    await session.finish({
      stars,
      bestScore: avgScore,
      scoreDetails: {
        score: avgScore,
        accuracy: avgScore / 100,
      },
    });
  }, [session]);

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
    [stepIndex, steps.length, letterIndex, letters.length, finishLevel, persistProgress],
  );

  const progressText = letter
    ? `${letter.char} · ${letterIndex + 1} / ${letters.length}`
    : '';

  return (
    <GameShell
      title={<Text style={styles.progress}>{progressText}</Text>}
      onExit={handleExit}
      loading={session.loading}
      saving={session.saving}
      headerExtras={
        <>
          <View style={gameStyles.progressTrack}>
            <View
              style={[
                gameStyles.progressFill,
                {
                  width: `${((letterIndex + 1) / letters.length) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.stepDots}>
            {steps.map((s, i) => (
              <View
                key={s}
                style={[styles.dot, i <= stepIndex && styles.dotActive]}
              />
            ))}
          </View>
        </>
      }>
      {letter && (
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
      )}
    </GameShell>
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
