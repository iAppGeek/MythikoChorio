# Phase 0 — Proof of Life (Weeks 1–2)

**Goal:** Working app skeleton deployed to both platforms, connected to Supabase with the database schema ready.

**Milestone:** An app that launches on both platforms, navigates between two screens, and connects to Supabase.

---

## Tasks

- [ ] Complete environment setup (see greekplay-environment-setup.md)
- [ ] Initialise React Native project with TypeScript
- [ ] Set up navigation framework
- [ ] Build a minimal splash screen and placeholder home screen
- [ ] Configure Supabase project (connect to existing PostgreSQL database)
- [ ] Configure Microsoft Azure AD as OAuth provider in Supabase Auth
- [ ] Enable Supabase anonymous auth (for guest users)
- [ ] Add `email`, `app_active`, and `app_consent_at` columns to `students` table
- [ ] Create new tables (student_profiles, game_scores, island_progress, souvenirs)
- [ ] Create the `resolve_user_role`, `link_guest_to_student`, and `merge_guest_into_student` database functions
- [ ] Set up Row Level Security policies (teacher = own classes, admin = all, players = own data)
- [ ] Build and deploy to iOS simulator and Android emulator
- [ ] Build and deploy to at least one physical device
- [ ] Set up Git repository and basic CI pipeline

---

## 1. Create the React Native Project

```
npx @react-native-community/cli init GreekPlay --template react-native-template-typescript
cd GreekPlay
```

**Verify on both platforms:**

iOS:
```
cd ios && pod install && cd ..
npx react-native run-ios
```

Android (start emulator first):
```
npx react-native run-android
```

You should see the default React Native welcome screen on both.

---

## 2. Install Core Dependencies

```
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# State management
npm install zustand

# Backend & Authentication (Supabase + Microsoft SSO)
npm install @supabase/supabase-js react-native-url-polyfill
npm install react-native-inappbrowser-reborn   # For SSO OAuth redirect flow

# Audio
npm install react-native-sound

# Drawing / Tracing
npm install @shopify/react-native-skia

# Animations
npm install lottie-react-native

# SVG (for illustrations and icons)
npm install react-native-svg

# Responsive layout (phone + tablet)
npm install react-native-responsive-screen

# Async storage (persists anonymous auth session ID for guest users)
npm install @react-native-async-storage/async-storage

# Environment config
npm install react-native-config
```

For iOS: `cd ios && pod install && cd ..`

---

## 3. Project Folder Structure

Create this structure before writing any code:

```
GreekPlay/
├── src/
│   ├── app/                    # App entry point, navigation setup
│   │   ├── App.tsx
│   │   ├── NavigationRoot.tsx
│   │   └── theme/
│   │       ├── colors.ts
│   │       ├── typography.ts
│   │       ├── spacing.ts
│   │       └── responsive.ts   # Phone vs tablet breakpoints
│   │
│   ├── features/               # Feature modules (one folder per feature)
│   │   ├── auth/               # Sign up, login, profile select
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── map/                # Island map home screen
│   │   ├── letterLab/          # Writing and tracing system
│   │   ├── games/              # All game types
│   │   │   ├── memoryMatch/
│   │   │   ├── wordBubbles/
│   │   │   ├── singAndTap/
│   │   │   ├── pictureHunt/
│   │   │   ├── sentenceBuilder/
│   │   │   ├── soundSafari/
│   │   │   └── letterRace/
│   │   ├── jukebox/            # Music player and karaoke
│   │   ├── rewards/            # Backpack, boat customisation, streaks
│   │   └── dashboard/          # Staff dashboards (teacher + admin views)
│   │
│   ├── shared/                 # Shared across features
│   │   ├── components/         # Buttons, cards, modals, etc.
│   │   ├── hooks/              # Shared custom hooks
│   │   ├── services/           # API calls, Supabase wrappers
│   │   │   ├── authService.ts     # SSO + anonymous auth
│   │   │   ├── supabaseClient.ts  # Supabase client initialisation
│   │   │   ├── scoreService.ts
│   │   │   └── dashboardService.ts
│   │   ├── models/             # TypeScript types and interfaces
│   │   │   ├── Staff.ts
│   │   │   ├── Student.ts
│   │   │   ├── GameScore.ts
│   │   │   └── Progress.ts
│   │   └── utils/              # Helpers, formatters, constants
│   │
│   ├── data/                   # Static content
│   │   ├── alphabet/           # Letter data, stroke paths, audio refs
│   │   ├── vocabulary/         # Word lists per island/theme
│   │   ├── songs/              # Song metadata and lyrics
│   │   └── islands/            # Island configuration and level data
│   │
│   └── assets/                 # Images, fonts, audio files, animations
│       ├── images/
│       ├── fonts/
│       ├── audio/
│       └── lottie/
│
├── __tests__/                  # Test files
├── android/                    # Android native project
├── ios/                        # iOS native project
├── supabase/                   # Supabase config and migrations
│   ├── migrations/             # SQL migration files
│   └── seed.sql                # Seed data for development
└── docs/                       # Documentation
    ├── SETUP.md
    ├── ARCHITECTURE.md
    └── API.md
```

---

## 4. Theme & Responsive Foundations

```typescript
// src/app/theme/colors.ts
export const colors = {
  oceanBlue: '#3B82F6',
  sunshineYellow: '#FBBF24',
  terracotta: '#E07A5F',
  oliveGreen: '#6B8F71',
  cloudWhite: '#F8FAFC',
  softSand: '#FDF6EC',
};
```

```typescript
// src/app/theme/responsive.ts
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const isTablet = width >= 768;

export const layout = {
  cardColumns: isTablet ? 4 : 3,
  canvasWidth: isTablet ? '60%' : '100%',
  fontSize: {
    heading: isTablet ? 32 : 24,
    body: isTablet ? 18 : 14,
    greek: isTablet ? 48 : 36,
  },
  spacing: {
    screen: isTablet ? 32 : 16,
    card: isTablet ? 16 : 8,
  },
};
```

---

## 5. Database Migration SQL

Run this in the Supabase SQL editor. The existing tables (`staff`, `students`, `classes`, `student_classes`, `guardians`, `attendance`, `timetable_slots`) are already present — this only adds new columns and new tables.

### 5a. Alter existing students table

```sql
-- Required for student Microsoft SSO login
ALTER TABLE students ADD COLUMN email TEXT UNIQUE;
CREATE INDEX ON students (email);

-- App activation flag — managed by the school's admin application, NOT by this app.
-- Set to TRUE after the student/guardian has accepted the data processing agreement.
-- This app only READS these values to gate access to gameplay.
ALTER TABLE students ADD COLUMN app_active BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE students ADD COLUMN app_consent_at TIMESTAMPTZ;
CREATE INDEX ON students (app_active);
```

### 5b. Create new game tables

```sql
-- ─── Student Profiles ────────────────────────────────
-- Used by BOTH school students and anonymous guests.
-- School students: student_id is set, is_guest = FALSE
-- Guests: student_id is NULL, is_guest = TRUE
CREATE TABLE student_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  auth_user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_guest        BOOLEAN NOT NULL DEFAULT FALSE,
  display_name    TEXT,
  age             INTEGER,
  avatar_id       TEXT,
  current_island  TEXT NOT NULL DEFAULT 'alpha',
  total_stars     INTEGER NOT NULL DEFAULT 0,
  streak_days     INTEGER NOT NULL DEFAULT 0,
  last_active     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX ON student_profiles (student_id);
CREATE INDEX ON student_profiles (auth_user_id);
CREATE INDEX ON student_profiles (is_guest);

-- ─── Game Scores (high volume) ───────────────────────
CREATE TABLE game_scores (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id  UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  game_type           TEXT NOT NULL,
  island_id           TEXT NOT NULL,
  level_id            TEXT NOT NULL,
  score               INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  accuracy            DECIMAL(3,2) CHECK (accuracy BETWEEN 0 AND 1),
  time_spent_secs     INTEGER,
  hints_used          INTEGER DEFAULT 0,
  attempts            INTEGER DEFAULT 1,
  device_type         TEXT CHECK (device_type IN ('phone', 'tablet')),
  details             JSONB,
  completed_at        TIMESTAMPTZ NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON game_scores (student_profile_id);
CREATE INDEX ON game_scores (student_profile_id, game_type);
CREATE INDEX ON game_scores (completed_at);

-- ─── Island Progress ─────────────────────────────────
CREATE TABLE island_progress (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id  UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  island_id           TEXT NOT NULL,
  level_id            TEXT NOT NULL,
  stars_earned        INTEGER NOT NULL DEFAULT 0 CHECK (stars_earned BETWEEN 0 AND 3),
  best_score          INTEGER CHECK (best_score BETWEEN 0 AND 100),
  times_played        INTEGER NOT NULL DEFAULT 1,
  completed_at        TIMESTAMPTZ,
  UNIQUE (student_profile_id, island_id, level_id)
);

CREATE INDEX ON island_progress (student_profile_id);

-- ─── Souvenirs ───────────────────────────────────────
CREATE TABLE souvenirs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id  UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  island_id           TEXT NOT NULL,
  souvenir_type       TEXT NOT NULL,
  earned_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_profile_id, island_id, souvenir_type)
);

CREATE INDEX ON souvenirs (student_profile_id);
```

### 5c. Enable RLS on new tables

```sql
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores      ENABLE ROW LEVEL SECURITY;
ALTER TABLE island_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE souvenirs        ENABLE ROW LEVEL SECURITY;
```

### 5d. RLS policies

```sql
-- Players (school students AND anonymous guests) own their data
CREATE POLICY player_own_profile ON student_profiles
  FOR ALL USING (auth_user_id = auth.uid());

CREATE POLICY player_own_scores ON game_scores
  FOR ALL USING (
    student_profile_id IN (
      SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY player_own_progress ON island_progress
  FOR ALL USING (
    student_profile_id IN (
      SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY player_own_souvenirs ON souvenirs
  FOR ALL USING (
    student_profile_id IN (
      SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Teachers can read game data for students in their class(es)
CREATE POLICY teacher_class_profiles ON student_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff st
      JOIN classes c ON c.teacher_id = st.id
      JOIN student_classes sc ON sc.class_id = c.id
      WHERE st.email = auth.jwt()->>'email'
        AND st.role = 'teacher'
        AND sc.student_id = student_profiles.student_id
    )
  );

CREATE POLICY teacher_class_scores ON game_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN student_classes sc ON sc.student_id = sp.student_id
      JOIN classes c ON c.id = sc.class_id
      JOIN staff st ON st.id = c.teacher_id
      WHERE st.email = auth.jwt()->>'email'
        AND st.role = 'teacher'
        AND sp.id = game_scores.student_profile_id
    )
  );

CREATE POLICY teacher_class_progress ON island_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN student_classes sc ON sc.student_id = sp.student_id
      JOIN classes c ON c.id = sc.class_id
      JOIN staff st ON st.id = c.teacher_id
      WHERE st.email = auth.jwt()->>'email'
        AND st.role = 'teacher'
        AND sp.id = island_progress.student_profile_id
    )
  );

CREATE POLICY teacher_class_souvenirs ON souvenirs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN student_classes sc ON sc.student_id = sp.student_id
      JOIN classes c ON c.id = sc.class_id
      JOIN staff st ON st.id = c.teacher_id
      WHERE st.email = auth.jwt()->>'email'
        AND st.role = 'teacher'
        AND sp.id = souvenirs.student_profile_id
    )
  );

-- Admins and headteachers can read ALL game data
CREATE POLICY admin_all_profiles ON student_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff st
      WHERE st.email = auth.jwt()->>'email'
        AND st.role IN ('admin', 'headteacher')
    )
  );

CREATE POLICY admin_all_scores ON game_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff st
      WHERE st.email = auth.jwt()->>'email'
        AND st.role IN ('admin', 'headteacher')
    )
  );

CREATE POLICY admin_all_progress ON island_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff st
      WHERE st.email = auth.jwt()->>'email'
        AND st.role IN ('admin', 'headteacher')
    )
  );

CREATE POLICY admin_all_souvenirs ON souvenirs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff st
      WHERE st.email = auth.jwt()->>'email'
        AND st.role IN ('admin', 'headteacher')
    )
  );
```

### 5e. Database functions

```sql
-- Role resolution — called after SSO login
CREATE FUNCTION resolve_user_role(p_email text)
RETURNS TABLE (role text, record_id uuid, is_app_active boolean) AS $$
BEGIN
  RETURN QUERY
  SELECT st.role::text, st.id, TRUE
  FROM staff st WHERE st.email = p_email;
  IF FOUND THEN RETURN; END IF;

  RETURN QUERY
  SELECT 'student'::text, stu.id, stu.app_active
  FROM students stu WHERE stu.email = p_email;
  IF FOUND THEN RETURN; END IF;

  RETURN QUERY SELECT 'unregistered'::text, NULL::uuid, FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Guest-to-student linking
CREATE FUNCTION link_guest_to_student(p_profile_id uuid, p_student_id uuid)
RETURNS text AS $$
DECLARE
  existing_profile_id uuid;
BEGIN
  SELECT id INTO existing_profile_id
  FROM student_profiles
  WHERE student_id = p_student_id;

  IF existing_profile_id IS NOT NULL THEN
    RETURN 'conflict';
  END IF;

  UPDATE student_profiles
  SET student_id = p_student_id, is_guest = FALSE, updated_at = NOW()
  WHERE id = p_profile_id AND is_guest = TRUE;

  RETURN 'linked';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Merge guest data into existing student profile (conflict resolution)
CREATE FUNCTION merge_guest_into_student(p_guest_profile_id uuid, p_student_profile_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE game_scores SET student_profile_id = p_student_profile_id
  WHERE student_profile_id = p_guest_profile_id;

  UPDATE island_progress SET student_profile_id = p_student_profile_id
  WHERE student_profile_id = p_guest_profile_id;

  UPDATE souvenirs SET student_profile_id = p_student_profile_id
  WHERE student_profile_id = p_guest_profile_id;

  DELETE FROM student_profiles WHERE id = p_guest_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Supabase Client Setup

> **Prompt:** "Create a Supabase client initialisation file for React Native at `src/shared/services/supabaseClient.ts`. It should use `react-native-url-polyfill`, read the Supabase URL and anon key from environment config (`react-native-config`), and use `@react-native-async-storage/async-storage` for session persistence. Export the typed client."

---

## 7. Minimal Navigation Shell

> **Prompt:** "Set up React Navigation in a React Native TypeScript project. Create a `NavigationRoot.tsx` at `src/app/NavigationRoot.tsx` with a stack navigator containing two placeholder screens: a WelcomeScreen and a HomeScreen. Use the theme colours from `src/app/theme/colors.ts` (Ocean Blue #3B82F6, Cloud White #F8FAFC). The WelcomeScreen should have two buttons: 'Sign in with Microsoft' and 'Play as Guest' — both just navigate to HomeScreen for now."

---

## 8. Build & Deploy Verification

- Build to iOS simulator: `npx react-native run-ios`
- Build to Android emulator: `npx react-native run-android`
- Build to at least one physical device (iOS or Android)
- Verify the WelcomeScreen renders and navigation works

---

## 9. Git & CI

> **Prompt:** "Create a `.gitignore` file for a React Native TypeScript project that excludes node_modules, ios/Pods, android build artifacts, .env files, and IDE config. Also suggest a basic GitHub Actions CI workflow that runs TypeScript type checking and ESLint on every push."

---

## Done when:
- App launches on both iOS simulator and Android emulator
- Navigation works between Welcome and Home screens
- Supabase client connects successfully (test with a simple query)
- All migration SQL has been run — new tables and functions exist in Supabase
- RLS policies are in place
- Git repo initialised with CI running
