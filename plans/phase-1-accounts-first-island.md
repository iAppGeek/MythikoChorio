# Phase 1 — Accounts & First Island (Weeks 3–7)

**Goal:** Microsoft SSO login, guest mode, and the first playable island.

**Milestone:** A student can sign in with Microsoft and play through Alpha Island. A guest can play the same content without signing in. Both write scores to Supabase — students linked to their record, guests anonymous.

**Prerequisite:** Phase 0 complete — app runs on both platforms, Supabase connected, database migrated.

---

## Tasks

- [ ] Implement Microsoft SSO login flow (Azure AD → Supabase Auth)
- [ ] Build role resolution logic (check `staff` table, then `students` table with `app_active` flag)
- [ ] Build the "not activated" screen for students with `app_active = FALSE`
- [ ] Implement guest flow (name + age entry, Supabase anonymous auth, create anonymous `student_profile`)
- [ ] Build the island map home screen (static, only Alpha Island unlocked)
- [ ] Implement the Letter Lab tracing engine for guided and free writing
- [ ] Create Alpha Island (letters Α–Μ) with 4–5 game levels
- [ ] Build Memory Match and Letter Race game types
- [ ] Implement star scoring and results screen
- [ ] Implement silent score recording to Supabase (same path for students and guests)
- [ ] Basic phone layout; responsive foundations in place for tablet later

---

## 1. Authentication Service

### Auth flow overview

```
Welcome Screen
├── [Sign in with Microsoft] → SSO → resolve_user_role()
│   ├── staff (teacher)      → Teacher Dashboard
│   ├── staff (admin/head)   → Admin Dashboard
│   ├── student (app_active) → Island Map
│   ├── student (!app_active)→ "Not activated" screen
│   └── unregistered         → "Not registered" screen
│
└── [Play as Guest] → Enter name + age
    → Supabase anonymous auth (silent)
    → Create student_profile (student_id = NULL, is_guest = TRUE)
    → Island Map
```

### Prompts

> **Prompt 1 — Auth service:** "Create an auth service at `src/shared/services/authService.ts` for a React Native app using Supabase. It should have three functions:
> 1. `signInWithMicrosoft()` — triggers Supabase OAuth with Azure AD provider, opens the Microsoft sign-in page using `react-native-inappbrowser-reborn`, and returns the session.
> 2. `signInAsGuest()` — calls `supabase.auth.signInAnonymously()` and returns the session.
> 3. `resolveUserRole(email: string)` — calls the `resolve_user_role` Supabase database function and returns `{ role: string, recordId: string, isAppActive: boolean }`.
> 4. `signOut()` — signs out the current user.
> Use the Supabase client from `src/shared/services/supabaseClient.ts`."

> **Prompt 2 — Welcome screen:** "Build a WelcomeScreen component at `src/features/auth/screens/WelcomeScreen.tsx`. It should have:
> - The app name 'GreekPlay' in a large playful font (Nunito or Baloo)
> - A 'Sign in with Microsoft' button that calls `signInWithMicrosoft()`, then `resolveUserRole()`, and navigates based on the result: teacher → TeacherDashboard, admin/headteacher → AdminDashboard, student with app_active → IslandMap, student without app_active → NotActivatedScreen, unregistered → UnregisteredScreen
> - A 'Play as Guest' button that shows a name/age entry form, then calls `signInAsGuest()`, creates a `student_profile` in Supabase with `is_guest = TRUE` and `student_id = NULL`, and navigates to IslandMap
> - Use the theme colours: Ocean Blue (#3B82F6), Cloud White (#F8FAFC), Soft Sand (#FDF6EC)
> - Warm, child-friendly visual style with rounded corners and large tap targets"

> **Prompt 3 — Not activated screen:** "Build a simple NotActivatedScreen at `src/features/auth/screens/NotActivatedScreen.tsx`. It shows a friendly message: 'Your account isn't activated for GreekPlay yet. Ask your teacher to activate you.' with a 'Try Again' button that re-checks `app_active` and a 'Sign Out' button. Use a sad-but-cute character illustration placeholder."

> **Prompt 4 — Guest profile creation:** "Write a function `createGuestProfile` in the auth service that inserts a new row into `student_profiles` via Supabase with: `student_id = null`, `is_guest = true`, `display_name` from user input, `age` from user input, `auth_user_id` from the current anonymous session's user id, `current_island = 'alpha'`, `total_stars = 0`. Return the created profile."

---

## 2. Island Map Home Screen

The island map is the main gameplay hub. For Phase 1, only Alpha Island is unlocked — all others are visible but locked.

> **Prompt:** "Build an IslandMapScreen at `src/features/map/screens/IslandMapScreen.tsx`. Requirements:
> - Full-screen scrollable illustrated map background (use a placeholder image for now — warm watercolour style, blue sea, Greek islands)
> - 10 island markers positioned on the map. Each island has a name, theme, and locked/unlocked state
> - Only 'Alpha Island' is unlocked initially. Locked islands appear faded with a padlock icon
> - Tapping an unlocked island navigates to an IslandLevelSelectScreen
> - Top bar shows: player name, total stars count, streak days count
> - Bottom nav bar with 3 icons: Jukebox (placeholder), Backpack (placeholder), Settings (placeholder)
> - Island data should come from a config file at `src/data/islands/islandConfig.ts`
> - Use React Native Reanimated for smooth island tap animations (gentle bounce)
>
> Island config:
> | Island | Theme | Unlock Condition |
> |--------|-------|-----------------|
> | Alpha Island | Greek Alphabet (Α–Μ) | Start |
> | Beta Island | Greek Alphabet (Ν–Ω) | After Alpha |
> | Chromata Island | Colours | After Beta |
> | Arithmoi Island | Numbers 1–20 | After Chromata |
> | Oikogeneia Island | Family | After Arithmoi |
> | Zoa Island | Animals | After Oikogeneia |
> | Fagito Island | Food & Drink | After Zoa |
> | Soma Island | Body & Clothes | After Fagito |
> | Kairos Island | Weather & Seasons | After Soma |
> | Spiti Island | Home & School | After Kairos |"

---

## 3. Alpha Island — Level Select

> **Prompt:** "Build an IslandLevelSelectScreen at `src/features/map/screens/IslandLevelSelectScreen.tsx`. It receives an island ID as a navigation parameter and displays:
> - The island name and theme at the top
> - A vertical list of 5 levels, each showing: level name, star rating (0–3 stars), and locked/unlocked state
> - Completed levels show earned stars. The next uncompleted level is unlocked. Later levels show a padlock
> - Tapping an unlocked level navigates to the appropriate game screen
> - A 'Boss Challenge' at the bottom, unlocked only when all other levels are complete
> - Level data comes from `island_progress` in Supabase for the current player's profile
>
> For Alpha Island, the 5 levels are:
> 1. Meet the Letters (Letter Lab — introduction to Α–Μ)
> 2. Trace the Letters (Letter Lab — guided tracing of Α–Μ)
> 3. Letter Sounds (Sound Safari — match letter sounds)
> 4. Letter Match (Memory Match — uppercase to lowercase)
> 5. Boss Challenge — Letter Race (write letters from memory)"

---

## 4. Letter Lab — Tracing Engine

This is the most technically complex piece in Phase 1. It uses `@shopify/react-native-skia` for the drawing canvas.

> **Prompt:** "Build a Letter Lab tracing system at `src/features/letterLab/`. Requirements:
> 
> **Letter Introduction Sequence (5 steps per letter):**
> 1. Meet the Letter — animated character version of the letter with its sound played via `react-native-sound`
> 2. Watch It Write — the letter draws itself with a glowing stroke animation showing correct stroke order
> 3. Guided Trace — child traces over the letter following guide dots and arrows. Use `@shopify/react-native-skia` for the canvas. Gentle haptic feedback on correct strokes
> 4. Free Write — child writes independently. Evaluate shape accuracy by comparing to the template path
> 5. Letter Challenge — pick this letter from a group of 4
>
> **Canvas requirements:**
> - Use `@shopify/react-native-skia` Canvas component
> - Large canvas area (70% of screen height)
> - Semi-transparent letter template shown as a tracing guide
> - Stroke-order arrows animate before the child begins
> - Support left-hand and right-hand modes
> - 'Chalk on blackboard' visual style (dark background, white/coloured strokes)
>
> **Data structure:**
> - Create `src/data/alphabet/letterData.ts` containing stroke path data for Greek letters Α through Μ (first 12 letters)
> - Each letter needs: uppercase SVG path, lowercase SVG path, stroke order array, pronunciation audio file reference, character name/personality
>
> **Scoring (silent — not shown to child):**
> - Stroke order accuracy (0–1)
> - Shape accuracy compared to template (0–1)
> - Record to `game_scores` table via Supabase with `game_type = 'letterLab'` and `details` JSONB containing per-letter metrics"

---

## 5. Memory Match Game

> **Prompt:** "Build a Memory Match game at `src/features/games/memoryMatch/`. Requirements:
> - 3×4 grid of face-down cards on phone (12 cards = 6 pairs)
> - Card pairs: match Greek uppercase letter to its lowercase form (for Alpha Island: Α↔α, Β↔β, Γ↔γ, Δ↔δ, Ε↔ε, Ζ↔ζ)
> - Tap a card to flip it (smooth flip animation using Reanimated). Tap a second card — if they match, both stay face up with a celebration animation. If not, both flip back after 1 second
> - Game ends when all pairs are found
> - No timer for younger children (configurable for older children later)
> - No 'game over' state — just encouragement
>
> **Silent scoring (recorded to Supabase, never shown to child):**
> - `accuracy`: pairs found on first try / total pairs (0–1)
> - `time_spent_secs`: total game duration
> - `hints_used`: 0 for now (hint system added later)
> - `attempts`: number of total flips / 2
> - `details` JSONB: `{ pairsFirstFlip: number, avgTimeBetweenFlips: number, difficultPairs: string[] }`
>
> **Props:** Receives `islandId`, `levelId`, and an array of card pairs from the level config."

---

## 6. Letter Race Game

> **Prompt:** "Build a Letter Race game at `src/features/games/letterRace/`. Requirements:
> - A Greek letter (or short word for later phases) appears on screen for 3 seconds, then disappears
> - The child writes it from memory on a Skia canvas (same drawing engine as Letter Lab)
> - After the child finishes (tap 'Done' button), compare their drawing to the template
> - Show encouraging feedback: 'Μπράβο!' for good attempts, 'Try again!' with the correct letter shown for poor attempts
> - Cycle through 6 letters per round, then show results
>
> **Silent scoring:**
> - `accuracy`: shape match score averaged across all letters (0–1)
> - `time_spent_secs`: total round duration
> - `details` JSONB: `{ perLetter: [{ letter: string, accuracy: number, timeMs: number }] }`
>
> **Props:** Receives `islandId`, `levelId`, and an array of letters to test."

---

## 7. Scoring & Results System

### Score formula

```
normalised_score = (accuracy × 0.6) + (speed_factor × 0.2) + (independence_factor × 0.2)

Where:
- accuracy = correct answers / total answers (0–1, scaled to 0–60)
- speed_factor = performance relative to expected time for age group (0–1, scaled to 0–20)
- independence_factor = 1 minus (hints_used / max_possible_hints) (0–1, scaled to 0–20)
```

Stars: 0–40 = 1 star, 41–70 = 2 stars, 71–100 = 3 stars. Every completion earns at least 1 star.

> **Prompt 1 — Score service:** "Create a score service at `src/shared/services/scoreService.ts` with:
> 1. `calculateScore(accuracy: number, timeSpentSecs: number, expectedTimeSecs: number, hintsUsed: number, maxHints: number): number` — returns normalised 0–100 score using the formula above
> 2. `scoreToStars(score: number): number` — returns 1, 2, or 3
> 3. `saveGameScore(params: { studentProfileId, gameType, islandId, levelId, score, accuracy, timeSpentSecs, hintsUsed, attempts, deviceType, details })` — inserts into `game_scores` table via Supabase
> 4. `updateIslandProgress(params: { studentProfileId, islandId, levelId, starsEarned, score })` — upserts into `island_progress` table (update if better score, increment times_played)"

> **Prompt 2 — Results screen:** "Build a ResultsScreen at `src/features/games/shared/ResultsScreen.tsx`. It receives score data and shows:
> - 1–3 animated stars (always at least 1) with a bounce-in animation
> - 'Μπράβο!' (Well done!) text
> - 'Words Learned: X' count
> - Souvenir earned (if applicable) with a reveal animation
> - [Replay] and [Next Level] buttons
> - No numeric score shown — the child only sees stars and encouragement
> - Confetti or sparkle animation for 3 stars"

---

## 8. Navigation Updates

> **Prompt:** "Update the NavigationRoot to include the full Phase 1 navigation structure:
> - AuthStack: WelcomeScreen, NotActivatedScreen, UnregisteredScreen
> - PlayerStack: IslandMapScreen, IslandLevelSelectScreen, LetterLabScreen, MemoryMatchScreen, LetterRaceScreen, ResultsScreen
> - StaffStack (placeholder): TeacherDashboardScreen, AdminDashboardScreen
> - Root navigator checks auth state: no session → AuthStack, guest/student session → PlayerStack, staff session → StaffStack
> - Use Zustand store for auth state management with: `user`, `role`, `studentProfile`, `isGuest` fields"

---

## Done when:
- A user can sign in with Microsoft and be routed to the correct screen based on their role
- A guest can enter name/age and start playing immediately
- Alpha Island shows 5 levels that unlock sequentially
- Letter Lab tracing works for letters Α–Μ with guided and free-write modes
- Memory Match and Letter Race games are playable
- Scores are silently recorded to Supabase after each game
- Results screen shows stars and encouragement
- All of the above works identically for SSO students and anonymous guests
