import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlayerStackParamList } from '../../../app/navigationTypes';
import { useAuthStore } from '../../../shared/stores/authStore';
import { fetchSouvenirs, ISLAND_SOUVENIR_TYPES } from '../../../shared/services/souvenirService';
import { ISLANDS } from '../../../data/islands/islandConfig';
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';
import type { Souvenir } from '../../../shared/models/Progress';

type Props = NativeStackScreenProps<PlayerStackParamList, 'Backpack'>;

const SOUVENIR_LABEL: Record<string, { title: string; emoji: string; blurb: string }> = {
  golden_alpha: {
    title: 'Golden Alpha',
    emoji: '🏆',
    blurb: 'For clearing every level on Alpha Island.',
  },
  omega_crown: {
    title: 'Omega Crown',
    emoji: '👑',
    blurb: 'For clearing every level on Beta Island.',
  },
};

const EXPECTED = Object.keys(ISLAND_SOUVENIR_TYPES).length;

export function BackpackScreen({ navigation }: Props): React.JSX.Element {
  const studentProfile = useAuthStore((s) => s.studentProfile);
  const [list, setList] = useState<Souvenir[]>([]);
  const [selected, setSelected] = useState<Souvenir | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!studentProfile) return;
      let cancelled = false;
      fetchSouvenirs(studentProfile.id)
        .then((rows) => {
          if (cancelled) return;
          setList(rows);
          setErr(null);
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          setErr(e instanceof Error ? e.message : 'Could not load souvenirs');
        });
      return (): void => {
        cancelled = true;
      };
    }, [studentProfile]),
  );

  const owned = new Set(list.map((s) => s.souvenir_type));
  const collected = list.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button">
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Backpack</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.counter}>
          {collected} of {EXPECTED} souvenirs collected
        </Text>
        {err && <Text style={styles.error}>{err}</Text>}

        <View style={styles.grid}>
          {Object.entries(ISLAND_SOUVENIR_TYPES).map(([islandId, typeId]) => {
            const has = owned.has(typeId);
            const meta = SOUVENIR_LABEL[typeId];
            const islandName =
              ISLANDS.find((i) => i.id === islandId)?.name ?? islandId;

            return (
              <Pressable
                key={typeId}
                style={[styles.slot, has ? styles.slotFilled : styles.slotEmpty]}
                disabled={!has}
                onPress={() => {
                  const row = list.find((s) => s.souvenir_type === typeId);
                  if (row) setSelected(row);
                }}>
                <Text style={styles.slotEmoji}>{has ? meta?.emoji : '❔'}</Text>
                <Text style={styles.slotCaption} numberOfLines={2}>
                  {has ? meta?.title : '???'}
                </Text>
                <Text style={styles.slotIsland}>{islandName}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Modal transparent visible={!!selected} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            {selected && (
              <>
                <Text style={styles.cardEmoji}>
                  {SOUVENIR_LABEL[selected.souvenir_type]?.emoji ?? '✨'}
                </Text>
                <Text style={styles.cardTitle}>
                  {SOUVENIR_LABEL[selected.souvenir_type]?.title ?? selected.souvenir_type}
                </Text>
                <Text style={styles.cardIsland}>
                  {ISLANDS.find((i) => i.id === selected.island_id)?.name ??
                    selected.island_id}
                </Text>
                <Text style={styles.cardBlurb}>
                  {SOUVENIR_LABEL[selected.souvenir_type]?.blurb ?? ''}
                </Text>
                <Text style={styles.cardDate}>
                  Earned {new Date(selected.earned_at ?? '').toLocaleDateString()}
                </Text>
                <Pressable style={styles.closeBtn} onPress={() => setSelected(null)}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cloudWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.sm,
    backgroundColor: colors.oceanBlue,
  },
  back: {
    color: colors.cloudWhite,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  title: {
    color: colors.cloudWhite,
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
  },
  headerSpacer: { width: 64 },
  body: {
    padding: spacing.screen,
    gap: spacing.md,
  },
  counter: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    fontSize: typography.fontSize.caption,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  slot: {
    width: '42%',
    minWidth: 140,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: spacing.xs,
  },
  slotEmpty: {
    borderColor: colors.border,
    backgroundColor: colors.softSand,
    opacity: 0.85,
  },
  slotFilled: {
    borderColor: colors.sunshineYellow,
    backgroundColor: colors.cloudWhite,
  },
  slotEmoji: {
    fontSize: 48,
  },
  slotCaption: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    textAlign: 'center',
  },
  slotIsland: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.screen,
  },
  card: {
    backgroundColor: colors.cloudWhite,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardEmoji: {
    fontSize: 64,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    textAlign: 'center',
  },
  cardIsland: {
    fontSize: typography.fontSize.subheading,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  cardBlurb: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  cardDate: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: spacing.sm,
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.oceanBlue,
    borderRadius: 12,
  },
  closeBtnText: {
    color: colors.cloudWhite,
    fontWeight: typography.fontWeight.semibold,
  },
});
