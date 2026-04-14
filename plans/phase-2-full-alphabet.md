# Phase 2 — Full Alphabet & More Games (Weeks 8–12)

**Goal:** Complete alphabet coverage and expanded game variety.

**Milestone:** Full Greek alphabet learning experience with five game types, music, and reward systems. All scores tracked.

**Prerequisite:** Phase 1 complete — SSO and guest auth working, Alpha Island playable with Memory Match and Letter Race, scoring system operational.

---

## Tasks

- [ ] Implement Beta Island (letters Ν–Ω)
- [ ] Build Word Bubbles game type
- [ ] Build Sound Safari game type
- [ ] Build Picture Hunt game type
- [ ] Record and integrate the Alphabet Song
- [ ] Build the Jukebox screen with song playback
- [ ] Implement the Backpack (souvenir collection) screen
- [ ] Add daily streak tracking
- [ ] Tablet layout for Letter Lab (split-screen canvas + reference)

---

## 1. Beta Island — Letters Ν–Ω

> **Prompt:** "Extend the alphabet data at `src/data/alphabet/letterData.ts` to include the remaining 12 Greek letters: Ν (Nu), Ξ (Xi), Ο (Omicron), Π (Pi), Ρ (Rho), Σ (Sigma), Τ (Tau), Υ (Upsilon), Φ (Phi), Χ (Chi), Ψ (Psi), Ω (Omega). Each letter needs: uppercase SVG path, lowercase SVG path, stroke order array, pronunciation audio file reference, and a character name/personality. Follow the same data structure used for Alpha Island letters Α–Μ."

> **Prompt:** "Create the Beta Island level configuration at `src/data/islands/betaIsland.ts` with the same 5-level structure as Alpha Island:
> 1. Meet the Letters (Letter Lab — introduction to Ν–Ω)
> 2. Trace the Letters (Letter Lab — guided tracing of Ν–Ω)
> 3. Letter Sounds (Sound Safari — match sounds for Ν–Ω)
> 4. Letter Match (Memory Match — uppercase to lowercase for Ν–Ω)
> 5. Boss Challenge — Letter Race (write letters Ν–Ω from memory)
>
> Update the island map to unlock Beta Island when all Alpha Island levels have at least 1 star."

---

## 2. Word Bubbles Game

> **Prompt:** "Build a Word Bubbles game at `src/features/games/wordBubbles/`. Requirements:
> - Greek letter bubbles float upward from the bottom of the screen at varying speeds
> - A picture hint at the top shows the target word (e.g., image of a cat for 'γάτα')
> - The child pops bubbles in the correct order to spell the word
> - Correct bubble: pops with a satisfying animation and sound, letter appears in the answer bar
> - Wrong bubble: gentle shake, no penalty, bubble continues floating
> - Speed increases gradually across rounds but never becomes punishing
> - No 'game over' — if all bubbles float off screen, they respawn
> - 6 words per round for alphabet islands (short 3–4 letter words using learned letters)
>
> **Silent scoring:**
> - `accuracy`: letters popped in correct order / total letters across all words (0–1)
> - `time_spent_secs`: total round duration
> - `details` JSONB: `{ wordsCompleted: number, wordsWithoutError: number, avgLetterRecognitionMs: number }`
>
> **Animation:** Use Reanimated for bubble floating physics and pop animations. Bubbles should have a slight wobble as they float."

---

## 3. Sound Safari Game

> **Prompt:** "Build a Sound Safari game at `src/features/games/soundSafari/`. Requirements:
> - A Greek letter name or word is spoken aloud (audio plays automatically via `react-native-sound`)
> - 3–4 picture/letter options appear on screen
> - The child taps the correct one
> - Correct: option glows green, celebration sound, moves to next round
> - Incorrect: option shakes gently, audio replays, child can try again
> - 10 rounds per game session
> - Streak bonus: consecutive correct answers trigger an animated streak counter (purely visual, no gameplay impact)
>
> **Silent scoring:**
> - `accuracy`: correct on first tap / total rounds (0–1)
> - `time_spent_secs`: total session duration
> - `details` JSONB: `{ correctFirstTry: number, avgResponseTimeMs: number, confusedPairs: [{ played: string, wrongChoice: string }] }`
>
> For alphabet islands, the audio plays individual letter sounds and the options are letter images."

---

## 4. Picture Hunt Game

> **Prompt:** "Build a Picture Hunt game at `src/features/games/pictureHunt/`. Requirements:
> - A detailed illustrated scene fills the screen (e.g., a Greek kitchen, a beach, a classroom — use placeholder illustrations for now)
> - A Greek word appears at the top of the screen with its audio pronunciation
> - The child taps the matching object in the scene
> - Correct: the object animates (bounces, glows, or does a little dance), a checkmark appears, next word loads
> - Incorrect: gentle ripple animation at the tap point, word repeats
> - 8 objects to find per scene
> - Objects that have been found stay highlighted
>
> **Silent scoring:**
> - `accuracy`: correct on first tap / total items (0–1)
> - `time_spent_secs`: total scene duration
> - `details` JSONB: `{ correctFirstTap: number, avgTimePerItem: number, categoryBreakdown: { category: string, accuracy: number }[] }`
>
> For alphabet islands, the scene contains objects whose names start with specific Greek letters. The child finds objects starting with the target letter."

---

## 5. Alphabet Song & Jukebox

> **Prompt 1 — Audio integration:** "Create an audio service at `src/shared/services/audioService.ts` that wraps `react-native-sound` with:
> - `playSong(songId: string)` — plays a song from the assets/audio directory
> - `pauseSong()` / `resumeSong()` / `stopSong()`
> - `playSoundEffect(effectId: string)` — for game sounds (correct, incorrect, celebration)
> - `playLetterSound(letter: string)` — plays the pronunciation of a Greek letter
> - Track current playback position for karaoke mode (later)
> - Handle audio focus and interruptions gracefully"

> **Prompt 2 — Jukebox screen:** "Build a JukeboxScreen at `src/features/jukebox/screens/JukeboxScreen.tsx`. Requirements:
> - Visual theme: a vinyl record player or music box illustration
> - List of songs — currently just the Alphabet Song (more added in Phase 4)
> - Unlocked songs show album-art-style illustrations and can be tapped to play
> - Locked songs appear as silhouettes with a padlock
> - Play/pause/replay controls
> - A 'Sing Along' button (placeholder — karaoke mode built in Phase 4)
> - Songs unlock as islands are completed
>
> Song data from `src/data/songs/songConfig.ts`:
> - Alphabet Song: unlocked after Alpha Island, covers all 24 letters"

---

## 6. Backpack (Souvenir Collection)

> **Prompt:** "Build a BackpackScreen at `src/features/rewards/screens/BackpackScreen.tsx`. Requirements:
> - Grid display of souvenir slots (one per island, with some islands having multiple souvenirs)
> - Collected souvenirs show their illustration and the island they came from
> - Empty slots show a mystery silhouette
> - Counter: 'X of Y souvenirs collected'
> - Tapping a collected souvenir shows a detail card with the island name and when it was earned
> - Load souvenir data from the `souvenirs` table in Supabase for the current player's profile
> - Animated reveal when a new souvenir is first viewed
>
> For Phase 2, souvenirs are earned for completing all levels on each island (1 souvenir per island). Alpha and Beta Islands should have souvenirs defined:
> - Alpha Island: 'Golden Alpha' (a golden letter Α trophy)
> - Beta Island: 'Omega Crown' (a crown with Ω on it)"

---

## 7. Daily Streak Tracking

> **Prompt:** "Add daily streak tracking to the app. Requirements:
> - Track consecutive days the player has completed at least one game
> - Store `streak_days` and `last_active` on the `student_profiles` table (already exists)
> - On app open, check if `last_active` was yesterday → increment streak. If it was today → no change. If it was >1 day ago → reset to 1
> - Show the streak count on the Island Map top bar with a friendly octopus character icon
> - Milestone animations at 7 days and 30 days (Lottie animation placeholder)
> - Create a Zustand store slice for streak state
> - Update `last_active` and `streak_days` via Supabase on each game completion"

---

## 8. Tablet Layout for Letter Lab

> **Prompt:** "Add a tablet-optimised layout to the Letter Lab tracing screen. When `isTablet` is true (screen width >= 768):
> - Split the screen: drawing canvas on the left (60% width), reference panel on the right (40% width)
> - The reference panel shows: the target letter at full size, stroke order diagram, the letter's character name, and a 'play sound' button
> - On phone, keep the existing full-screen canvas layout with the reference letter in the top corner
> - Use the `isTablet` flag from `src/app/theme/responsive.ts`"

---

## Done when:
- Beta Island is playable with all 5 levels
- Word Bubbles, Sound Safari, and Picture Hunt games are functional
- The Alphabet Song plays in the Jukebox
- Backpack shows collected souvenirs from Alpha and Beta Islands
- Daily streak tracks and displays correctly
- Letter Lab has a split-screen layout on tablets
- All five game types silently record scores to Supabase
