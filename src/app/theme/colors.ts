export const colors = {
  // ── Core palette
  oceanBlue: '#3B82F6',
  sunshineYellow: '#FBBF24',
  terracotta: '#E07A5F',
  oliveGreen: '#6B8F71',
  cloudWhite: '#F8FAFC',
  softSand: '#FDF6EC',

  // ── Neutrals
  border: '#E2E8F0',
  muted: '#8A9BAB',
  textDark: '#1E293B',
  shadow: '#000',
  dotInactive: '#CBD5E1',

  // ── Feedback
  success: '#10B981',
  successBg: '#D1FAE5',
  successDark: '#059669',
  error: '#EF4444',
  errorBg: '#FEE2E2',

  // ── Map
  mapSky: '#B8DEFF',
  lockedBg: '#C8D6E5',
  lockedBorder: '#A0B0C0',
  lockedLabel: '#7A8A9A',
  lockedBadge: '#C0C8D0',
  bossCardBg: '#FFFBEB',
} as const;

export type ColorKey = keyof typeof colors;
