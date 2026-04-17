/**
 * Memory Match — flip cards to match uppercase and lowercase Greek letter pairs.
 *
 * Board: 4×4 grid (8 pairs from the 12-letter alphabet, randomly selected).
 * Stars: ≤12 flips → 3, ≤18 → 2, else 1.
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../app/navigationTypes';
import {
  GREEK_LETTERS,
  getLettersForIsland,
} from '../../data/alphabet/letterData';
import type { GreekLetter } from '../../data/alphabet/letterData';
import type { IslandId } from '../../data/islands/islandConfig';
import {
  useGameSession,
  useResumeGame,
} from '../games/shared/useGameSession';
import { GameShell } from '../games/shared/GameShell';
import { colors } from '../../app/theme/colors';
import { spacing } from '../../app/theme/spacing';
import { typography } from '../../app/theme/typography';

type Props = NativeStackScreenProps<PlayerStackParamList, 'MemoryMatch'>;

const PAIRS = 8;
const COLS = 4;

type Card = {
  id: string;
  pairId: string;
  label: string;
  sublabel: string;
};

function flipsToStars(flips: number): 1 | 2 | 3 {
  if (flips <= PAIRS * 1.5) return 3;
  if (flips <= PAIRS * 2.25) return 2;
  return 1;
}

function buildDeckFromIds(deckIds: string[]): Card[] {
  const byId = new Map<string, Card>();
  for (const l of GREEK_LETTERS) {
    byId.set(`${l.id}-upper`, {
      id: `${l.id}-upper`,
      pairId: l.id,
      label: l.char,
      sublabel: l.name,
    });
    byId.set(`${l.id}-name`, {
      id: `${l.id}-name`,
      pairId: l.id,
      label: l.greekName,
      sublabel: l.name,
    });
  }
  return deckIds
    .map((id) => byId.get(id))
    .filter((c): c is Card => c !== undefined);
}

function newShuffledDeckIds(letters: GreekLetter[]): string[] {
  const cards: Card[] = [];
  for (const l of letters) {
    cards.push({
      id: `${l.id}-upper`,
      pairId: l.id,
      label: l.char,
      sublabel: l.name,
    });
    cards.push({
      id: `${l.id}-name`,
      pairId: l.id,
      label: l.greekName,
      sublabel: l.name,
    });
  }
  return cards.sort(() => Math.random() - 0.5).map((c) => c.id);
}

export function MemoryMatchScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { islandId, levelId } = route.params;

  const session = useGameSession({
    game: 'memoryMatch',
    islandId,
    levelId,
    navigation,
  });

  const freshLetters = useMemo(
    () =>
      [...getLettersForIsland(islandId as IslandId)]
        .sort(() => Math.random() - 0.5)
        .slice(0, PAIRS),
    [islandId],
  );
  const freshDeckIds = useMemo(
    () => newShuffledDeckIds(freshLetters),
    [freshLetters],
  );

  const [deckIds, setDeckIds] = useState<string[]>(freshDeckIds);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [flips, setFlips] = useState(0);
  const [locked, setLocked] = useState(false);

  const deck = useMemo(() => buildDeckFromIds(deckIds), [deckIds]);

  useResumeGame(
    session,
    (saved) => saved.deckIds.length > 0,
    (saved) => {
      setDeckIds(saved.deckIds);
      setMatched(new Set(saved.matched));
      setFlips(saved.flips);
    },
  );

  const persist = useCallback(
    (
      currentMatched: string[],
      currentFlips: number,
      currentDeckIds: string[],
    ): void => {
      void session.save({
        deckIds: currentDeckIds,
        matched: currentMatched,
        flips: currentFlips,
      });
    },
    [session],
  );

  const handleSave = useCallback((): void => {
    persist([...matched], flips, deckIds);
  }, [matched, flips, deckIds, persist]);

  const handleExit = useMemo(
    () => session.makeExitHandler(handleSave),
    [session, handleSave],
  );

  const handleFinishGame = useCallback(
    async (finalFlips: number): Promise<void> => {
      const stars = flipsToStars(finalFlips);
      const score = Math.max(0, Math.round(100 - (finalFlips - PAIRS) * 3));
      await session.finish({
        stars,
        bestScore: score,
        scoreDetails: {
          score,
          attempts: finalFlips,
        },
      });
    },
    [session],
  );

  const openIds = useMemo(
    () =>
      deck
        .filter((c) => flipped.has(c.id) && !matched.has(c.pairId))
        .map((c) => c.id),
    [deck, flipped, matched],
  );

  const prevMatchedRef = useRef(matched.size);
  useEffect(() => {
    if (matched.size === PAIRS && matched.size > prevMatchedRef.current) {
      prevMatchedRef.current = matched.size;
      handleFinishGame(flips).catch(() => {});
    } else {
      prevMatchedRef.current = matched.size;
    }
  }, [matched, flips, handleFinishGame]);

  function handleFlip(card: Card): void {
    if (locked) return;
    if (flipped.has(card.id)) return;
    if (matched.has(card.pairId)) return;

    const newFlipped = new Set(flipped);
    newFlipped.add(card.id);
    setFlipped(newFlipped);
    const newFlipCount = flips + 1;
    setFlips(newFlipCount);

    if (openIds.length === 1) {
      const firstCard = deck.find((c) => c.id === openIds[0]);
      if (firstCard && firstCard.pairId === card.pairId) {
        const newMatched = new Set([...matched, card.pairId]);
        setMatched(newMatched);
        persist([...newMatched], newFlipCount, deckIds);
      } else {
        setLocked(true);
        setTimeout(() => {
          setFlipped((prev) => {
            const updated = new Set(prev);
            updated.delete(openIds[0]);
            updated.delete(card.id);
            return updated;
          });
          setLocked(false);
        }, 900);
      }
    }
  }

  return (
    <GameShell
      title="Memory Match 🃏"
      onExit={handleExit}
      loading={session.loading}
      saving={session.saving}
      headerExtras={
        <Text style={styles.stats}>
          {matched.size} / {PAIRS} pairs · {flips} flips
        </Text>
      }>
      <View style={styles.grid}>
        {deck.map((card) => {
          const isFlipped = flipped.has(card.id);
          const isMatched = matched.has(card.pairId);
          const faceUp = isFlipped || isMatched;

          return (
            <Pressable
              key={card.id}
              style={[
                styles.card,
                { width: `${100 / COLS - 2}%` },
                faceUp && (isMatched ? styles.cardMatched : styles.cardFlipped),
              ]}
              onPress={() => handleFlip(card)}
              accessibilityRole="button"
              accessibilityLabel={faceUp ? card.label : 'Hidden card'}
              disabled={faceUp || locked}>
              {faceUp ? (
                <>
                  <Text
                    style={[
                      styles.cardLabel,
                      isMatched && styles.cardLabelMatched,
                    ]}>
                    {card.label}
                  </Text>
                  <Text style={styles.cardSub}>{card.sublabel}</Text>
                </>
              ) : (
                <Text style={styles.cardBack}>?</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  stats: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    textAlign: 'center',
  },

  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    gap: spacing.sm,
    alignContent: 'center',
    justifyContent: 'center',
  },

  card: {
    aspectRatio: 0.75,
    backgroundColor: colors.oceanBlue,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  cardFlipped: {
    backgroundColor: colors.cloudWhite,
    borderWidth: 2,
    borderColor: colors.oceanBlue,
  },
  cardMatched: {
    backgroundColor: colors.successBg,
    borderWidth: 2,
    borderColor: colors.success,
  },
  cardBack: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.cloudWhite,
  },
  cardLabel: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    textAlign: 'center',
  },
  cardLabelMatched: {
    color: colors.successDark,
  },
  cardSub: {
    fontSize: 10,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
});
