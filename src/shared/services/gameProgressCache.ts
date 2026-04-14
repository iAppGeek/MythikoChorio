/**
 * Lightweight mid-game progress cache using AsyncStorage.
 * Keys are scoped to (studentProfileId, levelId) so two players on the
 * same device don't collide.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LetterLabCache = {
  letterIndex: number;
  stepIndex: number;
  scores: number[];
  letterScores: number[];
};

export type SoundSafariCache = {
  roundIndex: number;
  correct: number;
};

export type MemoryMatchCache = {
  /** Ordered card IDs to reconstruct the shuffled deck deterministically. */
  deckIds: string[];
  matched: string[];
  flips: number;
};

export type LetterRaceCache = {
  /** Ordered letter IDs for the shuffled round sequence. */
  letterIds: string[];
  roundIndex: number;
  scores: number[];
};

type CacheMap = {
  letterLab: LetterLabCache;
  soundSafari: SoundSafariCache;
  memoryMatch: MemoryMatchCache;
  letterRace: LetterRaceCache;
};

function key<G extends keyof CacheMap>(
  game: G,
  levelId: string,
  profileId: string,
): string {
  return `game_progress:${game}:${levelId}:${profileId}`;
}

export async function saveGameProgress<G extends keyof CacheMap>(
  game: G,
  levelId: string,
  profileId: string,
  data: CacheMap[G],
): Promise<void> {
  try {
    await AsyncStorage.setItem(key(game, levelId, profileId), JSON.stringify(data));
  } catch {
    // Non-fatal
  }
}

export async function loadGameProgress<G extends keyof CacheMap>(
  game: G,
  levelId: string,
  profileId: string,
): Promise<CacheMap[G] | null> {
  try {
    const raw = await AsyncStorage.getItem(key(game, levelId, profileId));
    if (!raw) return null;
    return JSON.parse(raw) as CacheMap[G];
  } catch {
    return null;
  }
}

export async function clearGameProgress(
  game: keyof CacheMap,
  levelId: string,
  profileId: string,
): Promise<void> {
  try {
    await AsyncStorage.removeItem(key(game, levelId, profileId));
  } catch {
    // Non-fatal
  }
}
