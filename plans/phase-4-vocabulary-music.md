# Phase 4 — Vocabulary Islands & Music (Weeks 18–23)

**Goal:** First vocabulary islands and the full music experience.

**Milestone:** Six islands playable with the full set of seven game types, complete music system, and all reward mechanics.

**Prerequisite:** Phase 3 complete — staff dashboards working, guest-to-student linking operational, five game types and two alphabet islands fully functional.

---

## Tasks

- [ ] Implement Chromata (colours) island
- [ ] Implement Arithmoi (numbers) island
- [ ] Implement Oikogeneia (family) island
- [ ] Implement Zoa (animals) island
- [ ] Build Sentence Builder game type
- [ ] Build Sing & Tap game type
- [ ] Record and integrate all planned songs
- [ ] Build karaoke mode
- [ ] Implement word-level writing (tracing and free-writing short words)
- [ ] Implement boss challenges for each completed island
- [ ] Boat customisation feature

---

## 1. Vocabulary Data

> **Prompt:** "Create vocabulary data files for four Greek language islands. Each island needs a `src/data/vocabulary/[islandName].ts` file containing an array of vocabulary items. Each item has: `greekWord`, `transliteration`, `englishMeaning`, `imageRef` (placeholder path), `audioRef` (placeholder path), `category`.
>
> **Chromata Island (Colours) — `chromata.ts`:**
> κόκκινο (red), μπλε (blue), πράσινο (green), κίτρινο (yellow), πορτοκαλί (orange), μωβ (purple), ροζ (pink), μαύρο (black), άσπρο (white), καφέ (brown)
>
> **Arithmoi Island (Numbers 1–20) — `arithmoi.ts`:**
> ένα (1), δύο (2), τρία (3), τέσσερα (4), πέντε (5), έξι (6), εφτά (7), οχτώ (8), εννιά (9), δέκα (10), έντεκα (11), δώδεκα (12), δεκατρία (13), δεκατέσσερα (14), δεκαπέντε (15), δεκαέξι (16), δεκαεφτά (17), δεκαοχτώ (18), δεκαεννιά (19), είκοσι (20)
>
> **Oikogeneia Island (Family) — `oikogeneia.ts`:**
> μαμά (mum), μπαμπάς (dad), αδερφός (brother), αδερφή (sister), γιαγιά (grandma), παππούς (grandpa), γεια σου (hello), καλημέρα (good morning), ευχαριστώ (thank you), παρακαλώ (please)
>
> **Zoa Island (Animals) — `zoa.ts`:**
> γάτα (cat), σκύλος (dog), ψάρι (fish), πουλί (bird), αγελάδα (cow), πρόβατο (sheep), άλογο (horse), κουνέλι (rabbit), χελώνα (turtle), δελφίνι (dolphin), πεταλούδα (butterfly), μέλισσα (bee), ελέφαντας (elephant), λιοντάρι (lion), μαϊμού (monkey)"

---

## 2. Island Level Configurations

> **Prompt:** "Create level configurations for four vocabulary islands. Each island has 5 game levels plus a boss challenge. Create config files at `src/data/islands/[islandName].ts` following the same structure as Alpha and Beta Islands.
>
> **Chromata Island levels:**
> 1. Meet the Colours (Picture Hunt — tap colours in a Greek art studio scene)
> 2. Colour Sounds (Sound Safari — hear colour name, pick the colour)
> 3. Colour Match (Memory Match — Greek word to colour swatch)
> 4. Colour Bubbles (Word Bubbles — spell colour words)
> 5. Boss: Colour Sentence Builder — build simple sentences: 'Το [αντικείμενο] είναι [χρώμα]'
>
> **Arithmoi Island levels:**
> 1. Count Along (Picture Hunt — tap the correct number of objects)
> 2. Number Sounds (Sound Safari — hear number, pick the digit)
> 3. Number Match (Memory Match — Greek word to numeral)
> 4. Number Bubbles (Word Bubbles — spell number words)
> 5. Boss: Number Race (Letter Race variant — see a number, write the Greek word)
>
> **Oikogeneia Island levels:**
> 1. Meet the Family (Picture Hunt — family scene, identify family members)
> 2. Family Sounds (Sound Safari — hear relationship word, pick the person)
> 3. Greeting Match (Memory Match — Greek greeting to situation picture)
> 4. Family Bubbles (Word Bubbles — spell family/greeting words)
> 5. Boss: Greeting Builder (Sentence Builder — arrange greetings in context)
>
> **Zoa Island levels:**
> 1. Animal Hunt (Picture Hunt — farm/zoo scene, find animals)
> 2. Animal Sounds (Sound Safari — hear animal name, pick the animal)
> 3. Animal Match (Memory Match — Greek word to animal picture)
> 4. Animal Bubbles (Word Bubbles — spell animal names)
> 5. Boss: Animal Race (Letter Race variant — see animal picture, write the Greek word)"

---

## 3. Sentence Builder Game

> **Prompt:** "Build a Sentence Builder game at `src/features/games/sentenceBuilder/`. Requirements:
> - A picture prompt shows the meaning of the target sentence (e.g., image of a red ball)
> - Greek word tiles are scattered at the bottom of the screen in random order
> - The child drags tiles into a sentence bar at the top in the correct order
> - Correct placement: tile snaps into place with a satisfying click sound
> - Incorrect placement: tile bounces back to the pool with a gentle shake
> - A hint button reveals the next correct word's position (counts as hint_used)
> - Starts with 2-word phrases for Chromata ('Κόκκινο μπαλί'), progresses to 4–5 word sentences
> - 6 sentences per round
>
> **Silent scoring:**
> - `accuracy`: words placed correctly on first try / total words across all sentences (0–1)
> - `time_spent_secs`: total round duration
> - `hints_used`: number of times the hint button was tapped
> - `details` JSONB: `{ sentencesCompleted: number, avgTimePerSentence: number, difficultStructures: string[] }`
>
> Use React Native Gesture Handler for drag-and-drop. Tiles should have a slight rotation when being dragged for a tactile feel."

---

## 4. Sing & Tap Game

> **Prompt:** "Build a Sing & Tap music game at `src/features/games/singAndTap/`. Requirements:
> - A Greek song plays with lyrics displayed karaoke-style (highlighted word by word as the song progresses)
> - Rhythm targets appear on screen timed to the beat — the child taps them
> - Key vocabulary words in the lyrics glow and can be tapped for pronunciation and meaning (shown as a tooltip)
> - Tapping vocabulary words is tracked as curiosity (positive signal, not scored negatively)
> - The song plays regardless of tap accuracy — the child always hears the full song
>
> **Silent scoring:**
> - `accuracy`: taps on beat / total beats (0–1). A tap is 'on beat' if within 200ms of the target
> - `time_spent_secs`: song duration
> - `details` JSONB: `{ rhythmAccuracy: number, vocabWordsTapped: string[], songCompletionRate: number }`
>
> Use `react-native-sound` for playback. Song timing data (beat timestamps, lyric sync points) comes from `src/data/songs/[songId].ts`."

---

## 5. Songs — Recording & Integration

> **Prompt:** "Create song configuration files at `src/data/songs/` for each planned song. Each song config needs: `songId`, `title`, `islandUnlock` (which island completion unlocks it), `audioRef`, `durationMs`, `lyrics` (array of `{ text, startMs, endMs }`), `beats` (array of `{ timestampMs }` for Sing & Tap targets), `vocabularyHighlights` (array of `{ word, startMs, endMs, meaning }`).
>
> Create configs for:
> 1. **Alphabet Song** — covers all 24 letters, unlocked after Alpha Island
> 2. **Counting Song** — numbers 1–20 with a rhythmic beat, unlocked after Arithmoi Island
> 3. **Colour Song** — each colour gets a verse, unlocked after Chromata Island
> 4. **Days of the Week** — marching rhythm, unlocked after Kairos Island (placeholder — island not built yet)
> 5. **Greeting Song** — Γεια σου, Καλημέρα, Ευχαριστώ, unlocked after Oikogeneia Island
> 6. **Body Parts Song** — head shoulders knees and toes equivalent, unlocked after Soma Island (placeholder)
>
> Use placeholder audio file paths — actual recordings will be added separately. The configs should be complete with realistic lyrics and timing data."

---

## 6. Karaoke Mode for Jukebox

> **Prompt:** "Add karaoke mode to the JukeboxScreen. When the user taps 'Sing Along' on a song:
> - Switch to a full-screen karaoke view
> - Lyrics scroll vertically with the current line highlighted and centred
> - A bouncing ball or highlight moves across each word in sync with the audio timing data from the song config
> - Transliterated lyrics shown below the Greek text in smaller font (so children can attempt pronunciation)
> - Background shows a gentle animated scene related to the song theme
> - Close button returns to the Jukebox list
> - No scoring in karaoke mode — this is purely for fun and exposure"

---

## 7. Word-Level Writing

> **Prompt:** "Extend the Letter Lab tracing system to support word-level writing. Requirements:
> - After completing both alphabet islands, a new 'Word Writing' option appears in the Letter Lab
> - Simple 3–5 letter Greek words from the current island's vocabulary
> - The word appears as a semi-transparent guide, letter by letter, with the full word shown above
> - The child traces each letter in sequence on the canvas
> - When the word is completed correctly, an animated illustration appears (e.g., write 'γάτα' and a cat jumps onto the screen)
> - Reuse the existing Skia canvas and stroke evaluation from the letter tracing engine
>
> **Silent scoring:** Same metrics as Letter Lab but aggregated per-word. `details` JSONB includes `{ word: string, perLetterAccuracy: number[], overallAccuracy: number }`."

---

## 8. Boss Challenges

> **Prompt:** "Create a boss challenge system. Boss challenges are the final level on each island that test everything learned. Requirements:
> - Unlocked only when all other levels on the island have at least 1 star
> - Mixes multiple game types in one session: e.g., 3 rounds of Sound Safari + 3 rounds of Memory Match + a Sentence Builder
> - A special animated intro: a friendly 'boss' character (themed to the island) appears and challenges the child
> - Higher bar for 3 stars (score must be 80+ instead of 71+)
> - Completing the boss unlocks: the next island, a souvenir for the backpack, and a sailing animation to the next island
>
> Create boss configs for all 4 vocabulary islands (Chromata, Arithmoi, Oikogeneia, Zoa) that combine the game types available on each island."

---

## 9. Boat Customisation

> **Prompt:** "Build a boat customisation feature. Requirements:
> - The child's boat is visible on the Island Map, docked at their current island
> - Tapping the boat opens a customisation screen
> - Customisation options: hull colour (6 options), sail pattern (4 options), flag (4 options), decorations (6 options like bunting, a parrot, a Greek flag)
> - Options unlock by earning tokens — 1 token per island boss completed, 1 token per 50 total stars
> - Each customisation costs 1 token
> - The customised boat is stored as a JSON object on the `student_profiles` table (add a `boat_config JSONB` column if needed — or store in `avatar_id` field)
> - The boat renders as an SVG on the Island Map with the selected customisations applied"

---

## Done when:
- Chromata, Arithmoi, Oikogeneia, and Zoa islands are all playable (6 total islands)
- Sentence Builder and Sing & Tap games work correctly
- All 7 game types are now available across the app
- Songs play in the Jukebox with karaoke mode
- Word-level writing works for vocabulary from completed islands
- Boss challenges test combined skills and unlock next islands
- Boat customisation is functional
- All scores recorded to Supabase
