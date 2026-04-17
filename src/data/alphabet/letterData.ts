// All paths are defined in a 280×280 coordinate space.
// Each stroke is a polyline (array of points) drawn in pedagogical order.

import type { Point, Stroke } from '../../shared/utils/skiaPathBuilder';
import type { IslandId } from '../islands/islandConfig';

export const CANVAS_SIZE = 280;

export type { Point, Stroke };

export type GreekLetter = {
  id: string;
  char: string;
  name: string;
  greekName: string;
  sound: string; // pronunciation hint for children
  strokes: Stroke[];
};

export const ALPHA_ISLAND_LETTER_IDS = new Set<string>([
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta',
  'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu',
]);

export const BETA_ISLAND_LETTER_IDS = new Set<string>([
  'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma',
  'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
]);

/**
 * Returns the Greek letters that the given island drills.
 *
 * Uses an exhaustive switch so that adding a new `IslandId` produces a
 * compile error here (via TypeScript's `never` check) — much safer than the
 * previous "return all letters" fallback that silently hid missing data.
 *
 * Islands that don't centre on the alphabet (Chromata, Arithmoi, etc.)
 * return `[]` and log a warning so misroutes surface in logs during dev.
 */
export function getLettersForIsland(islandId: IslandId): GreekLetter[] {
  switch (islandId) {
    case 'alpha':
      return GREEK_LETTERS.filter((l) => ALPHA_ISLAND_LETTER_IDS.has(l.id));
    case 'beta':
      return GREEK_LETTERS.filter((l) => BETA_ISLAND_LETTER_IDS.has(l.id));
    case 'chromata':
    case 'arithmoi':
    case 'oikogeneia':
    case 'zoa':
    case 'fagito':
    case 'soma':
    case 'kairos':
    case 'spiti':
      console.warn(
        `[getLettersForIsland] island "${islandId}" has no letter set yet`,
      );
      return [];
    default: {
      const exhaustive: never = islandId;
      console.warn(
        `[getLettersForIsland] unhandled island id: ${exhaustive as string}`,
      );
      return [];
    }
  }
}

export const GREEK_LETTERS: GreekLetter[] = [
  {
    id: 'alpha',
    char: 'Α',
    name: 'Alpha',
    greekName: 'Άλφα',
    sound: 'like "a" in apple',
    strokes: [
      [{ x: 140, y: 28 }, { x: 28, y: 252 }],
      [{ x: 140, y: 28 }, { x: 252, y: 252 }],
      [{ x: 74, y: 168 }, { x: 206, y: 168 }],
    ],
  },
  {
    id: 'beta',
    char: 'Β',
    name: 'Beta',
    greekName: 'Βήτα',
    sound: 'like "v" in vine',
    strokes: [
      [{ x: 56, y: 28 }, { x: 56, y: 252 }],
      [
        { x: 56, y: 28 }, { x: 126, y: 28 }, { x: 168, y: 50 },
        { x: 168, y: 112 }, { x: 126, y: 140 }, { x: 56, y: 140 },
      ],
      [
        { x: 56, y: 140 }, { x: 140, y: 140 }, { x: 182, y: 162 },
        { x: 182, y: 224 }, { x: 140, y: 252 }, { x: 56, y: 252 },
      ],
    ],
  },
  {
    id: 'gamma',
    char: 'Γ',
    name: 'Gamma',
    greekName: 'Γάμμα',
    sound: 'like "y" in yes',
    strokes: [
      [{ x: 56, y: 28 }, { x: 224, y: 28 }],
      [{ x: 56, y: 28 }, { x: 56, y: 252 }],
    ],
  },
  {
    id: 'delta',
    char: 'Δ',
    name: 'Delta',
    greekName: 'Δέλτα',
    sound: 'like "d" in dog',
    strokes: [
      [{ x: 140, y: 28 }, { x: 28, y: 252 }],
      [{ x: 28, y: 252 }, { x: 252, y: 252 }],
      [{ x: 252, y: 252 }, { x: 140, y: 28 }],
    ],
  },
  {
    id: 'epsilon',
    char: 'Ε',
    name: 'Epsilon',
    greekName: 'Έψιλον',
    sound: 'like "e" in egg',
    strokes: [
      [{ x: 56, y: 28 }, { x: 56, y: 252 }],
      [{ x: 56, y: 28 }, { x: 224, y: 28 }],
      [{ x: 56, y: 140 }, { x: 196, y: 140 }],
      [{ x: 56, y: 252 }, { x: 224, y: 252 }],
    ],
  },
  {
    id: 'zeta',
    char: 'Ζ',
    name: 'Zeta',
    greekName: 'Ζήτα',
    sound: 'like "z" in zoo',
    strokes: [
      [{ x: 56, y: 28 }, { x: 224, y: 28 }],
      [{ x: 224, y: 28 }, { x: 56, y: 252 }],
      [{ x: 56, y: 252 }, { x: 224, y: 252 }],
    ],
  },
  {
    id: 'eta',
    char: 'Η',
    name: 'Eta',
    greekName: 'Ήτα',
    sound: 'like "ee" in bee',
    strokes: [
      [{ x: 56, y: 28 }, { x: 56, y: 252 }],
      [{ x: 224, y: 28 }, { x: 224, y: 252 }],
      [{ x: 56, y: 140 }, { x: 224, y: 140 }],
    ],
  },
  {
    id: 'theta',
    char: 'Θ',
    name: 'Theta',
    greekName: 'Θήτα',
    sound: 'like "th" in think',
    strokes: [
      [
        { x: 140, y: 28 }, { x: 196, y: 42 }, { x: 224, y: 84 },
        { x: 224, y: 140 }, { x: 224, y: 196 }, { x: 196, y: 238 },
        { x: 140, y: 252 }, { x: 84, y: 238 }, { x: 56, y: 196 },
        { x: 56, y: 140 }, { x: 56, y: 84 }, { x: 84, y: 42 },
        { x: 140, y: 28 },
      ],
      [{ x: 56, y: 140 }, { x: 224, y: 140 }],
    ],
  },
  {
    id: 'iota',
    char: 'Ι',
    name: 'Iota',
    greekName: 'Ιώτα',
    sound: 'like "ee" in bee',
    strokes: [
      [{ x: 140, y: 28 }, { x: 140, y: 252 }],
    ],
  },
  {
    id: 'kappa',
    char: 'Κ',
    name: 'Kappa',
    greekName: 'Κάππα',
    sound: 'like "k" in kite',
    strokes: [
      [{ x: 56, y: 28 }, { x: 56, y: 252 }],
      [{ x: 224, y: 28 }, { x: 56, y: 140 }],
      [{ x: 56, y: 140 }, { x: 224, y: 252 }],
    ],
  },
  {
    id: 'lambda',
    char: 'Λ',
    name: 'Lambda',
    greekName: 'Λάμδα',
    sound: 'like "l" in lamp',
    strokes: [
      [{ x: 140, y: 28 }, { x: 28, y: 252 }],
      [{ x: 140, y: 28 }, { x: 252, y: 252 }],
    ],
  },
  {
    id: 'mu',
    char: 'Μ',
    name: 'Mu',
    greekName: 'Μυ',
    sound: 'like "m" in moon',
    strokes: [
      [{ x: 42, y: 28 }, { x: 42, y: 252 }],
      [{ x: 42, y: 28 }, { x: 140, y: 154 }],
      [{ x: 140, y: 154 }, { x: 238, y: 28 }],
      [{ x: 238, y: 28 }, { x: 238, y: 252 }],
    ],
  },
  {
    id: 'nu',
    char: 'Ν',
    name: 'Nu',
    greekName: 'Νυ',
    sound: 'like "n" in nest',
    strokes: [
      [{ x: 56, y: 28 }, { x: 56, y: 252 }],
      [{ x: 56, y: 28 }, { x: 224, y: 252 }],
      [{ x: 224, y: 28 }, { x: 224, y: 252 }],
    ],
  },
  {
    id: 'xi',
    char: 'Ξ',
    name: 'Xi',
    greekName: 'Ξι',
    sound: 'like "x" in axe',
    strokes: [
      [{ x: 56, y: 28 }, { x: 224, y: 28 }],
      [{ x: 84, y: 140 }, { x: 196, y: 140 }],
      [{ x: 56, y: 252 }, { x: 224, y: 252 }],
    ],
  },
  {
    id: 'omicron',
    char: 'Ο',
    name: 'Omicron',
    greekName: 'Όμικρον',
    sound: 'like "o" in hot',
    strokes: [
      [
        { x: 140, y: 28 }, { x: 196, y: 42 }, { x: 224, y: 84 },
        { x: 224, y: 140 }, { x: 224, y: 196 }, { x: 196, y: 238 },
        { x: 140, y: 252 }, { x: 84, y: 238 }, { x: 56, y: 196 },
        { x: 56, y: 140 }, { x: 56, y: 84 }, { x: 84, y: 42 },
        { x: 140, y: 28 },
      ],
    ],
  },
  {
    id: 'pi',
    char: 'Π',
    name: 'Pi',
    greekName: 'Πι',
    sound: 'like "p" in pan',
    strokes: [
      [{ x: 42, y: 28 }, { x: 238, y: 28 }],
      [{ x: 56, y: 28 }, { x: 56, y: 252 }],
      [{ x: 224, y: 28 }, { x: 224, y: 252 }],
    ],
  },
  {
    id: 'rho',
    char: 'Ρ',
    name: 'Rho',
    greekName: 'Ρο',
    sound: 'like "r" in run',
    strokes: [
      [{ x: 56, y: 28 }, { x: 56, y: 252 }],
      [
        { x: 56, y: 28 }, { x: 140, y: 28 }, { x: 196, y: 56 },
        { x: 196, y: 112 }, { x: 140, y: 140 }, { x: 56, y: 140 },
      ],
    ],
  },
  {
    id: 'sigma',
    char: 'Σ',
    name: 'Sigma',
    greekName: 'Σίγμα',
    sound: 'like "s" in sun',
    strokes: [
      [{ x: 224, y: 28 }, { x: 56, y: 28 }],
      [{ x: 56, y: 28 }, { x: 168, y: 140 }],
      [{ x: 168, y: 140 }, { x: 56, y: 252 }],
      [{ x: 56, y: 252 }, { x: 224, y: 252 }],
    ],
  },
  {
    id: 'tau',
    char: 'Τ',
    name: 'Tau',
    greekName: 'Ταυ',
    sound: 'like "t" in top',
    strokes: [
      [{ x: 28, y: 28 }, { x: 252, y: 28 }],
      [{ x: 140, y: 28 }, { x: 140, y: 252 }],
    ],
  },
  {
    id: 'upsilon',
    char: 'Υ',
    name: 'Upsilon',
    greekName: 'Ύψιλον',
    sound: 'like "ee" in see',
    strokes: [
      [{ x: 56, y: 28 }, { x: 140, y: 140 }],
      [{ x: 224, y: 28 }, { x: 140, y: 140 }],
      [{ x: 140, y: 140 }, { x: 140, y: 252 }],
    ],
  },
  {
    id: 'phi',
    char: 'Φ',
    name: 'Phi',
    greekName: 'Φι',
    sound: 'like "f" in fish',
    strokes: [
      [{ x: 140, y: 14 }, { x: 140, y: 266 }],
      [
        { x: 140, y: 56 }, { x: 196, y: 70 }, { x: 224, y: 112 },
        { x: 224, y: 140 }, { x: 224, y: 168 }, { x: 196, y: 210 },
        { x: 140, y: 224 }, { x: 84, y: 210 }, { x: 56, y: 168 },
        { x: 56, y: 140 }, { x: 56, y: 112 }, { x: 84, y: 70 },
        { x: 140, y: 56 },
      ],
    ],
  },
  {
    id: 'chi',
    char: 'Χ',
    name: 'Chi',
    greekName: 'Χι',
    sound: 'like "h" in hue',
    strokes: [
      [{ x: 56, y: 28 }, { x: 224, y: 252 }],
      [{ x: 224, y: 28 }, { x: 56, y: 252 }],
    ],
  },
  {
    id: 'psi',
    char: 'Ψ',
    name: 'Psi',
    greekName: 'Ψι',
    sound: 'like "ps" in lapse',
    strokes: [
      [{ x: 140, y: 28 }, { x: 140, y: 252 }],
      [{ x: 56, y: 56 }, { x: 56, y: 140 }, { x: 224, y: 140 }, { x: 224, y: 56 }],
    ],
  },
  {
    id: 'omega',
    char: 'Ω',
    name: 'Omega',
    greekName: 'Ωμέγα',
    sound: 'like "o" in go',
    strokes: [
      [
        { x: 84, y: 252 }, { x: 56, y: 210 }, { x: 56, y: 154 },
        { x: 70, y: 98 }, { x: 112, y: 56 }, { x: 168, y: 56 },
        { x: 210, y: 98 }, { x: 224, y: 154 }, { x: 224, y: 210 },
        { x: 196, y: 252 },
      ],
      [{ x: 28, y: 252 }, { x: 98, y: 252 }],
      [{ x: 182, y: 252 }, { x: 252, y: 252 }],
    ],
  },
];
