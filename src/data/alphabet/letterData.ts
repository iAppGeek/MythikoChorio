// All paths are defined in a 280×280 coordinate space.
// Each stroke is a polyline (array of points) drawn in pedagogical order.

export const CANVAS_SIZE = 280;

export type Point = { x: number; y: number };
export type Stroke = Point[];

export type GreekLetter = {
  id: string;
  char: string;
  name: string;
  greekName: string;
  sound: string; // pronunciation hint for children
  strokes: Stroke[];
};

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
];
