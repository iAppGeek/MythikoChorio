/**
 * Thin wrapper around `react-native-sound`. Asset filenames are wired in once
 * audio ships in `ios` / `android` bundles (see LETTER_SOUND_FILES, etc.).
 */
import Sound from 'react-native-sound';

Sound.setCategory('Ambient', true);

let songInstance: Sound | null = null;

function unloadSong(): void {
  if (songInstance) {
    songInstance.stop();
    songInstance.release();
    songInstance = null;
  }
}

const LETTER_SOUND_FILES: Partial<Record<string, string>> = {};

const SOUND_EFFECT_FILES: Partial<Record<string, string>> = {};

const SONG_FILES: Partial<Record<string, string>> = {};

export function playSong(songId: string): void {
  unloadSong();
  const filename = SONG_FILES[songId];
  if (!filename) return;
  const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
    if (error) return;
    songInstance = sound;
    songInstance.setNumberOfLoops(-1);
    songInstance.play();
  });
}

export function pauseSong(): void {
  songInstance?.pause();
}

export function resumeSong(): void {
  songInstance?.play();
}

export function stopSong(): void {
  unloadSong();
}

export function playSoundEffect(effectId: string): void {
  const filename = SOUND_EFFECT_FILES[effectId];
  if (!filename) return;
  const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
    if (error) return;
    sound.play(() => sound.release());
  });
}

export function playLetterSound(letterId: string): void {
  const filename = LETTER_SOUND_FILES[letterId];
  if (!filename) return;
  const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
    if (error) return;
    sound.play(() => sound.release());
  });
}

/** Reserved for karaoke / Phase 4 — returns null until playback tracking is wired. */
export function getSongPositionSeconds(): number | null {
  return null;
}
