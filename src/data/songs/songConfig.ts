export type SongId = 'alphabetSong';

export type SongEntry = {
  id: SongId;
  title: string;
  /** Island id that must be cleared before the song unlocks */
  unlockedAfterIslandClearedId: string;
};

export const SONGS: SongEntry[] = [
  {
    id: 'alphabetSong',
    title: 'Alphabet Song',
    unlockedAfterIslandClearedId: 'alpha',
  },
];
