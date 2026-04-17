jest.mock('../src/shared/services/gameProgressCache', () => ({
  clearGameProgress: jest.fn(),
}));
jest.mock('../src/shared/services/progressService', () => ({
  upsertLevelProgress: jest.fn(),
}));
jest.mock('../src/shared/services/scoreService', () => ({
  saveGameScore: jest.fn(),
}));

import { finishGame } from '../src/shared/utils/finishGame';
import { clearGameProgress } from '../src/shared/services/gameProgressCache';
import { upsertLevelProgress } from '../src/shared/services/progressService';
import { saveGameScore } from '../src/shared/services/scoreService';

const clearMock = clearGameProgress as jest.MockedFunction<typeof clearGameProgress>;
const upsertMock = upsertLevelProgress as jest.MockedFunction<typeof upsertLevelProgress>;
const saveMock = saveGameScore as jest.MockedFunction<typeof saveGameScore>;

function baseParams(overrides: Partial<Parameters<typeof finishGame>[0]> = {}) {
  return {
    game: 'letterLab' as const,
    levelId: 'level-1',
    profileId: 'profile-1',
    studentProfileId: 'student-1',
    islandId: 'alphabet-island',
    stars: 3 as 1 | 2 | 3,
    bestScore: 90,
    setSaving: jest.fn(),
    onComplete: jest.fn(),
    ...overrides,
  };
}

describe('finishGame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearMock.mockResolvedValue(undefined);
    upsertMock.mockResolvedValue(undefined);
    saveMock.mockResolvedValue(undefined);
  });

  it('clears cache, upserts progress, and calls onComplete', async () => {
    const params = baseParams();
    await finishGame(params);

    expect(params.setSaving).toHaveBeenNthCalledWith(1, true);
    expect(clearMock).toHaveBeenCalledWith('letterLab', 'level-1', 'profile-1');
    expect(upsertMock).toHaveBeenCalledWith({
      studentProfileId: 'student-1',
      islandId: 'alphabet-island',
      levelId: 'level-1',
      starsEarned: 3,
      bestScore: 90,
    });
    expect(saveMock).not.toHaveBeenCalled();
    expect(params.setSaving).toHaveBeenLastCalledWith(false);
    expect(params.onComplete).toHaveBeenCalledTimes(1);
  });

  it('skips backend writes for anonymous users (no studentProfileId)', async () => {
    const params = baseParams({ studentProfileId: undefined });
    await finishGame(params);

    expect(clearMock).toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
    expect(params.onComplete).toHaveBeenCalledTimes(1);
  });

  it('inserts game_scores when scoreDetails is provided', async () => {
    const params = baseParams({
      scoreDetails: {
        score: 82,
        accuracy: 0.82,
        timeSpentSecs: 45,
        attempts: 6,
        hintsUsed: 1,
      },
    });
    await finishGame(params);

    expect(saveMock).toHaveBeenCalledTimes(1);
    const arg = saveMock.mock.calls[0][0];
    expect(arg).toEqual(
      expect.objectContaining({
        student_profile_id: 'student-1',
        island_id: 'alphabet-island',
        level_id: 'level-1',
        game_type: 'letterLab',
        score: 82,
        accuracy: 0.82,
        time_spent_secs: 45,
        attempts: 6,
        hints_used: 1,
      }),
    );
    expect(typeof arg.completed_at).toBe('string');
  });

  it('defaults optional scoreDetails fields to null', async () => {
    const params = baseParams({
      scoreDetails: { score: 50 },
    });
    await finishGame(params);

    const arg = saveMock.mock.calls[0][0];
    expect(arg.accuracy).toBeNull();
    expect(arg.time_spent_secs).toBeNull();
    expect(arg.attempts).toBeNull();
    expect(arg.hints_used).toBeNull();
  });

  it('surfaces upsert errors via onPersistError without blocking onComplete', async () => {
    const err = new Error('network down');
    upsertMock.mockRejectedValueOnce(err);
    const onPersistError = jest.fn();
    const params = baseParams({ onPersistError });

    await finishGame(params);

    expect(onPersistError).toHaveBeenCalledWith(err);
    expect(params.onComplete).toHaveBeenCalledTimes(1);
    expect(params.setSaving).toHaveBeenLastCalledWith(false);
  });

  it('surfaces saveGameScore errors via onPersistError without blocking onComplete', async () => {
    const err = new Error('score insert failed');
    saveMock.mockRejectedValueOnce(err);
    const onPersistError = jest.fn();
    const params = baseParams({
      onPersistError,
      scoreDetails: { score: 70 },
    });

    await finishGame(params);

    expect(upsertMock).toHaveBeenCalled();
    expect(onPersistError).toHaveBeenCalledWith(err);
    expect(params.onComplete).toHaveBeenCalledTimes(1);
  });
});
