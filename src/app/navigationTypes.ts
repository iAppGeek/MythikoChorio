// Navigation param lists live here — imported by both screens and NavigationRoot
// to avoid circular dependencies.

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
  // ── Shared
  Results: {
    stars: 1 | 2 | 3;
    levelName: string;
    islandId: string;
    levelId: string;
  };
};

// StaffStackParamList will be added when SSO is re-enabled:
// export type StaffStackParamList = {
//   TeacherDashboard: undefined;
//   AdminDashboard: undefined;
// };
