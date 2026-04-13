import { isTablet } from './responsive';

export const typography = {
  fontSize: {
    heading: isTablet ? 32 : 24,
    subheading: isTablet ? 24 : 18,
    body: isTablet ? 18 : 14,
    caption: isTablet ? 14 : 12,
    greek: isTablet ? 48 : 36,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;
