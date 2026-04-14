import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../../app/navigationTypes';
import type { GameType } from '../../../data/islands/levelConfig';
import { ISLANDS } from '../../../data/islands/islandConfig';
import { getLevelsForIsland } from '../../../data/islands/levelConfig';
import type { Level } from '../../../data/islands/levelConfig';
import { getIslandProgress } from '../../../shared/services/progressService';
import { useAuthStore } from '../../../shared/stores/authStore';
import type { IslandProgress } from '../../../shared/models/Progress';
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';

type Props = NativeStackScreenProps<PlayerStackParamList, 'IslandLevelSelect'>;

type GameScreenName = Extract<
  keyof PlayerStackParamList,
  'LetterLab' | 'MemoryMatch' | 'LetterRace' | 'SoundSafari'
>;

const GAME_SCREEN: Record<GameType, GameScreenName> = {
  letterLab: 'LetterLab',
  soundSafari: 'SoundSafari',
  memoryMatch: 'MemoryMatch',
  letterRace: 'LetterRace',
};

const GAME_EMOJI: Record<GameType, string> = {
  letterLab: '✏️',
  soundSafari: '🔊',
  memoryMatch: '🃏',
  letterRace: '🏁',
};

// ─── Separator ────────────────────────────────────────────────────────────────

function LevelSeparator(): React.JSX.Element {
  return <View style={styles.separator} />;
}

// ─── Star row ─────────────────────────────────────────────────────────────────

function StarRow({ count }: { count: number }): React.JSX.Element {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3].map(n => (
        <Text key={n} style={styles.star}>
          {n <= count ? '⭐' : '☆'}
        </Text>
      ))}
    </View>
  );
}

// ─── Level card ───────────────────────────────────────────────────────────────

type LevelCardProps = {
  level: Level;
  index: number;
  unlocked: boolean;
  stars: number;
  onPress: () => void;
};

function LevelCard({
  level,
  index,
  unlocked,
  stars,
  onPress,
}: LevelCardProps): React.JSX.Element {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        level.isBossChallenge && styles.cardBoss,
        !unlocked && styles.cardLocked,
        pressed && unlocked && styles.cardPressed,
      ]}
      onPress={unlocked ? onPress : undefined}
      accessibilityRole="button"
      accessibilityLabel={
        unlocked ? `Play ${level.name}` : `${level.name} — locked`
      }
      accessibilityState={{ disabled: !unlocked }}
    >
      {/* Left: number badge */}
      <View
        style={[
          styles.badge,
          level.isBossChallenge ? styles.badgeBoss : styles.badgeNormal,
          !unlocked && styles.badgeLocked,
        ]}
      >
        <Text style={styles.badgeText}>
          {level.isBossChallenge ? '👑' : String(index + 1)}
        </Text>
      </View>

      {/* Centre: name + description */}
      <View style={styles.cardBody}>
        <Text
          style={[styles.levelName, !unlocked && styles.textLocked]}
          numberOfLines={1}
        >
          {level.name}
        </Text>
        <Text
          style={[styles.levelDesc, !unlocked && styles.textLocked]}
          numberOfLines={1}
        >
          {GAME_EMOJI[level.gameType]} {level.description}
        </Text>
      </View>

      {/* Right: stars or lock */}
      <View style={styles.cardRight}>
        {unlocked ? (
          <StarRow count={stars} />
        ) : (
          <Text style={styles.lockIcon}>🔒</Text>
        )}
      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function IslandLevelSelectScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { islandId } = route.params;
  const island = ISLANDS.find(i => i.id === islandId);
  const levels = getLevelsForIsland(
    islandId as Parameters<typeof getLevelsForIsland>[0],
  );

  const studentProfile = useAuthStore(s => s.studentProfile);
  const [progress, setProgress] = useState<Map<string, IslandProgress>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!studentProfile) {
        setLoading(false);
        return;
      }

      setLoading(true);
      getIslandProgress(studentProfile.id, islandId)
        .then(rows => {
          const map = new Map(rows.map(r => [r.level_id, r]));
          setProgress(map);
        })
        .catch(() => {
          // Non-fatal: render with no progress (all levels at 0 stars)
        })
        .finally(() => setLoading(false));
    }, [studentProfile, islandId]),
  );

  /**
   * A level is unlocked if it is the first incomplete level or any level
   * before it. Boss Challenge follows the same rule — it unlocks after
   * level 4 is complete.
   */
  function isUnlocked(index: number): boolean {
    if (__DEV__) return true; // enables all levels in dev mode for testing
    if (index === 0) return true;
    for (let i = 0; i < index; i++) {
      const p = progress.get(levels[i].id);
      if (!p || p.stars_earned === 0) return false;
    }
    return true;
  }

  function getStars(levelId: string): number {
    return progress.get(levelId)?.stars_earned ?? 0;
  }

  function handleLevelPress(level: Level): void {
    const screen = GAME_SCREEN[level.gameType];
    navigation.navigate(screen, { islandId, levelId: level.id });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={colors.oceanBlue}
          style={styles.loader}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Island header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back to map"
        >
          <Text style={styles.backButtonText}>← Map</Text>
        </Pressable>
        <Text style={styles.headerEmoji}>{island?.emoji ?? '🏝️'}</Text>
        <Text style={styles.headerTitle}>{island?.name ?? islandId}</Text>
        <Text style={styles.headerTheme}>{island?.theme ?? ''}</Text>
      </View>

      {/* Level list */}
      <FlatList
        data={levels}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <LevelCard
            level={item}
            index={index}
            unlocked={isUnlocked(index)}
            stars={getStars(item.id)}
            onPress={() => handleLevelPress(item)}
          />
        )}
        ItemSeparatorComponent={LevelSeparator}
      />
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

  // ── Header
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.screen,
    backgroundColor: colors.oceanBlue,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.fontSize.body,
    color: colors.cloudWhite,
    fontWeight: typography.fontWeight.medium,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.cloudWhite,
  },
  headerTheme: {
    fontSize: typography.fontSize.body,
    color: colors.cloudWhite,
    opacity: 0.85,
    marginTop: 2,
  },

  // ── List
  list: {
    padding: spacing.screen,
  },
  separator: {
    height: spacing.sm,
  },

  // ── Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cloudWhite,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBoss: {
    borderWidth: 2,
    borderColor: colors.sunshineYellow,
    backgroundColor: '#FFFBEB',
  },
  cardLocked: {
    opacity: 0.55,
  },
  cardPressed: {
    opacity: 0.75,
  },

  // ── Badge (level number)
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNormal: {
    backgroundColor: colors.oceanBlue,
  },
  badgeBoss: {
    backgroundColor: colors.sunshineYellow,
  },
  badgeLocked: {
    backgroundColor: '#C0C8D0',
  },
  badgeText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.cloudWhite,
  },

  // ── Card body
  cardBody: {
    flex: 1,
    gap: 2,
  },
  levelName: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.oceanBlue,
  },
  levelDesc: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
  },
  textLocked: {
    color: '#8A9BAB',
  },

  // ── Right side
  cardRight: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 16,
  },
  lockIcon: {
    fontSize: 20,
  },
});
