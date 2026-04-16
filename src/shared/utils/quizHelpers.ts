/**
 * Shared helpers for multiple-choice quiz games
 * (LetterChallengeStep, SoundSafariScreen).
 */

/** Pick `count` random items from `pool`, excluding `correct`. */
export function pickDistractors<T extends { id: string }>(
  pool: readonly T[],
  correct: T,
  count: number,
): T[] {
  const filtered = pool.filter((item) => item.id !== correct.id);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Build a shuffled array of `count + 1` options with `correct` inserted at a random position. */
export function buildShuffledOptions<T extends { id: string }>(
  pool: readonly T[],
  correct: T,
  distractorCount: number,
): T[] {
  const distractors = pickDistractors(pool, correct, distractorCount);
  const insertAt = Math.floor(Math.random() * (distractorCount + 1));
  const opts = [...distractors];
  opts.splice(insertAt, 0, correct);
  return opts;
}
