/**
 * Word Bubbles — spell a Greek word by popping rising letter bubbles.
 *
 * Each session plays through a shuffled set of words (up to WORDS_PER_SESSION).
 * Bubbles rise from the bottom of the play area; the next-needed letter of
 * the current word is weighted into the spawn pool so there's always a path
 * forward. Tapping the needed letter fills the answer bar; any other tap
 * counts as a wrong pop and shakes the bubble.
 *
 * Stars are derived from overall pop accuracy:
 *   accuracy = correctPops / (correctPops + wrongPops)
 *   ≥80% → 3, ≥55% → 2, else 1.
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
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../app/navigationTypes';
import { GREEK_LETTERS } from '../../data/alphabet/letterData';
import type { GreekLetter } from '../../data/alphabet/letterData';
import {
  getDistractorLetterIds,
  getWordsForIsland,
} from '../../data/vocabulary/wordBubblesWords';
import type { WordEntry } from '../../data/vocabulary/wordBubblesWords';
import type { WordBubblesStats } from '../../shared/services/gameProgressCache';
import {
  useGameSession,
  useResumeGame,
} from '../games/shared/useGameSession';
import { GameShell } from '../games/shared/GameShell';
import { colors } from '../../app/theme/colors';
import { spacing } from '../../app/theme/spacing';
import { typography } from '../../app/theme/typography';
import { gameStyles } from '../../app/theme/gameStyles';

type Props = NativeStackScreenProps<PlayerStackParamList, 'WordBubbles'>;

const BUBBLE_SIZE = 64;
const BUBBLE_SLOTS = 6;
const WORDS_PER_SESSION = 6;
const BASE_DURATION_MS = 9000;
const MIN_DURATION_MS = 5500;
const DURATION_STEP_MS = 500;
const MAX_STAGGER_MS = 1500;
const PREFERRED_LETTER_CHANCE = 0.45;

type BubbleDef = {
  /** Stable slot index 0..BUBBLE_SLOTS-1 — this is where the bubble lives. */
  slot: number;
  /** Changes on every respawn so React remounts the Bubble with fresh state. */
  key: number;
  letterId: string;
  xFrac: number;
  delayMs: number;
};

function accuracyToStars(correct: number, wrong: number): 1 | 2 | 3 {
  const total = correct + wrong;
  if (total === 0) return 1;
  const pct = (correct / total) * 100;
  if (pct >= 80) return 3;
  if (pct >= 55) return 2;
  return 1;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function speedForWordIndex(index: number): number {
  return Math.max(MIN_DURATION_MS, BASE_DURATION_MS - index * DURATION_STEP_MS);
}

// ─── Bubble ──────────────────────────────────────────────────────────────────

type BubbleProps = {
  def: BubbleDef;
  char: string;
  durationMs: number;
  playHeight: number;
  playWidth: number;
  onTap: (slot: number, letterId: string) => 'correct' | 'wrong';
  onEscape: (slot: number) => void;
};

function Bubble({
  def,
  char,
  durationMs,
  playHeight,
  playWidth,
  onTap,
  onEscape,
}: BubbleProps): React.JSX.Element {
  const translateY = useSharedValue(playHeight);
  const anchorX = useSharedValue(0);
  const wobble = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const consumedRef = useRef(false);

  useEffect(() => {
    const maxX = Math.max(0, playWidth - BUBBLE_SIZE);
    consumedRef.current = false;
    anchorX.value = def.xFrac * maxX;
    cancelAnimation(wobble);
    wobble.value = withRepeat(
      withSequence(
        withTiming(7, {
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(-7, {
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      true,
    );
    translateY.value = playHeight;
    translateY.value = withDelay(
      def.delayMs,
      withTiming(
        -BUBBLE_SIZE,
        { duration: durationMs, easing: Easing.linear },
        (finished) => {
          if (finished && !consumedRef.current) {
            consumedRef.current = true;
            runOnJS(onEscape)(def.slot);
          }
        },
      ),
    );
    return (): void => {
      cancelAnimation(wobble);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def.key]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: anchorX.value + wobble.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  function handlePress(): void {
    if (consumedRef.current) return;
    const result = onTap(def.slot, def.letterId);
    if (result === 'correct') {
      consumedRef.current = true;
      scale.value = withTiming(1.4, { duration: 140 });
      opacity.value = withTiming(0, { duration: 220 });
    } else {
      scale.value = withSequence(
        withTiming(1.1, { duration: 80 }),
        withSpring(1, { damping: 6 }),
      );
    }
  }

  return (
    <Animated.View style={[styles.bubble, animatedStyle]} pointerEvents="box-none">
      <Pressable
        onPress={handlePress}
        style={styles.bubblePressable}
        accessibilityRole="button"
        accessibilityLabel={`Letter ${char}`}>
        <Text style={styles.bubbleText}>{char}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export function WordBubblesScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { islandId, levelId } = route.params;

  const session = useGameSession({
    game: 'wordBubbles',
    islandId,
    levelId,
    navigation,
  });

  const allWords = useMemo(() => getWordsForIsland(islandId), [islandId]);
  const wordById = useMemo(() => {
    const map = new Map<string, WordEntry>();
    allWords.forEach((w) => map.set(w.id, w));
    return map;
  }, [allWords]);

  const letterById = useMemo(() => {
    const map = new Map<string, GreekLetter>();
    GREEK_LETTERS.forEach((l) => map.set(l.id, l));
    return map;
  }, []);

  const distractorIds = useMemo(
    () => getDistractorLetterIds(islandId),
    [islandId],
  );

  const [wordIds, setWordIds] = useState<string[]>(() =>
    shuffle(allWords)
      .slice(0, Math.min(WORDS_PER_SESSION, allWords.length))
      .map((w) => w.id),
  );
  const [wordIndex, setWordIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [stats, setStats] = useState<WordBubblesStats>({
    wordsCompleted: 0,
    wordsWithoutError: 0,
    correctPops: 0,
    wrongPops: 0,
  });
  const [wrongThisWord, setWrongThisWord] = useState(0);
  const [bubbles, setBubbles] = useState<BubbleDef[]>([]);
  const [playSize, setPlaySize] = useState<{ w: number; h: number } | null>(
    null,
  );

  const keyCounterRef = useRef(1);
  const finishedRef = useRef(false);
  const sessionStartRef = useRef<number>(Date.now());
  const letterStartRef = useRef<number>(Date.now());
  const letterTimesRef = useRef<number[]>([]);

  const currentWord = wordById.get(wordIds[wordIndex] ?? '');

  const pool = useMemo(() => {
    if (!currentWord) return distractorIds;
    return Array.from(new Set([...currentWord.letters, ...distractorIds]));
  }, [currentWord, distractorIds]);

  const neededLetterId = currentWord?.letters[letterIndex] ?? null;
  const neededLetterIdRef = useRef(neededLetterId);
  useEffect(() => {
    neededLetterIdRef.current = neededLetterId;
  }, [neededLetterId]);

  const makeDef = useCallback(
    (slot: number): BubbleDef => {
      const preferId = neededLetterIdRef.current;
      const letterId =
        preferId && Math.random() < PREFERRED_LETTER_CHANCE
          ? preferId
          : pickRandom(pool);
      keyCounterRef.current += 1;
      return {
        slot,
        key: keyCounterRef.current,
        letterId,
        xFrac: Math.random(),
        delayMs: Math.floor(Math.random() * MAX_STAGGER_MS),
      };
    },
    [pool],
  );

  useResumeGame(
    session,
    (saved) =>
      saved.wordIds.length > 0 &&
      (saved.wordIndex > 0 ||
        saved.letterIndex > 0 ||
        saved.stats.correctPops > 0 ||
        saved.stats.wordsCompleted > 0),
    (saved) => {
      setWordIds(saved.wordIds);
      setWordIndex(saved.wordIndex);
      setLetterIndex(saved.letterIndex ?? 0);
      setStats(saved.stats);
      setWrongThisWord(0);
    },
  );

  useEffect(() => {
    if (session.loading) return;
    sessionStartRef.current = Date.now();
    letterTimesRef.current = [];
    letterStartRef.current = Date.now();
  }, [session.loading]);

  useEffect(() => {
    if (session.loading) return;
    letterStartRef.current = Date.now();
  }, [session.loading, wordIndex, letterIndex]);

  // (Re)spawn all bubbles whenever a new word begins and the play area
  // has a known size.
  useEffect(() => {
    if (session.loading) return;
    if (!playSize) return;
    if (!currentWord) return;
    setBubbles(
      Array.from({ length: BUBBLE_SLOTS }, (_, i) => makeDef(i)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.loading, playSize, wordIndex, currentWord?.id]);

  // Persist progress whenever the word pointer or stats change.
  useEffect(() => {
    if (session.loading) return;
    if (finishedRef.current) return;
    session
      .save({ wordIds, wordIndex, letterIndex, stats })
      .catch(() => {});
  }, [session, wordIds, wordIndex, letterIndex, stats]);

  const handleExit = useMemo(
    () =>
      session.makeExitHandler(() => {
        session
          .save({ wordIds, wordIndex, letterIndex, stats })
          .catch(() => {});
      }),
    [session, wordIds, wordIndex, letterIndex, stats],
  );

  const handleFinish = useCallback(
    async (finalStats: WordBubblesStats): Promise<void> => {
      finishedRef.current = true;
      const stars = accuracyToStars(finalStats.correctPops, finalStats.wrongPops);
      const total = finalStats.correctPops + finalStats.wrongPops;
      const accuracy = total > 0 ? finalStats.correctPops / total : 1;
      const score = Math.round(accuracy * 100);
      const timeSpentSecs = Math.max(
        1,
        Math.round((Date.now() - sessionStartRef.current) / 1000),
      );
      const times = letterTimesRef.current;
      const avgLetterRecognitionMs =
        times.length > 0
          ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
          : 0;
      await session.finish({
        stars,
        bestScore: score,
        scoreDetails: {
          score,
          accuracy,
          timeSpentSecs,
          details: {
            wordsCompleted: finalStats.wordsCompleted,
            wordsWithoutError: finalStats.wordsWithoutError,
            avgLetterRecognitionMs,
          },
        },
      });
    },
    [session],
  );

  const respawnSlot = useCallback(
    (slot: number): void => {
      setBubbles((curr) =>
        curr.map((b, i) => (i === slot ? makeDef(slot) : b)),
      );
    },
    [makeDef],
  );

  const handleTap = useCallback(
    (slot: number, letterId: string): 'correct' | 'wrong' => {
      if (!currentWord) return 'wrong';
      const needed = currentWord.letters[letterIndex];
      if (letterId === needed) {
        const elapsed = Date.now() - letterStartRef.current;
        letterTimesRef.current.push(elapsed);

        const nextLetterIndex = letterIndex + 1;
        const wordComplete = nextLetterIndex >= currentWord.letters.length;

        if (wordComplete) {
          const noError = wrongThisWord === 0;
          const nextWordIndex = wordIndex + 1;
          const sessionOver = nextWordIndex >= wordIds.length;
          const newStats: WordBubblesStats = {
            wordsCompleted: stats.wordsCompleted + 1,
            wordsWithoutError: stats.wordsWithoutError + (noError ? 1 : 0),
            correctPops: stats.correctPops + 1,
            wrongPops: stats.wrongPops,
          };
          setStats(newStats);
          if (sessionOver) {
            handleFinish(newStats).catch(() => {});
          } else {
            setWordIndex(nextWordIndex);
            setLetterIndex(0);
            setWrongThisWord(0);
          }
        } else {
          setLetterIndex(nextLetterIndex);
          setStats((s) => ({ ...s, correctPops: s.correctPops + 1 }));
          respawnSlot(slot);
        }
        return 'correct';
      }

      setStats((s) => ({ ...s, wrongPops: s.wrongPops + 1 }));
      setWrongThisWord((w) => w + 1);
      respawnSlot(slot);
      return 'wrong';
    },
    [
      currentWord,
      letterIndex,
      wordIndex,
      wordIds.length,
      wrongThisWord,
      stats,
      respawnSlot,
      handleFinish,
    ],
  );

  const handleEscape = useCallback(
    (slot: number): void => {
      respawnSlot(slot);
    },
    [respawnSlot],
  );

  function onPlayLayout(e: LayoutChangeEvent): void {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (!playSize || playSize.w !== w || playSize.h !== h) {
      setPlaySize({ w, h });
    }
  }

  const durationMs = speedForWordIndex(wordIndex);

  return (
    <GameShell
      title="Word Bubbles 🫧"
      onExit={handleExit}
      loading={session.loading}
      saving={session.saving}
      headerExtras={
        <View style={[gameStyles.progressTrack, styles.progressTrackMargin]}>
          <View
            style={[
              gameStyles.progressFill,
              { width: `${((wordIndex + 1) / wordIds.length) * 100}%` },
            ]}
          />
        </View>
      }>
      <View style={styles.body}>
        {currentWord && (
          <View style={styles.hintRow}>
            <Text style={styles.hintEmoji}>{currentWord.emoji}</Text>
            <View style={styles.hintTextCol}>
              <Text style={styles.hintGloss}>{currentWord.gloss}</Text>
              <AnswerBar
                letters={currentWord.letters}
                filled={letterIndex}
                letterById={letterById}
              />
            </View>
          </View>
        )}

        <View style={styles.playArea} onLayout={onPlayLayout}>
          {playSize &&
            currentWord &&
            bubbles.map((def) => {
              const letter = letterById.get(def.letterId);
              if (!letter) return null;
              return (
                <Bubble
                  key={`${def.slot}-${def.key}`}
                  def={def}
                  char={letter.char}
                  durationMs={durationMs}
                  playHeight={playSize.h}
                  playWidth={playSize.w}
                  onTap={handleTap}
                  onEscape={handleEscape}
                />
              );
            })}
        </View>
      </View>
    </GameShell>
  );
}

// ─── Answer bar ──────────────────────────────────────────────────────────────

function AnswerBar({
  letters,
  filled,
  letterById,
}: {
  letters: string[];
  filled: number;
  letterById: Map<string, GreekLetter>;
}): React.JSX.Element {
  return (
    <View style={styles.answerBar}>
      {letters.map((id, i) => {
        const char = letterById.get(id)?.char ?? '?';
        const shown = i < filled;
        return (
          <View
            key={i}
            style={[styles.slot, shown ? styles.slotFilled : styles.slotEmpty]}>
            <Text style={styles.slotText}>{shown ? char : '_'}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  progressTrackMargin: {
    marginTop: spacing.xs,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },

  // ── Hint + answer bar
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  hintEmoji: {
    fontSize: 56,
  },
  hintTextCol: {
    flex: 1,
    gap: spacing.xs,
  },
  hintGloss: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  answerBar: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  slot: {
    minWidth: 36,
    height: 44,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmpty: {
    borderColor: colors.border,
    backgroundColor: colors.cloudWhite,
  },
  slotFilled: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  slotText: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },

  // ── Play area
  playArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: colors.mapSky,
  },

  // ── Bubble
  bubble: {
    position: 'absolute',
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: colors.cloudWhite,
    borderWidth: 3,
    borderColor: colors.oceanBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bubblePressable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
});
