import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const isTablet = width >= 768;

export const layout = {
  cardColumns: isTablet ? 4 : 3,
  canvasWidth: isTablet ? '60%' : ('100%' as const),
  fontSize: {
    heading: isTablet ? 32 : 24,
    body: isTablet ? 18 : 14,
    greek: isTablet ? 48 : 36,
  },
  spacing: {
    screen: isTablet ? 32 : 16,
    card: isTablet ? 16 : 8,
  },
} as const;
