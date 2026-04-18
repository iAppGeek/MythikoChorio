jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveGameProgress,
  loadGameProgress,
  clearGameProgress,
} from '../src/shared/services/gameProgressCache';

const setItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;
const getItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const removeItem = AsyncStorage.removeItem as jest.MockedFunction<typeof AsyncStorage.removeItem>;

describe('gameProgressCache', () => {
  beforeEach(() => {
    setItem.mockReset();
    getItem.mockReset();
    removeItem.mockReset();
  });

  describe('key scoping', () => {
    it('scopes keys by game, levelId, and profileId', async () => {
      setItem.mockResolvedValue(undefined);
      await saveGameProgress('letterLab', 'level-1', 'profile-A', {
        letterIndex: 0,
        stepIndex: 0,
        scores: [],
        letterScores: [],
      });
      await saveGameProgress('soundSafari', 'level-1', 'profile-A', {
        letterIdsRound: ['alpha'],
        roundIndex: 2,
        correctFirstTry: 1,
        confusedPairs: [],
        responseMsTotal: 0,
        roundsCompleted: 2,
        retryCountRound: 0,
      });
      await saveGameProgress('letterLab', 'level-1', 'profile-B', {
        letterIndex: 0,
        stepIndex: 0,
        scores: [],
        letterScores: [],
      });

      const keys = setItem.mock.calls.map(c => c[0]);
      expect(keys).toEqual([
        'game_progress:letterLab:level-1:profile-A',
        'game_progress:soundSafari:level-1:profile-A',
        'game_progress:letterLab:level-1:profile-B',
      ]);
      expect(new Set(keys).size).toBe(3);
    });
  });

  describe('saveGameProgress', () => {
    it('serialises payload via JSON.stringify', async () => {
      setItem.mockResolvedValue(undefined);
      const payload = {
        deckIds: ['a', 'b'],
        matched: ['a'],
        flips: 4,
      };
      await saveGameProgress('memoryMatch', 'lvl', 'p', payload);

      expect(setItem).toHaveBeenCalledWith(
        'game_progress:memoryMatch:lvl:p',
        JSON.stringify(payload),
      );
    });

    it('swallows storage errors silently (non-fatal)', async () => {
      setItem.mockRejectedValueOnce(new Error('disk full'));
      await expect(
        saveGameProgress('letterRace', 'lvl', 'p', {
          letterIds: [],
          roundIndex: 0,
          scores: [],
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('loadGameProgress', () => {
    it('returns parsed value when present', async () => {
      const payload = {
        letterIdsRound: ['alpha', 'beta'],
        roundIndex: 3,
        correctFirstTry: 2,
        confusedPairs: [],
        responseMsTotal: 4000,
        roundsCompleted: 3,
        retryCountRound: 0,
      };
      getItem.mockResolvedValueOnce(JSON.stringify(payload));

      const result = await loadGameProgress('soundSafari', 'lvl', 'p');
      expect(result).toEqual(payload);
    });

    it('returns null when no cached value', async () => {
      getItem.mockResolvedValueOnce(null);
      expect(await loadGameProgress('soundSafari', 'lvl', 'p')).toBeNull();
    });

    it('returns null when stored value is corrupt', async () => {
      getItem.mockResolvedValueOnce('{not valid json');
      expect(await loadGameProgress('soundSafari', 'lvl', 'p')).toBeNull();
    });

    it('returns null when storage throws', async () => {
      getItem.mockRejectedValueOnce(new Error('io'));
      expect(await loadGameProgress('soundSafari', 'lvl', 'p')).toBeNull();
    });
  });

  describe('clearGameProgress', () => {
    it('removes the correct key', async () => {
      removeItem.mockResolvedValue(undefined);
      await clearGameProgress('letterLab', 'lvl', 'p');
      expect(removeItem).toHaveBeenCalledWith('game_progress:letterLab:lvl:p');
    });

    it('swallows storage errors silently', async () => {
      removeItem.mockRejectedValueOnce(new Error('io'));
      await expect(
        clearGameProgress('letterLab', 'lvl', 'p'),
      ).resolves.toBeUndefined();
    });
  });
});
