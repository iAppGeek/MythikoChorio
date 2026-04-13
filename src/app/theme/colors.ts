export const colors = {
  oceanBlue: '#3B82F6',
  sunshineYellow: '#FBBF24',
  terracotta: '#E07A5F',
  oliveGreen: '#6B8F71',
  cloudWhite: '#F8FAFC',
  softSand: '#FDF6EC',
} as const;

export type ColorKey = keyof typeof colors;
