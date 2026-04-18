import type { IslandId } from './islandConfig';

export type GameType =
  | 'letterLab'
  | 'soundSafari'
  | 'memoryMatch'
  | 'letterRace'
  | 'wordBubbles'
  | 'pictureHunt';

export type Level = {
  id: string;
  name: string;
  description: string;
  gameType: GameType;
  isBossChallenge: boolean;
};

const ALPHA_LEVELS: Level[] = [
  {
    id: 'alpha_meet_letters',
    name: 'Meet the Letters',
    description: 'Discover Α–Μ',
    gameType: 'letterLab',
    isBossChallenge: false,
  },
  {
    id: 'alpha_trace_letters',
    name: 'Trace the Letters',
    description: 'Guided tracing of Α–Μ',
    gameType: 'letterLab',
    isBossChallenge: false,
  },
  {
    id: 'alpha_letter_sounds',
    name: 'Letter Sounds',
    description: 'Match letters to sounds',
    gameType: 'soundSafari',
    isBossChallenge: false,
  },
  {
    id: 'alpha_letter_match',
    name: 'Letter Match',
    description: 'Uppercase to lowercase pairs',
    gameType: 'memoryMatch',
    isBossChallenge: false,
  },
  {
    id: 'alpha_word_bubbles',
    name: 'Word Bubbles',
    description: 'Pop letters to spell words',
    gameType: 'wordBubbles',
    isBossChallenge: false,
  },
  {
    id: 'alpha_picture_hunt',
    name: 'Picture Hunt',
    description: 'Find objects in the scene',
    gameType: 'pictureHunt',
    isBossChallenge: false,
  },
  {
    id: 'alpha_letter_race',
    name: 'Boss Challenge',
    description: 'Write letters from memory',
    gameType: 'letterRace',
    isBossChallenge: true,
  },
];

const BETA_LEVELS: Level[] = [
  {
    id: 'beta_meet_letters',
    name: 'Meet the Letters',
    description: 'Discover Ν–Ω',
    gameType: 'letterLab',
    isBossChallenge: false,
  },
  {
    id: 'beta_trace_letters',
    name: 'Trace the Letters',
    description: 'Guided tracing of Ν–Ω',
    gameType: 'letterLab',
    isBossChallenge: false,
  },
  {
    id: 'beta_letter_sounds',
    name: 'Letter Sounds',
    description: 'Match letters to sounds',
    gameType: 'soundSafari',
    isBossChallenge: false,
  },
  {
    id: 'beta_letter_match',
    name: 'Letter Match',
    description: 'Uppercase to lowercase pairs',
    gameType: 'memoryMatch',
    isBossChallenge: false,
  },
  {
    id: 'beta_word_bubbles',
    name: 'Word Bubbles',
    description: 'Pop letters to spell words',
    gameType: 'wordBubbles',
    isBossChallenge: false,
  },
  {
    id: 'beta_picture_hunt',
    name: 'Picture Hunt',
    description: 'Find objects in the scene',
    gameType: 'pictureHunt',
    isBossChallenge: false,
  },
  {
    id: 'beta_letter_race',
    name: 'Boss Challenge',
    description: 'Write letters from memory',
    gameType: 'letterRace',
    isBossChallenge: true,
  },
];

const LEVELS_BY_ISLAND: Partial<Record<IslandId, Level[]>> = {
  alpha: ALPHA_LEVELS,
  beta: BETA_LEVELS,
};

export function getLevelsForIsland(islandId: IslandId): Level[] {
  return LEVELS_BY_ISLAND[islandId] ?? [];
}

/**
 * An island is "cleared" when every one of its configured levels has at
 * least one star. Islands with no levels yet are not cleared.
 */
export function isIslandCleared(
  islandId: IslandId,
  starsByLevelId: Map<string, number>,
): boolean {
  const levels = getLevelsForIsland(islandId);
  if (levels.length === 0) return false;
  return levels.every((l) => (starsByLevelId.get(l.id) ?? 0) >= 1);
}

/**
 * A level is unlocked if:
 *   - it is the first level, OR
 *   - every earlier level has at least one star
 *
 * In development builds (`__DEV__`) every level is unlocked so we can smoke-test
 * any game without grinding through the unlock chain. This single helper is
 * the only place that check lives — production code and tests share the same
 * ordering logic.
 */
export function isLevelUnlocked(
  levelIndex: number,
  levels: readonly Level[],
  starsByLevelId: Map<string, number>,
): boolean {
  if (__DEV__) return true;
  if (levelIndex === 0) return true;
  for (let i = 0; i < levelIndex; i++) {
    if ((starsByLevelId.get(levels[i].id) ?? 0) === 0) return false;
  }
  return true;
}

/**
 * Maps a `GameType` to the navigation screen that implements it. Centralised
 * so the Results replay button and the level-select navigation share a single
 * source of truth.
 */
export const GAME_SCREEN = {
  letterLab: 'LetterLab',
  soundSafari: 'SoundSafari',
  memoryMatch: 'MemoryMatch',
  letterRace: 'LetterRace',
  wordBubbles: 'WordBubbles',
  pictureHunt: 'PictureHunt',
} as const satisfies Record<GameType, string>;

export type GameScreenName = (typeof GAME_SCREEN)[GameType];
