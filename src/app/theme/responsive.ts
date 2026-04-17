import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * True on devices ≥768pt wide (iPad, most Android tablets). Feeds into
 * `typography.ts` and `spacing.ts` so font sizes and screen padding scale
 * up on larger surfaces without every call site needing to branch.
 */
export const isTablet = width >= 768;
