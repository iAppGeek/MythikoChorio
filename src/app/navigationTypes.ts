// Navigation param lists live here — imported by both screens and NavigationRoot
// to avoid circular dependencies.

import type { GameType } from '../data/islands/levelConfig';

export type AuthStackParamList = {
  Welcome: undefined;
};

export type PlayerStackParamList = {
  IslandMap: undefined;
  IslandLevelSelect: { islandId: string };
  // ── Games (Phase 1)
  LetterLab: { islandId: string; levelId: string };
  SoundSafari: { islandId: string; levelId: string };
  MemoryMatch: { islandId: string; levelId: string };
  LetterRace: { islandId: string; levelId: string };
  WordBubbles: { islandId: string; levelId: string };
  PictureHunt: { islandId: string; levelId: string };
  Jukebox: undefined;
  Backpack: undefined;
  // ── Shared
  Results: {
    stars: 1 | 2 | 3;
    levelName: string;
    islandId: string;
    levelId: string;
    /** Game that the user just completed — used to route the Replay button. */
    gameType: GameType;
  };
};

// StaffStackParamList will be added when SSO is re-enabled:
// export type StaffStackParamList = {
//   TeacherDashboard: undefined;
//   AdminDashboard: undefined;
// };
