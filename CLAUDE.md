# Mythiko Chorio — Developer Guide

Greek language learning app for children, built with React Native 0.85 + TypeScript.

---

## Running the app

### iOS simulator

```bash
# First time only — installs CocoaPods via Bundler
cd ios && LANG=en_US.UTF-8 bundle exec pod install && cd ..

# Run on booted simulator
LANG=en_US.UTF-8 npx react-native run-ios

# Target a specific simulator
LANG=en_US.UTF-8 npx react-native run-ios --simulator "iPhone 17 Pro"
```

> `LANG=en_US.UTF-8` is required because CocoaPods fails on macOS when the locale is not UTF-8.
> Add `export LANG=en_US.UTF-8` to `~/.zshrc` to make it permanent.

### Android emulator

```bash
# Start an emulator first (Android Studio AVD Manager), then:
npx react-native run-android
```

`android/local.properties` is gitignored. If it's missing, create it:
```
sdk.dir=/Users/<you>/Library/Android/sdk
```

### Metro bundler (separate terminal)

```bash
npx react-native start
```

---

## Environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

Values are read at build time via `react-native-config`. After changing `.env`, rebuild the app (Metro hot-reload won't pick up native config changes).

---

## Project structure

```
src/
├── app/                   # Entry point and navigation
│   ├── NavigationRoot.tsx # Root stack navigator
│   └── theme/             # colors, typography, spacing, responsive
├── features/              # One folder per product feature
│   ├── auth/screens/      # WelcomeScreen (Sign in / Guest)
│   ├── map/               # HomeScreen (island map placeholder)
│   ├── games/             # Game modules (phase 1+)
│   ├── letterLab/         # Writing and tracing (phase 1+)
│   ├── jukebox/           # Music player (phase 1+)
│   ├── rewards/           # Backpack, streaks (phase 1+)
│   └── dashboard/         # Teacher / admin views (phase 1+)
├── shared/
│   ├── models/            # TypeScript types: Staff, Student, GameScore, Progress
│   ├── services/          # supabaseClient, authService, scoreService, dashboardService
│   ├── components/        # Shared UI components (phase 1+)
│   └── hooks/             # Shared hooks (phase 1+)
├── data/                  # Static content: alphabet, vocabulary, songs, islands
└── assets/                # Images, fonts, audio, Lottie animations
```

---

## Database

This app runs on its **own dedicated Supabase project** — fully standalone, no shared tables with any external school system.

### Setting up the database

Run `supabase/schema.sql` in the Supabase SQL editor. It creates everything from scratch: tables, indexes, RLS policies, and functions.

For a dev environment, also run `supabase/seed.sql` after the schema.

### Making schema changes

> **During active development, edit `supabase/schema.sql` directly.** This file is the single source of truth for the database structure — it must always reflect the current, complete schema and be runnable against a fresh Supabase project.
>
> Migrations will be introduced once the schema stabilises for production.

### Tables

| Table | Purpose |
|-------|---------|
| `app_users` | App's own user registry (roles: `player`, `teacher`, `admin`) |
| `external_system_links` | Optional admin-created links to external school systems |
| `student_profiles` | Gameplay profiles for authenticated players and anonymous guests |
| `game_scores` | Per-game results |
| `island_progress` | Per-level star/score progress |
| `souvenirs` | Earned collectibles |

### Auth model

- **Users** — Microsoft Azure AD SSO via Supabase Auth; role assigned by an admin in `app_users`
- **Anonymous guests** — Supabase anonymous auth; session persisted to AsyncStorage
- `resolve_user_role(auth_user_id)` returns the user's app role (or `'unregistered'`)
- `link_guest_to_player` / `merge_guest_into_player` handle the guest → authenticated upgrade path

### External school system links

The app can optionally link any user to a record in an external school system (e.g. HSHB, Arbor, Bromcom). This is:
- **Admin-only** — only admins can create or modify links
- **Reference-only** — stores `(system_name, external_id)` only; the app never writes to external systems
- **Non-blocking** — the app works fully without any links configured

`system_name` should be a stable lowercase identifier: `'hshb'`, `'arbor'`, `'bromcom'`, `'sims'`, etc.

---

## Key dependencies

| Package | Purpose |
|---------|---------|
| `@react-navigation/native-stack` | Screen navigation |
| `@supabase/supabase-js` | Backend / auth / database |
| `react-native-config` | `.env` at build time |
| `@react-native-async-storage/async-storage` | Persist auth session |
| `react-native-reanimated` + `react-native-worklets` | Animations |
| `@shopify/react-native-skia` | Letter tracing canvas (phase 1) |
| `lottie-react-native` | Lottie animations |
| `react-native-svg` | SVG illustrations |
| `react-native-sound` | Audio playback |
| `zustand` | State management |

---

## TypeScript & linting

```bash
npx tsc --noEmit   # type check
npx eslint "src/**/*.{ts,tsx}"
npm test
```

---

## Known setup quirks

- **CocoaPods requires `LANG=en_US.UTF-8`** — without it you get a Unicode normalization crash.
- **`react-native-worklets` must be in `package.json`** (not just Podfile) so the New Architecture codegen generates `rnworklets/rnworklets.h`.
- **`@react-native-async-storage/async-storage`** is pinned to `^2.2.0`. v3 introduces a Kotlin Multiplatform dependency (`org.asyncstorage.shared_storage`) that requires extra Maven repo config.
- **Android SDK** — `android/local.properties` is gitignored; each developer must create it pointing to their SDK.
