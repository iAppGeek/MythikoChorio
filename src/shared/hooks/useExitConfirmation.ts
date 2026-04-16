import { useCallback } from 'react';
import { Alert } from 'react-native';

type NavigationLike = { goBack: () => void };

/**
 * Returns a handler that shows a "Save & Exit" confirmation alert.
 * The caller provides `onSave` to persist current game state before exiting.
 */
export function useExitConfirmation(
  navigation: NavigationLike,
  onSave: () => void,
): () => void {
  return useCallback((): void => {
    Alert.alert(
      'Save & Exit',
      'Your progress has been saved. Continue later?',
      [
        { text: 'Keep Playing', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: (): void => {
            onSave();
            navigation.goBack();
          },
        },
      ],
    );
  }, [navigation, onSave]);
}
