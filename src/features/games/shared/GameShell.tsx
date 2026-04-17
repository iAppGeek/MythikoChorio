import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../app/theme/colors';
import { gameStyles } from '../../../app/theme/gameStyles';

type Props = {
  /** Game title shown at the top of the screen. */
  title: React.ReactNode;
  /** Called when the user taps the X in the header. */
  onExit: () => void;
  /** Blocks the body with a spinner while true (resume prompt, finishGame…). */
  loading: boolean;
  /** Blocks the body with a spinner while persistence is in-flight. */
  saving: boolean;
  /** Optional rows rendered beneath the title row (score line, progress bar). */
  headerExtras?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Shared outer chrome for every Phase-1 game screen:
 *   - SafeAreaView + softSand background
 *   - loading/saving spinner gate
 *   - header row with exit button + centred title + spacer
 *
 * Game mechanics live in `children`. Anything that belongs to the header
 * beyond the title (progress bars, score lines, step dots) goes in
 * `headerExtras`.
 */
export function GameShell({
  title,
  onExit,
  loading,
  saving,
  headerExtras,
  children,
}: Props): React.JSX.Element {
  if (loading || saving) {
    return (
      <SafeAreaView style={gameStyles.container}>
        <ActivityIndicator
          size="large"
          color={colors.oceanBlue}
          style={gameStyles.loader}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={gameStyles.container} edges={['top', 'bottom']}>
      <View style={gameStyles.header}>
        <View style={gameStyles.headerRow}>
          <Pressable
            style={gameStyles.exitBtn}
            onPress={onExit}
            accessibilityRole="button"
            accessibilityLabel="Save and exit">
            <Text style={gameStyles.exitText}>✕</Text>
          </Pressable>
          {typeof title === 'string' ? (
            <Text style={gameStyles.title}>{title}</Text>
          ) : (
            title
          )}
          <View style={gameStyles.exitBtn} />
        </View>
        {headerExtras}
      </View>
      {children}
    </SafeAreaView>
  );
}
