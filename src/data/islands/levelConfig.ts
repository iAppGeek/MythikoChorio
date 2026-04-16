import type { IslandId } from './islandConfig';

export type GameType = 'letterLab' | 'soundSafari' | 'memoryMatch' | 'letterRace';

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
    id: 'alpha_letter_race',
    name: 'Boss Challenge',
    description: 'Write letters from memory',
    gameType: 'letterRace',
    isBossChallenge: true,
  },
];

const LEVELS_BY_ISLAND: Partial<Record<IslandId, Level[]>> = {
  alpha: ALPHA_LEVELS,
};

export function getLevelsForIsland(islandId: IslandId): Level[] {
  return LEVELS_BY_ISLAND[islandId] ?? [];
}
