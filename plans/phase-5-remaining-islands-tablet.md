# Phase 5 — Remaining Islands & Tablet Polish (Weeks 24–28)

**Goal:** Complete content and polished tablet experience.

**Milestone:** All 10 islands complete, full tablet support, staff dashboards, offline capability.

**Prerequisite:** Phase 4 complete — 6 islands playable, all 7 game types working, music system with karaoke, boss challenges, boat customisation.

---

## Tasks

- [ ] Implement Fagito (food & drink) island
- [ ] Implement Soma (body & clothes) island
- [ ] Implement Kairos (weather & seasons) island
- [ ] Implement Spiti (home & school) island
- [ ] Full tablet-optimised layouts for all screens
- [ ] Printable completion certificates
- [ ] Performance optimisation
- [ ] Offline mode for core gameplay

---

## 1. Remaining Island Vocabulary Data

> **Prompt:** "Create vocabulary data files for the final four Greek language islands, following the same structure as Chromata, Arithmoi, Oikogeneia, and Zoa.
>
> **Fagito Island (Food & Drink) — `src/data/vocabulary/fagito.ts`:**
> ψωμί (bread), νερό (water), γάλα (milk), μήλο (apple), πορτοκάλι (orange), μπανάνα (banana), τυρί (cheese), κρέας (meat), ρύζι (rice), σαλάτα (salad), παγωτό (ice cream), σοκολάτα (chocolate), μου αρέσει (I like), δεν μου αρέσει (I don't like)
>
> **Soma Island (Body & Clothes) — `src/data/vocabulary/soma.ts`:**
> κεφάλι (head), μάτια (eyes), αυτιά (ears), μύτη (nose), στόμα (mouth), χέρια (hands), πόδια (feet), μπλούζα (shirt), παντελόνι (trousers), παπούτσια (shoes), καπέλο (hat), φόρεμα (dress)
>
> **Kairos Island (Weather & Seasons) — `src/data/vocabulary/kairos.ts`:**
> ήλιος (sun), βροχή (rain), χιόνι (snow), σύννεφα (clouds), αέρας (wind), Δευτέρα (Monday), Τρίτη (Tuesday), Τετάρτη (Wednesday), Πέμπτη (Thursday), Παρασκευή (Friday), Σάββατο (Saturday), Κυριακή (Sunday), άνοιξη (spring), καλοκαίρι (summer), φθινόπωρο (autumn), χειμώνας (winter)
>
> **Spiti Island (Home & School) — `src/data/vocabulary/spiti.ts`:**
> σπίτι (house), σχολείο (school), καρέκλα (chair), τραπέζι (table), πόρτα (door), παράθυρο (window), βιβλίο (book), μολύβι (pencil), τετράδιο (notebook), δάσκαλος (teacher), μαθητής (student), τάξη (classroom)"

---

## 2. Remaining Island Level Configurations

> **Prompt:** "Create level configurations for the final four vocabulary islands, following the same 5-level + boss structure as the earlier islands.
>
> **Fagito Island levels:**
> 1. Food Hunt (Picture Hunt — Greek kitchen scene, find food items)
> 2. Food Sounds (Sound Safari — hear food name, pick the item)
> 3. Food Match (Memory Match — Greek word to food picture)
> 4. Food Bubbles (Word Bubbles — spell food words)
> 5. Boss: 'I Like' Builder (Sentence Builder — 'Μου αρέσει [food]' / 'Δεν μου αρέσει [food]')
>
> **Soma Island levels:**
> 1. Body Hunt (Picture Hunt — character illustration, tap body parts)
> 2. Body Sounds (Sound Safari — hear body part, tap the right area)
> 3. Clothes Match (Memory Match — Greek word to clothing picture)
> 4. Body Bubbles (Word Bubbles — spell body/clothing words)
> 5. Boss: Dress Up Builder (Sentence Builder + drawing — describe what someone is wearing)
>
> **Kairos Island levels:**
> 1. Weather Hunt (Picture Hunt — outdoor scene with weather elements)
> 2. Day Sounds (Sound Safari — hear day of the week, pick the correct one)
> 3. Season Match (Memory Match — season word to season picture)
> 4. Weather Bubbles (Word Bubbles — spell weather and day words)
> 5. Boss: Weather Report (Sentence Builder — describe today's weather)
>
> **Spiti Island levels:**
> 1. Classroom Hunt (Picture Hunt — classroom scene, find objects)
> 2. Home Sounds (Sound Safari — hear household word, pick the object)
> 3. School Match (Memory Match — Greek word to school object picture)
> 4. Home Bubbles (Word Bubbles — spell home/school words)
> 5. Boss: My Classroom (Sentence Builder — describe objects in the classroom)
>
> Create config files at `src/data/islands/[islandName].ts`. Include souvenir definitions for each island's backpack item."

---

## 3. Full Tablet Layouts

> **Prompt:** "Add tablet-optimised layouts for all major screens. Use the `isTablet` flag from `src/app/theme/responsive.ts` (width >= 768). Apply these layout changes:
>
> | Screen | Phone | Tablet |
> |--------|-------|--------|
> | Island Map | Scrollable vertical map | Full map visible, larger islands, no scrolling needed |
> | Level Select | Full-width vertical list | Two-column grid of level cards |
> | Memory Match | 3×4 card grid | 4×5 card grid with larger cards |
> | Word Bubbles | Standard bubble size | Larger bubbles, wider play area |
> | Picture Hunt | Full-screen scene | Scene with wider margins, larger tap targets |
> | Sentence Builder | Word tiles below sentence bar | Side-by-side: picture prompt left, sentence building right |
> | Sound Safari | Stacked options | 2×2 grid of options with more visual space |
> | Results Screen | Stacked layout | Stars and stats side by side |
> | Jukebox | Vertical song list | Grid of song cards |
> | Backpack | 3-column souvenir grid | 4-column grid with larger items |
> | Teacher Dashboard | Stacked sections | Side-by-side panels (class list left, detail right) |
> | Admin Dashboard | Stacked sections | Side-by-side panels with school stats sidebar |
>
> Create a shared `TabletLayout` wrapper component that provides the split-panel pattern. Ensure all touch targets remain at least 44pt on both layouts."

---

## 4. Completion Certificates

> **Prompt:** "Build a certificate generation feature. When a child completes all levels on an island (including the boss challenge), they can generate a printable certificate. Requirements:
> - Certificate shows: child's name (from `student_profiles.display_name` for guests, or `students.first_name` for SSO students), island name, date of completion, total stars earned on the island, a decorative border with Greek-themed illustrations
> - Generate as a PDF using the same library as the staff PDF reports
> - Share via the device's share sheet (print, email, save)
> - Trigger from a 'Get Certificate' button that appears on the island level select screen after boss completion
> - Each certificate has a unique visual theme matching its island (e.g., Chromata certificate uses colourful paint splashes, Zoa uses animal illustrations)"

---

## 5. Performance Optimisation

> **Prompt:** "Audit and optimise app performance. Focus areas:
>
> 1. **Skia canvas (Letter Lab, Letter Race):** Profile the drawing engine for input lag. Ensure stroke rendering stays under 16ms per frame. Consider reducing path complexity for older/slower devices
>
> 2. **Animations:** Audit all Reanimated and Lottie animations for frame drops. Ensure animations run on the UI thread, not the JS thread. Profile Memory Match card flips and Word Bubbles floating physics
>
> 3. **Supabase queries:** Add query profiling. Ensure `game_scores` inserts are batched if multiple scores are saved in quick succession. Check that dashboard aggregate functions complete within 500ms. Add database indexes if any queries are slow (check `EXPLAIN ANALYZE` output)
>
> 4. **Image and audio assets:** Ensure all images are appropriately sized for phone vs tablet. Lazy-load island scene images. Pre-cache audio for the current island's games
>
> 5. **Memory:** Profile memory usage during long play sessions. Ensure game screens clean up properly when navigating away. Check for Skia canvas memory leaks
>
> Create a performance checklist with before/after metrics for each area."

---

## 6. Offline Mode

> **Prompt:** "Implement offline gameplay support. Requirements:
> - Detect network connectivity using React Native's `NetInfo` library (add to dependencies)
> - When offline, gameplay continues normally — all game logic runs locally
> - Game scores and progress updates are queued in a local buffer (AsyncStorage or Zustand persisted store)
> - When connectivity returns, the queued data is synced to Supabase in order
> - Show a subtle offline indicator in the top bar (small cloud icon with a line through it)
> - Staff dashboards show a clear 'You are offline — data may not be current' banner when offline
> - Handle sync conflicts: if `island_progress` was updated both locally and remotely, keep the higher score
> - This applies to both SSO students and anonymous guests since both write to Supabase
>
> Add `@react-native-community/netinfo` to the project dependencies."

---

## Done when:
- All 10 islands are playable with full level progressions and boss challenges
- Every screen has a polished tablet layout
- Certificates can be generated and shared for completed islands
- App performs smoothly on older devices (no frame drops in games, fast dashboard loads)
- Gameplay works offline with reliable sync when reconnected
