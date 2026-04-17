const mockRpc = jest.fn();
const mockFrom = jest.fn();

const mockSupabaseClient = {
  rpc: (...args: unknown[]) => mockRpc(...args),
  from: (...args: unknown[]) => mockFrom(...args),
};

jest.mock('../src/shared/services/supabaseClient', () => ({
  supabase: mockSupabaseClient,
  requireSupabase: () => mockSupabaseClient,
  isSupabaseConfigured: true,
  MISSING_SUPABASE_ENV_MESSAGE: 'mock missing env',
}));

import {
  upsertLevelProgress,
  getIslandProgress,
  getAllProgress,
} from '../src/shared/services/progressService';

describe('progressService.upsertLevelProgress', () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  it('calls the upsert_level_progress RPC with prefixed args', async () => {
    mockRpc.mockResolvedValueOnce({ error: null });

    await upsertLevelProgress({
      studentProfileId: 'student-1',
      islandId: 'alphabet-island',
      levelId: 'level-2',
      starsEarned: 2,
      bestScore: 77,
    });

    expect(mockRpc).toHaveBeenCalledWith('upsert_level_progress', {
      p_student_profile_id: 'student-1',
      p_island_id: 'alphabet-island',
      p_level_id: 'level-2',
      p_stars_earned: 2,
      p_best_score: 77,
    });
  });

  it('throws if the RPC returns an error', async () => {
    mockRpc.mockResolvedValueOnce({ error: { message: 'boom' } });

    await expect(
      upsertLevelProgress({
        studentProfileId: 's',
        islandId: 'i',
        levelId: 'l',
        starsEarned: 1,
        bestScore: 10,
      }),
    ).rejects.toThrow('Failed to save level progress: boom');
  });

  /** Keeps JS payload aligned with `CREATE FUNCTION upsert_level_progress(...)` in schema.sql */
  it('RPC payload keys match upsert_level_progress SQL parameter names', async () => {
    mockRpc.mockResolvedValueOnce({ error: null });
    await upsertLevelProgress({
      studentProfileId: 'uuid-here',
      islandId: 'alpha',
      levelId: 'lvl1',
      starsEarned: 3,
      bestScore: 99,
    });
    const [, payload] = mockRpc.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(Object.keys(payload).sort()).toEqual(
      [
        'p_best_score',
        'p_island_id',
        'p_level_id',
        'p_stars_earned',
        'p_student_profile_id',
      ].sort(),
    );
  });
});

describe('progressService.getIslandProgress / getAllProgress', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  function mockFromChain(result: { data: unknown; error: unknown }) {
    const eq2 = jest.fn().mockResolvedValue(result);
    const eq1 = jest.fn().mockReturnValue({ eq: eq2 });
    const select = jest.fn().mockReturnValue({ eq: eq1 });
    mockFrom.mockReturnValue({ select });
    return { select, eq1, eq2 };
  }

  it('getIslandProgress returns rows on success', async () => {
    const rows = [{ level_id: 'l1' }];
    mockFromChain({ data: rows, error: null });

    const result = await getIslandProgress('s', 'i');
    expect(result).toEqual(rows);
  });

  it('getIslandProgress returns [] when data is null', async () => {
    mockFromChain({ data: null, error: null });
    expect(await getIslandProgress('s', 'i')).toEqual([]);
  });

  it('getIslandProgress throws on error', async () => {
    mockFromChain({ data: null, error: { message: 'nope' } });
    await expect(getIslandProgress('s', 'i')).rejects.toThrow(
      'Failed to fetch island progress: nope',
    );
  });

  it('getAllProgress returns rows on success', async () => {
    const eq = jest.fn().mockResolvedValue({ data: [{ a: 1 }], error: null });
    const select = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    expect(await getAllProgress('s')).toEqual([{ a: 1 }]);
  });
});
