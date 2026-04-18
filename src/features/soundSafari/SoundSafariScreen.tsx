/**
 * Sound Safari — hear a letter sound, pick the matching Greek letter.
 *
 * Phase 2: audio-first rounds with streak visuals and detailed scoring.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../app/navigationTypes';
import {
  GREEK_LETTERS,
  getLettersForIsland,
} from '../../data/alphabet/letterData';
import type { GreekLetter } from '../../data/alphabet/letterData';
import type { IslandId } from '../../data/islands/islandConfig';
import { buildShuffledOptions } from '../../shared/utils/quizHelpers';
import {
  playLetterSound,
  playSoundEffect,
} from '../../shared/services/audioService';
import {
  useGameSession,
  useResumeGame,
} from '../games/shared/useGameSession';
import { GameShell } from '../games/shared/GameShell';
import { colors } from '../../app/theme/colors';
import { spacing } from '../../app/theme/spacing';
import { typography } from '../../app/theme/typography';
import { gameStyles } from '../../app/theme/gameStyles';
import type { SoundSafariCache } from '../../shared/services/gameProgressCache';

type Props = NativeStackScreenProps<PlayerStackParamList, 'SoundSafari'>;

const ROUNDS = 10;

function shuffleIds(ids: string[]): string[] {
  const out = [...ids];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildRoundLetterIds(islandLetters: GreekLetter[]): string[] {
  const source = islandLetters.length > 0 ? islandLetters : GREEK_LETTERS;
  const pool = source.map((l) => l.id);
  if (pool.length === 0) return [];
  const unique = shuffleIds(pool);
  if (unique.length >= ROUNDS) return unique.slice(0, ROUNDS);
  const out: string[] = [];
  while (out.length < ROUNDS) {
    out.push(pool[Math.floor(Math.random() * pool.length)]!);
  }
  return out;
}

function firstTryStars(correctFirstTry: number): 1 | 2 | 3 {
  const pct = (correctFirstTry / ROUNDS) * 100;
  if (pct >= 80) return 3;
  if (pct >= 55) return 2;
  return 1;
}

function letterById(id: string): GreekLetter | undefined {
  return GREEK_LETTERS.find((l) => l.id === id);
}

function isV2Cache(saved: SoundSafariCache): boolean {
  return Array.isArray(saved.letterIdsRound) && saved.letterIdsRound.length > 0;
}

export function SoundSafariScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { islandId, levelId } = route.params;

  const session = useGameSession({
    game: 'soundSafari',
    islandId,
    levelId,
    navigation,
  });

  const islandLetters = useMemo(
    () => getLettersForIsland(islandId as IslandId),
    [islandId],
  );

  const sessionStartedAt = useRef<number>(Date.now());
  const roundStartedAt = useRef<number>(Date.now());
  const responseMsTotalRef = useRef(0);

  const [letterIdsRound, setLetterIdsRound] = useState<string[]>(() =>
    buildRoundLetterIds(islandLetters),
  );
  const [roundIndex, setRoundIndex] = useState(0);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [confusedPairs, setConfusedPairs] = useState<
    { played: string; wrongChoice: string }[]
  >([]);
  const [retryCountRound, setRetryCountRound] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakBest, setStreakBest] = useState(0);
  const [answerState, setAnswerState] = useState<'idle' | 'wrong'>('idle');
  const [chosenId, setChosenId] = useState<string | null>(null);

  const shake = useSharedValue(0);

  const letterId = letterIdsRound[roundIndex] ?? letterIdsRound[0];
  const letter =
    letterById(letterId ?? '') ??
    islandLetters[0] ??
    GREEK_LETTERS[0];

  const options = useMemo(
    () =>
      letter
        ? buildShuffledOptions(GREEK_LETTERS, letter, 3)
        : [],
    [letter],
  );

  useResumeGame(
    session,
    (saved) => isV2Cache(saved) && saved.roundIndex > 0,
    (saved) => {
      setLetterIdsRound(saved.letterIdsRound);
      setRoundIndex(saved.roundIndex);
      setCorrectFirstTry(saved.correctFirstTry);
      setConfusedPairs(saved.confusedPairs);
      responseMsTotalRef.current = saved.responseMsTotal;
      setRetryCountRound(saved.retryCountRound);
    },
  );

  useEffect(() => {
    if (session.loading || letter?.id == null) return;
    roundStartedAt.current = Date.now();
    setAnswerState('idle');
    setChosenId(null);
    setRetryCountRound(0);
    playLetterSound(letter.id);
  }, [session.loading, roundIndex, letter?.id]);

  const persist = useCallback((): void => {
    session
      .save({
        letterIdsRound,
        roundIndex,
        correctFirstTry,
        confusedPairs,
        responseMsTotal: responseMsTotalRef.current,
        roundsCompleted: Math.min(roundIndex + 1, ROUNDS),
        retryCountRound,
      })
      .catch(() => {});
  }, [
    session,
    letterIdsRound,
    roundIndex,
    correctFirstTry,
    confusedPairs,
    retryCountRound,
  ]);

  useEffect(() => {
    if (session.loading) return;
    persist();
  }, [
    session.loading,
    letterIdsRound,
    roundIndex,
    correctFirstTry,
    confusedPairs,
    retryCountRound,
    persist,
  ]);

  const handleExit = useMemo(
    () => session.makeExitHandler(persist),
    [session, persist],
  );

  const finishSession = useCallback(
    async (
      finalCorrectFirstTry: number,
      totalResponseMs: number,
    ): Promise<void> => {
      const elapsedSecs = Math.max(
        1,
        Math.round((Date.now() - sessionStartedAt.current) / 1000),
      );
      const avgResponseTimeMs =
        totalResponseMs > 0 ? Math.round(totalResponseMs / ROUNDS) : 0;
      const accuracy = finalCorrectFirstTry / ROUNDS;
      const score = Math.round(accuracy * 100);
      const stars = firstTryStars(finalCorrectFirstTry);

      await session.finish({
        stars,
        bestScore: score,
        scoreDetails: {
          score,
          accuracy,
          timeSpentSecs: elapsedSecs,
          attempts: ROUNDS,
          details: {
            correctFirstTry: finalCorrectFirstTry,
            avgResponseTimeMs,
            confusedPairs,
          },
        },
      });
    },
    [session, confusedPairs],
  );

  const advanceRound = useCallback(
    (wasFirstTry: boolean): void => {
      const elapsed = Date.now() - roundStartedAt.current;
      responseMsTotalRef.current += elapsed;

      const nextCorrect = correctFirstTry + (wasFirstTry ? 1 : 0);
      const nextRound = roundIndex + 1;

      if (wasFirstTry) {
        setStreak((s) => {
          const n = s + 1;
          setStreakBest((b) => Math.max(b, n));
          return n;
        });
      } else {
        setStreak(0);
      }

      if (nextRound >= ROUNDS) {
        finishSession(nextCorrect, responseMsTotalRef.current).catch(() => {});
        return;
      }

      setCorrectFirstTry(nextCorrect);
      setRoundIndex(nextRound);
    },
    [correctFirstTry, finishSession, roundIndex],
  );

  const handleChoice = useCallback(
    (opt: GreekLetter): void => {
      if (!letter) return;
      const isCorrect = opt.id === letter.id;
      setChosenId(opt.id);

      if (isCorrect) {
        playSoundEffect('correct');
        const firstTry = retryCountRound === 0;
        advanceRound(firstTry);
        return;
      }

      playSoundEffect('incorrect');
      shake.value = withSequence(
        withTiming(8, { duration: 40 }),
        withTiming(-8, { duration: 40 }),
        withTiming(6, { duration: 40 }),
        withTiming(0, { duration: 40 }),
      );
      setAnswerState('wrong');
      setConfusedPairs((prev) => [
        ...prev,
        { played: letter.id, wrongChoice: opt.id },
      ]);
      setRetryCountRound((r) => r + 1);
      playLetterSound(letter.id);
    },
    [letter, advanceRound, retryCountRound, shake],
  );

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  function optionStyle(opt: GreekLetter): StyleProp<ViewStyle> {
    if (chosenId === opt.id && answerState === 'wrong') {
      return [gameStyles.option, gameStyles.optionWrong];
    }
    return gameStyles.option;
  }

  return (
    <GameShell
      title="Sound Safari 🔊"
      onExit={handleExit}
      loading={session.loading}
      saving={session.saving}
      headerExtras={
        <>
          <View style={styles.headerRow}>
            <Text style={styles.score}>
              {correctFirstTry} first-try · round {Math.min(roundIndex + 1, ROUNDS)} / {ROUNDS}
            </Text>
            {streak >= 2 && (
              <Text style={styles.streak}>🔥 Streak ×{streak}</Text>
            )}
          </View>
          <View style={[gameStyles.progressTrack, styles.progressTrackMargin]}>
            <View
              style={[
                gameStyles.progressFill,
                { width: `${((roundIndex + 1) / ROUNDS) * 100}%` },
              ]}
            />
          </View>
        </>
      }>
      <Animated.View style={[styles.body, shakeStyle]}>
        <Text style={styles.prompt}>Ποιο είναι το γράμμα;</Text>
        <Text style={styles.subPrompt}>Listen, then tap the matching letter.</Text>

        <View style={styles.grid}>
          {options.map((opt) => (
            <Pressable
              key={opt.id}
              style={({ pressed }) => [
                gameStyles.option,
                optionStyle(opt),
                pressed && gameStyles.optionPressed,
                styles.optionCard,
              ]}
              onPress={() => handleChoice(opt)}
              accessibilityRole="button"
              accessibilityLabel={`Letter ${opt.char}`}>
              <Text style={styles.optionLetter}>{opt.char}</Text>
              <Text style={styles.optionHint}>{opt.greekName}</Text>
            </Pressable>
          ))}
        </View>

        {streakBest >= 2 && (
          <Text style={styles.feedbackHint}>
            Best streak this run: {streakBest}
          </Text>
        )}
      </Animated.View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  score: {
    fontSize: typography.fontSize.caption,
    color: colors.cloudWhite,
    fontWeight: typography.fontWeight.semibold,
  },
  streak: {
    fontSize: typography.fontSize.caption,
    color: colors.sunshineYellow,
    fontWeight: typography.fontWeight.bold,
  },
  progressTrackMargin: {
    marginTop: spacing.xs,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    gap: spacing.md,
  },
  prompt: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    textAlign: 'center',
  },
  subPrompt: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  optionCard: {
    minWidth: '44%',
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetter: {
    fontSize: 42,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
  optionHint: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    marginTop: 4,
  },
  feedbackHint: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
