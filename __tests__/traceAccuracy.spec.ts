import { calculateTraceAccuracy, scoreToStars } from '../src/features/letterLab/utils/traceAccuracy';

describe('scoreToStars', () => {
  it('returns 3 stars for score >= 80', () => {
    expect(scoreToStars(80)).toBe(3);
    expect(scoreToStars(100)).toBe(3);
    expect(scoreToStars(95)).toBe(3);
  });

  it('returns 2 stars for score >= 50 and < 80', () => {
    expect(scoreToStars(50)).toBe(2);
    expect(scoreToStars(79)).toBe(2);
    expect(scoreToStars(65)).toBe(2);
  });

  it('returns 1 star for score < 50', () => {
    expect(scoreToStars(49)).toBe(1);
    expect(scoreToStars(0)).toBe(1);
    expect(scoreToStars(25)).toBe(1);
  });
});

describe('calculateTraceAccuracy', () => {
  it('returns 0 when template has no strokes', () => {
    expect(calculateTraceAccuracy([], [[{ x: 10, y: 10 }, { x: 20, y: 20 }]])).toBe(0);
  });

  it('returns 0 when user has no strokes', () => {
    const template = [[{ x: 10, y: 10 }, { x: 50, y: 50 }]];
    expect(calculateTraceAccuracy(template, [])).toBe(0);
  });

  it('returns 100 when user perfectly traces the template', () => {
    const stroke = [{ x: 10, y: 10 }, { x: 50, y: 50 }, { x: 100, y: 100 }];
    expect(calculateTraceAccuracy([stroke], [stroke])).toBe(100);
  });

  it('returns a partial score for partial overlap', () => {
    const template = [
      [{ x: 0, y: 0 }, { x: 140, y: 0 }, { x: 280, y: 0 }],
    ];
    const userPartial = [
      [{ x: 0, y: 0 }, { x: 70, y: 0 }],
    ];
    const score = calculateTraceAccuracy(template, userPartial);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });
});
