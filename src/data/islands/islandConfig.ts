export type IslandId =
  | 'alpha'
  | 'beta'
  | 'chromata'
  | 'arithmoi'
  | 'oikogeneia'
  | 'zoa'
  | 'fagito'
  | 'soma'
  | 'kairos'
  | 'spiti';

export type Island = {
  id: IslandId;
  name: string;
  greekName: string;
  theme: string;
  emoji: string;
  /** null = always unlocked (starting island) */
  unlockAfter: IslandId | null;
  /** Approximate position on the map (0–1 of container width, absolute y px) */
  position: { x: number; y: number };
};

export const ISLANDS: Island[] = [
  {
    id: 'alpha',
    name: 'Alpha Island',
    greekName: 'Νησί Άλφα',
    theme: 'Greek Alphabet (Α–Μ)',
    emoji: '🏛️',
    unlockAfter: null,
    position: { x: 0.5, y: 120 },
  },
  {
    id: 'beta',
    name: 'Beta Island',
    greekName: 'Νησί Βήτα',
    theme: 'Greek Alphabet (Ν–Ω)',
    emoji: '📜',
    unlockAfter: 'alpha',
    position: { x: 0.75, y: 300 },
  },
  {
    id: 'chromata',
    name: 'Chromata Island',
    greekName: 'Νησί Χρώματα',
    theme: 'Colours',
    emoji: '🎨',
    unlockAfter: 'beta',
    position: { x: 0.25, y: 480 },
  },
  {
    id: 'arithmoi',
    name: 'Arithmoi Island',
    greekName: 'Νησί Αριθμοί',
    theme: 'Numbers 1–20',
    emoji: '🔢',
    unlockAfter: 'chromata',
    position: { x: 0.6, y: 660 },
  },
  {
    id: 'oikogeneia',
    name: 'Oikogeneia Island',
    greekName: 'Νησί Οικογένεια',
    theme: 'Family',
    emoji: '👨‍👩‍👧',
    unlockAfter: 'arithmoi',
    position: { x: 0.3, y: 840 },
  },
  {
    id: 'zoa',
    name: 'Zoa Island',
    greekName: 'Νησί Ζώα',
    theme: 'Animals',
    emoji: '🐘',
    unlockAfter: 'oikogeneia',
    position: { x: 0.7, y: 1020 },
  },
  {
    id: 'fagito',
    name: 'Fagito Island',
    greekName: 'Νησί Φαγητό',
    theme: 'Food & Drink',
    emoji: '🍇',
    unlockAfter: 'zoa',
    position: { x: 0.35, y: 1200 },
  },
  {
    id: 'soma',
    name: 'Soma Island',
    greekName: 'Νησί Σώμα',
    theme: 'Body & Clothes',
    emoji: '👗',
    unlockAfter: 'fagito',
    position: { x: 0.65, y: 1380 },
  },
  {
    id: 'kairos',
    name: 'Kairos Island',
    greekName: 'Νησί Καιρός',
    theme: 'Weather & Seasons',
    emoji: '⛅',
    unlockAfter: 'soma',
    position: { x: 0.3, y: 1560 },
  },
  {
    id: 'spiti',
    name: 'Spiti Island',
    greekName: 'Νησί Σπίτι',
    theme: 'Home & School',
    emoji: '🏠',
    unlockAfter: 'kairos',
    position: { x: 0.65, y: 1740 },
  },
];

/**
 * Returns the set of island IDs that are unlocked given the set of islands
 * the player has "cleared" (all levels have at least 1 star). An island
 * unlocks when its `unlockAfter` island is cleared; islands with
 * `unlockAfter: null` are always unlocked.
 */
export function getUnlockedIslands(
  clearedIslands: Set<IslandId>,
): Set<IslandId> {
  const unlocked = new Set<IslandId>();
  for (const island of ISLANDS) {
    if (island.unlockAfter === null || clearedIslands.has(island.unlockAfter)) {
      unlocked.add(island.id);
    }
  }
  return unlocked;
}
