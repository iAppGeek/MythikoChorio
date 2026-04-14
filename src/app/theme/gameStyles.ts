import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

/**
 * Shared styles used across game screens (LetterLab, SoundSafari,
 * MemoryMatch, LetterRace) and their sub-steps.
 */
export const gameStyles = StyleSheet.create({
  // ── Screen root
  container: {
    flex: 1,
    backgroundColor: colors.softSand,
  },
  loader: {
    flex: 1,
  },

  // ── Game header (exit button + title/progress + progress bar)
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exitBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitText: {
    fontSize: 18,
    color: colors.muted,
    fontWeight: typography.fontWeight.medium,
  },

  // ── Progress bar
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%' as const,
    backgroundColor: colors.sunshineYellow,
    borderRadius: 3,
  },

  // ── Step label (uppercase category above content)
  stepLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },

  // ── Centred step content area
  stepBody: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: spacing.screen,
    gap: spacing.lg,
  },

  // ── Canvas wrapper (Skia drawing surface)
  canvasWrapper: {
    borderRadius: 16,
    overflow: 'hidden' as const,
    backgroundColor: colors.cloudWhite,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  canvasWrapperBordered: {
    borderWidth: 2,
    borderColor: colors.border,
  },

  // ── Buttons
  btn: {
    backgroundColor: colors.oceanBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center' as const,
  },
  btnPressed: {
    opacity: 0.75,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnText: {
    color: colors.cloudWhite,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.oceanBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center' as const,
  },
  btnSecondaryText: {
    color: colors.oceanBlue,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },

  // ── Button row
  row: {
    flexDirection: 'row' as const,
    gap: spacing.md,
  },

  // ── Quiz option styles
  option: {
    backgroundColor: colors.cloudWhite,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    width: '47%' as unknown as number,
    alignItems: 'center' as const,
    gap: 2,
  },
  optionPressed: {
    opacity: 0.75,
  },
  optionCorrect: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
  },
  optionWrong: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
  },

  // ── Character display card
  charCard: {
    backgroundColor: colors.cloudWhite,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Title text (used in game headers)
  title: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    textAlign: 'center' as const,
  },

  // ── Subtitle / score text
  subtitle: {
    fontSize: typography.fontSize.caption,
    color: colors.oliveGreen,
    textAlign: 'center' as const,
  },

  // ── Feedback text
  feedback: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
  },
});
