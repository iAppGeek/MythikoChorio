# Mythiko Chorio — Μυθικό Χωριό

[![Licence: AGPL v3](https://img.shields.io/badge/Licence-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

A Greek language learning app for children, built with React Native.

Children explore a mythical Greek village, earning stars and souvenirs as they learn the alphabet, vocabulary, and songs through games and interactive activities. The app supports both school accounts (Microsoft SSO) and anonymous guest play.

---

## Tech Stack

| Layer             | Technology                      |
| ----------------- | ------------------------------- |
| Mobile            | React Native 0.85 + TypeScript  |
| Navigation        | React Navigation (native stack) |
| Backend / Auth    | Supabase (dedicated project)    |
| Animations        | Lottie, Reanimated              |
| Drawing / Tracing | Shopify React Native Skia       |
| State             | Zustand                         |
| CI                | GitHub Actions                  |

---

## Prerequisites

- Node.js ≥ 22
- Xcode (iOS) / Android Studio (Android)
- Ruby via rbenv (for CocoaPods)
- A Supabase project (see [Database setup](#database-setup))

Full environment setup guide: [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 3. iOS setup

```bash
cd ios && LANG=en_US.UTF-8 bundle exec pod install && cd ..
```

> `LANG=en_US.UTF-8` is required — CocoaPods crashes without it on some macOS setups.
> Add `export LANG=en_US.UTF-8` to `~/.zshrc` to make it permanent.

### 4. Android setup

Create `android/local.properties` (gitignored):

```
sdk.dir=/Users/<you>/Library/Android/sdk
```

### 5. Run

```bash
# iOS simulator
npm run ios

# Android emulator (start AVD first)
npm run android

# Metro bundler (separate terminal)
npm run start
```

---

## Database Setup

This app uses its own dedicated Supabase project

1. Create a new Supabase project
2. Open the SQL editor and run `supabase/schema.sql` — this creates all tables, RLS policies, and functions from scratch
3. Optionally run `supabase/seed.sql` for development test data
4. Add the project URL and anon key to your `.env`

See [CLAUDE.md](CLAUDE.md) for full database documentation.

---

## Project Structure

```
src/
├── app/            # Navigation root and theme (colors, typography, spacing)
├── features/       # One folder per product feature
│   ├── auth/       # Welcome screen, sign-in flow
│   ├── map/        # Island map home screen
│   ├── games/      # Game modules (phase 1+)
│   ├── letterLab/  # Letter tracing (phase 1+)
│   ├── jukebox/    # Music player (phase 1+)
│   ├── rewards/    # Backpack and streaks (phase 1+)
│   └── dashboard/  # Teacher and admin views (phase 1+)
└── shared/
    ├── models/     # TypeScript types
    ├── services/   # Supabase wrappers
    ├── components/ # Shared UI (phase 1+)
    └── hooks/      # Shared hooks (phase 1+)
supabase/
├── schema.sql      # Complete database schema — source of truth
└── seed.sql        # Development seed data
```

---

## Development

```bash
# Type check
npx tsc --noEmit

# Lint
npx eslint "src/**/*.{ts,tsx}"

# Tests
npm test
```

CI runs all three on every push via GitHub Actions (`.github/workflows/ci.yml`).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Security

If you discover a security vulnerability, please follow the process in [SECURITY.md](SECURITY.md) rather than opening a public issue.

---

## Licence

See [LICENSE](LICENSE).
