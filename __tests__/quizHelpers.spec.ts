import { pickDistractors, buildShuffledOptions } from '../src/shared/utils/quizHelpers';

type Item = { id: string; name: string };

const POOL: Item[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
  { id: 'c', name: 'Gamma' },
  { id: 'd', name: 'Delta' },
  { id: 'e', name: 'Epsilon' },
];

describe('pickDistractors', () => {
  it('returns the requested number of distractors', () => {
    const correct = POOL[0];
    const result = pickDistractors(POOL, correct, 3);
    expect(result).toHaveLength(3);
  });

  it('never includes the correct item', () => {
    const correct = POOL[2];
    for (let i = 0; i < 20; i++) {
      const result = pickDistractors(POOL, correct, 3);
      expect(result.find((r) => r.id === correct.id)).toBeUndefined();
    }
  });

  it('returns fewer items when pool is too small', () => {
    const correct = POOL[0];
    const result = pickDistractors(POOL, correct, 10);
    expect(result.length).toBe(4); // pool has 5 items, minus correct = 4
  });
});

describe('buildShuffledOptions', () => {
  it('returns distractorCount + 1 options', () => {
    const correct = POOL[1];
    const result = buildShuffledOptions(POOL, correct, 3);
    expect(result).toHaveLength(4);
  });

  it('always includes the correct answer', () => {
    const correct = POOL[3];
    for (let i = 0; i < 20; i++) {
      const result = buildShuffledOptions(POOL, correct, 3);
      expect(result.find((r) => r.id === correct.id)).toBeDefined();
    }
  });

  it('has no duplicate items', () => {
    const correct = POOL[0];
    const result = buildShuffledOptions(POOL, correct, 3);
    const ids = result.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
