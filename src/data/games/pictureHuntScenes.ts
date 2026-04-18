/**
 * Placeholder picture-hunt scenes — emoji background + percentage hit boxes.
 * Children tap the zone that matches the spoken/written Greek word.
 */

import type { IslandId } from '../islands/islandConfig';

export type HuntItem = {
  id: string;
  word: string;
  gloss: string;
  /** Emoji drawn inside the hit zone as a stand-in for artwork. */
  emoji: string;
  /** Hit box as fractions of scene width / height (0–1). */
  hit: { x: number; y: number; w: number; h: number };
};

export type HuntScene = {
  id: string;
  category: string;
  title: string;
  /** Large emoji standing in for artwork until illustrations ship. */
  backdropEmoji: string;
  items: HuntItem[];
};

const ALPHA_SCENE: HuntScene = {
  id: 'alpha_kitchen',
  category: 'kitchen',
  title: 'Στην κουζίνα',
  backdropEmoji: '🍳',
  items: [
    { id: 'a1', word: 'Μήλο', gloss: 'apple', emoji: '🍎', hit: { x: 0.08, y: 0.2, w: 0.2, h: 0.18 } },
    { id: 'a2', word: 'Γάλα', gloss: 'milk', emoji: '🥛', hit: { x: 0.72, y: 0.15, w: 0.22, h: 0.2 } },
    { id: 'a3', word: 'Ψωμί', gloss: 'bread', emoji: '🍞', hit: { x: 0.4, y: 0.45, w: 0.24, h: 0.2 } },
    { id: 'a4', word: 'Λεμόνι', gloss: 'lemon', emoji: '🍋', hit: { x: 0.12, y: 0.55, w: 0.22, h: 0.18 } },
    { id: 'a5', word: 'Τυρί', gloss: 'cheese', emoji: '🧀', hit: { x: 0.62, y: 0.58, w: 0.22, h: 0.18 } },
    { id: 'a6', word: 'Πιάτο', gloss: 'plate', emoji: '🍽️', hit: { x: 0.38, y: 0.72, w: 0.26, h: 0.16 } },
    { id: 'a7', word: 'Καρέκλα', gloss: 'chair', emoji: '🪑', hit: { x: 0.08, y: 0.75, w: 0.2, h: 0.2 } },
    { id: 'a8', word: 'Ποτήρι', gloss: 'glass', emoji: '🥤', hit: { x: 0.72, y: 0.78, w: 0.22, h: 0.18 } },
  ],
};

const BETA_SCENE: HuntScene = {
  id: 'beta_beach',
  category: 'beach',
  title: 'Στην παραλία',
  backdropEmoji: '🏖️',
  items: [
    { id: 'b1', word: 'Κύμα', gloss: 'wave', emoji: '🌊', hit: { x: 0.1, y: 0.25, w: 0.22, h: 0.18 } },
    { id: 'b2', word: 'Ήλιος', gloss: 'sun', emoji: '☀️', hit: { x: 0.42, y: 0.1, w: 0.2, h: 0.18 } },
    { id: 'b3', word: 'Ψάρι', gloss: 'fish', emoji: '🐟', hit: { x: 0.72, y: 0.35, w: 0.22, h: 0.2 } },
    { id: 'b4', word: 'Άμμος', gloss: 'sand', emoji: '🪣', hit: { x: 0.18, y: 0.58, w: 0.24, h: 0.18 } },
    { id: 'b5', word: 'Πετσέτα', gloss: 'towel', emoji: '🧺', hit: { x: 0.58, y: 0.52, w: 0.26, h: 0.18 } },
    { id: 'b6', word: 'Ποδήλατο', gloss: 'bike', emoji: '🚲', hit: { x: 0.08, y: 0.78, w: 0.26, h: 0.18 } },
    { id: 'b7', word: 'Νερό', gloss: 'water', emoji: '💧', hit: { x: 0.42, y: 0.72, w: 0.22, h: 0.18 } },
    { id: 'b8', word: 'Παιχνίδι', gloss: 'toy', emoji: '🧸', hit: { x: 0.72, y: 0.76, w: 0.22, h: 0.18 } },
  ],
};

const SCENES: Partial<Record<IslandId, HuntScene>> = {
  alpha: ALPHA_SCENE,
  beta: BETA_SCENE,
};

export function getSceneForIsland(islandId: IslandId): HuntScene {
  return SCENES[islandId] ?? ALPHA_SCENE;
}
