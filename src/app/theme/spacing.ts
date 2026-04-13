import { isTablet } from './responsive';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screen: isTablet ? 32 : 16,
  card: isTablet ? 16 : 8,
} as const;
