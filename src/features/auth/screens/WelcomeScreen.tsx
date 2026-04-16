import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../shared/stores/authStore';
import { colors } from '../../../app/theme/colors';
import { spacing } from '../../../app/theme/spacing';
import { typography } from '../../../app/theme/typography';

type FormState = 'idle' | 'form' | 'loading' | 'error';

export function WelcomeScreen(): React.JSX.Element {
  const signInAsGuest = useAuthStore((s) => s.signInAsGuest);

  const [formState, setFormState] = useState<FormState>('idle');
  const [displayName, setDisplayName] = useState('');
  const [ageText, setAgeText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function handlePlayAsGuestPress(): void {
    setFormState('form');
    setErrorMessage('');
  }

  async function handleStartPlaying(): Promise<void> {
    const trimmedName = displayName.trim();
    const age = parseInt(ageText, 10);

    if (!trimmedName) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!ageText || isNaN(age) || age < 3 || age > 18) {
      setErrorMessage('Please enter your age (3–18).');
      return;
    }

    setFormState('loading');
    setErrorMessage('');

    try {
      await signInAsGuest(trimmedName, age);
      // NavigationRoot reacts to the auth status change — no navigate() needed.
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[WelcomeScreen] signInAsGuest failed:', message);
      setErrorMessage(message);
      setFormState('form');
    }
  }

  function handleBack(): void {
    setFormState('idle');
    setDisplayName('');
    setAgeText('');
    setErrorMessage('');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          {/* Branding */}
          <Text style={styles.titleGreek}>Μυθικό Χωριό</Text>
          <Text style={styles.titleLatin}>Mythiko Chorio</Text>
          <Text style={styles.tagline}>Learn Greek through adventure</Text>

          {formState === 'idle' && (
            <View style={styles.buttonGroup}>
              <Pressable
                style={[styles.button, styles.primaryButton]}
                onPress={handlePlayAsGuestPress}
                accessibilityRole="button"
                accessibilityLabel="Play as Guest">
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  Play as Guest
                </Text>
              </Pressable>
            </View>
          )}

          {(formState === 'form' || formState === 'error') && (
            <View style={styles.form}>
              <Text style={styles.formHeading}>Tell us about you</Text>

              <Text style={styles.label}>Your name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Alex"
                placeholderTextColor={colors.oliveGreen}
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
                returnKeyType="next"
                maxLength={40}
                accessibilityLabel="Your name"
              />

              <Text style={styles.label}>Your age</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 8"
                placeholderTextColor={colors.oliveGreen}
                value={ageText}
                onChangeText={setAgeText}
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={2}
                accessibilityLabel="Your age"
              />

              {errorMessage !== '' && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}

              <Pressable
                style={[styles.button, styles.primaryButton, styles.formSubmit]}
                onPress={handleStartPlaying}
                accessibilityRole="button"
                accessibilityLabel="Start playing">
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  Start Playing!
                </Text>
              </Pressable>

              <Pressable
                style={styles.backLink}
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Go back">
                <Text style={styles.backLinkText}>← Back</Text>
              </Pressable>
            </View>
          )}

          {formState === 'loading' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.oceanBlue} />
              <Text style={styles.loadingText}>Getting things ready…</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.softSand,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.xl,
  },
  titleGreek: {
    fontSize: typography.fontSize.greek,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  titleLatin: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.semibold,
    color: colors.terracotta,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  buttonGroup: {
    width: '100%',
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.oceanBlue,
  },
  buttonText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  primaryButtonText: {
    color: colors.cloudWhite,
  },
  form: {
    width: '100%',
  },
  formHeading: {
    fontSize: typography.fontSize.subheading,
    fontWeight: typography.fontWeight.bold,
    color: colors.oceanBlue,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.oliveGreen,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.cloudWhite,
    borderWidth: 2,
    borderColor: colors.oceanBlue,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.body,
    color: colors.oceanBlue,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.caption,
    color: colors.terracotta,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  formSubmit: {
    marginTop: spacing.sm,
  },
  backLink: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    fontSize: typography.fontSize.body,
    color: colors.oceanBlue,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.body,
    color: colors.oliveGreen,
  },
});
