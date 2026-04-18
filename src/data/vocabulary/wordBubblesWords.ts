/**
 * Word lists for the Word Bubbles game, grouped by the island they're used on.
 *
 * Each word references letter IDs (not Unicode chars) so rendering always goes
 * through `GREEK_LETTERS` and stays consistent with the rest of the app.
 * Alpha Island words only use letters Α–Μ; Beta Island words only use the
 * letters a player has seen by that point (all 24).
 */

import { BETA_ISLAND_LETTER_IDS, GREEK_LETTERS } from '../alphabet/letterData';

export type WordEntry = {
  /** Unique id, used as React keys and cache entries. */
  id: string;
  /** Rendered Greek string, used for the answer bar once complete. */
  word: string;
  /** English gloss, shown as a subtitle under the picture hint. */
  gloss: string;
  /** Emoji standing in for the picture hint until illustrations arrive. */
  emoji: string;
  /** Ordered list of letter ids from `GREEK_LETTERS` — the answer sequence. */
  letters: string[];
};

const ALPHA_WORDS: WordEntry[] = [
  {
    id: 'mama',
    word: 'Μαμά',
    gloss: 'mum',
    emoji: '👩',
    letters: ['mu', 'alpha', 'mu', 'alpha'],
  },
  {
    id: 'gala',
    word: 'Γάλα',
    gloss: 'milk',
    emoji: '🥛',
    letters: ['gamma', 'alpha', 'lambda', 'alpha'],
  },
  {
    id: 'meli',
    word: 'Μέλι',
    gloss: 'honey',
    emoji: '🍯',
    letters: ['mu', 'epsilon', 'lambda', 'iota'],
  },
  {
    id: 'alma',
    word: 'Άλμα',
    gloss: 'a jump',
    emoji: '🦘',
    letters: ['alpha', 'lambda', 'mu', 'alpha'],
  },
  {
    id: 'thea',
    word: 'Θεά',
    gloss: 'goddess',
    emoji: '🗿',
    letters: ['theta', 'epsilon', 'alpha'],
  },
  {
    id: 'lima',
    word: 'Λίμα',
    gloss: 'file',
    emoji: '🪚',
    letters: ['lambda', 'iota', 'mu', 'alpha'],
  },
];

const BETA_WORDS: WordEntry[] = [
  {
    id: 'gata',
    word: 'Γάτα',
    gloss: 'cat',
    emoji: '🐱',
    letters: ['gamma', 'alpha', 'tau', 'alpha'],
  },
  {
    id: 'psari',
    word: 'Ψάρι',
    gloss: 'fish',
    emoji: '🐟',
    letters: ['psi', 'alpha', 'rho', 'iota'],
  },
  {
    id: 'nero',
    word: 'Νερό',
    gloss: 'water',
    emoji: '💧',
    letters: ['nu', 'epsilon', 'rho', 'omicron'],
  },
  {
    id: 'pita',
    word: 'Πίτα',
    gloss: 'pie',
    emoji: '🥧',
    letters: ['pi', 'iota', 'tau', 'alpha'],
  },
  {
    id: 'podi',
    word: 'Πόδι',
    gloss: 'foot',
    emoji: '🦶',
    letters: ['pi', 'omicron', 'delta', 'iota'],
  },
  {
    id: 'soma',
    word: 'Σώμα',
    gloss: 'body',
    emoji: '🧍',
    letters: ['sigma', 'omega', 'mu', 'alpha'],
  },
];

const WORDS_BY_ISLAND: Record<string, WordEntry[]> = {
  alpha: ALPHA_WORDS,
  beta: BETA_WORDS,
};

/**
 * Returns the Word Bubbles word list for the given island. Falls back to
 * Alpha's list for islands that don't have dedicated words yet, so new
 * islands can start playing the game before their own vocabulary lands.
 */
export function getWordsForIsland(islandId: string): WordEntry[] {
  return WORDS_BY_ISLAND[islandId] ?? ALPHA_WORDS;
}

/**
 * Distractor pool — the set of letter ids a bubble can spawn with when the
 * target letters alone wouldn't provide enough variety. Mirrors the "letters
 * the player has learned by this island" rule: Alpha → Α–Μ, Beta → all 24.
 */
export function getDistractorLetterIds(islandId: string): string[] {
  if (islandId === 'beta') {
    return GREEK_LETTERS.map((l) => l.id);
  }
  // Alpha Island (and fallback): only expose the Α–Μ half of the alphabet
  // so first-time players never see a letter they haven't met yet.
  return GREEK_LETTERS
    .filter((l) => !BETA_ISLAND_LETTER_IDS.has(l.id))
    .map((l) => l.id);
}
