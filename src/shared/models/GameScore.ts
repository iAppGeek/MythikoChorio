import type { Tables } from '../../types/database';

export type GameScore = Tables<'game_scores'>;

// Narrower type used when constructing inserts — keeps device_type human-readable.
export type DeviceType = 'phone' | 'tablet';
