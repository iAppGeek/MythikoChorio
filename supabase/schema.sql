-- =============================================================================
-- Mythiko Chorio — Database Schema
-- =============================================================================
-- Run this file in the Supabase SQL editor to create the database from scratch.
--
-- This app runs on its own dedicated Supabase project, completely separate from
-- any external school system. No external tables are referenced or modified.
--
-- To make schema changes during development: edit this file directly and re-run
-- it against a fresh Supabase project. Migrations will be introduced once the
-- schema stabilises for production.
-- =============================================================================


-- ─── Utility ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ─── App Users ───────────────────────────────────────────────────────────────
-- One record per authenticated user. id mirrors auth.users(id).
-- Roles are managed entirely within this app — no external system is consulted.
-- An admin must create a user's app_users record to grant access.
-- Users with no record are treated as 'unregistered'.

CREATE TABLE app_users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('player', 'teacher', 'admin')),
  display_name  TEXT,
  email         TEXT UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER app_users_updated_at
  BEFORE UPDATE ON app_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX ON app_users (role);
CREATE INDEX ON app_users (email);


-- ─── External System Links ───────────────────────────────────────────────────
-- Optional admin-created links connecting an app_user to a record in an
-- external school system (e.g. HSHB, Arbor, Bromcom, SIMS).
--
-- The app stores only a key reference — it never writes to external systems.
-- system_name: stable lowercase identifier, e.g. 'hshb', 'arbor', 'bromcom'
-- external_id: the primary key in that system (text to support any key type)

CREATE TABLE external_system_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id   UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  system_name   TEXT NOT NULL,
  external_id   TEXT NOT NULL,
  linked_by     UUID REFERENCES app_users(id) ON DELETE SET NULL,
  linked_at     TIMESTAMPTZ DEFAULT NOW(),
  notes         TEXT,
  UNIQUE (app_user_id, system_name),
  UNIQUE (system_name, external_id)
);

CREATE INDEX ON external_system_links (app_user_id);
CREATE INDEX ON external_system_links (system_name, external_id);


-- ─── Student Profiles ────────────────────────────────────────────────────────
-- Gameplay profile for both authenticated players and anonymous guests.
-- Authenticated player:  app_user_id is set, is_guest = FALSE
-- Anonymous guest:       app_user_id is NULL, is_guest = TRUE

CREATE TABLE student_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id     UUID UNIQUE REFERENCES app_users(id) ON DELETE SET NULL,
  auth_user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
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

CREATE INDEX ON student_profiles (app_user_id);
CREATE INDEX ON student_profiles (auth_user_id);
CREATE INDEX ON student_profiles (is_guest);


-- ─── Game Scores ─────────────────────────────────────────────────────────────

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


-- ─── Island Progress ─────────────────────────────────────────────────────────

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


-- ─── Souvenirs ───────────────────────────────────────────────────────────────

CREATE TABLE souvenirs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id  UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  island_id           TEXT NOT NULL,
  souvenir_type       TEXT NOT NULL,
  earned_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_profile_id, island_id, souvenir_type)
);

CREATE INDEX ON souvenirs (student_profile_id);


-- ─── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE app_users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_system_links  ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores            ENABLE ROW LEVEL SECURITY;
ALTER TABLE island_progress        ENABLE ROW LEVEL SECURITY;
ALTER TABLE souvenirs              ENABLE ROW LEVEL SECURITY;

-- app_users
CREATE POLICY user_read_own      ON app_users FOR SELECT USING (id = auth.uid());
CREATE POLICY user_update_own    ON app_users FOR UPDATE USING (id = auth.uid());
CREATE POLICY admin_all_users    ON app_users FOR ALL    USING (EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY teacher_read_users ON app_users FOR SELECT USING (EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role = 'teacher'));

-- external_system_links
CREATE POLICY admin_all_links      ON external_system_links FOR ALL    USING (EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY user_read_own_links  ON external_system_links FOR SELECT USING (app_user_id = auth.uid());
CREATE POLICY teacher_read_links   ON external_system_links FOR SELECT USING (EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role = 'teacher'));

-- student_profiles
CREATE POLICY player_own_profile    ON student_profiles FOR ALL    USING (auth_user_id = auth.uid());
CREATE POLICY teacher_read_profiles ON student_profiles FOR SELECT USING (EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

-- game_scores
CREATE POLICY player_own_scores    ON game_scores FOR ALL    USING (student_profile_id IN (SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY teacher_read_scores  ON game_scores FOR SELECT USING (EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

-- island_progress
CREATE POLICY player_own_progress   ON island_progress FOR ALL    USING (student_profile_id IN (SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY teacher_read_progress ON island_progress FOR SELECT USING (EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

-- souvenirs
CREATE POLICY player_own_souvenirs   ON souvenirs FOR ALL    USING (student_profile_id IN (SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY teacher_read_souvenirs ON souvenirs FOR SELECT USING (EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role IN ('teacher', 'admin')));


-- ─── Functions ───────────────────────────────────────────────────────────────

-- Returns the user's app role, or 'unregistered' if no app_users record exists.
CREATE FUNCTION resolve_user_role(p_auth_user_id uuid)
RETURNS TABLE (role text, app_user_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT au.role::text, au.id
  FROM app_users au
  WHERE au.id = p_auth_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'unregistered'::text, NULL::uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Admin-only: creates or replaces a link to an external school system record.
-- Returns: 'linked' | 'updated' | 'conflict'
CREATE FUNCTION link_to_external_system(
  p_app_user_id  uuid,
  p_system_name  text,
  p_external_id  text,
  p_linked_by    uuid,
  p_notes        text DEFAULT NULL
)
RETURNS text AS $$
DECLARE
  existing_user_id uuid;
  existing_link_id uuid;
BEGIN
  SELECT app_user_id INTO existing_user_id
  FROM external_system_links
  WHERE system_name = p_system_name
    AND external_id = p_external_id
    AND app_user_id <> p_app_user_id;

  IF existing_user_id IS NOT NULL THEN
    RETURN 'conflict';
  END IF;

  SELECT id INTO existing_link_id
  FROM external_system_links
  WHERE app_user_id = p_app_user_id AND system_name = p_system_name;

  IF existing_link_id IS NOT NULL THEN
    UPDATE external_system_links
    SET external_id = p_external_id,
        linked_by   = p_linked_by,
        linked_at   = NOW(),
        notes       = p_notes
    WHERE id = existing_link_id;
    RETURN 'updated';
  END IF;

  INSERT INTO external_system_links (app_user_id, system_name, external_id, linked_by, notes)
  VALUES (p_app_user_id, p_system_name, p_external_id, p_linked_by, p_notes);

  RETURN 'linked';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Converts a guest profile to an authenticated player after SSO login.
-- Returns: 'linked' | 'conflict'
CREATE FUNCTION link_guest_to_player(
  p_guest_profile_id  uuid,
  p_auth_user_id      uuid,
  p_app_user_id       uuid
)
RETURNS text AS $$
DECLARE
  existing_profile_id uuid;
BEGIN
  SELECT id INTO existing_profile_id
  FROM student_profiles
  WHERE auth_user_id = p_auth_user_id
    AND id <> p_guest_profile_id;

  IF existing_profile_id IS NOT NULL THEN
    RETURN 'conflict';
  END IF;

  UPDATE student_profiles
  SET auth_user_id = p_auth_user_id,
      app_user_id  = p_app_user_id,
      is_guest     = FALSE,
      updated_at   = NOW()
  WHERE id = p_guest_profile_id AND is_guest = TRUE;

  RETURN 'linked';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Conflict resolution: moves all game data from a guest profile onto an existing
-- authenticated player profile, then deletes the guest profile.
CREATE FUNCTION merge_guest_into_player(
  p_guest_profile_id   uuid,
  p_target_profile_id  uuid
)
RETURNS void AS $$
BEGIN
  UPDATE game_scores
  SET student_profile_id = p_target_profile_id
  WHERE student_profile_id = p_guest_profile_id;

  INSERT INTO island_progress (
    student_profile_id, island_id, level_id, stars_earned,
    best_score, times_played, completed_at
  )
  SELECT p_target_profile_id, island_id, level_id, stars_earned,
         best_score, times_played, completed_at
  FROM island_progress
  WHERE student_profile_id = p_guest_profile_id
  ON CONFLICT (student_profile_id, island_id, level_id) DO UPDATE
    SET stars_earned = GREATEST(island_progress.stars_earned, EXCLUDED.stars_earned),
        best_score   = GREATEST(island_progress.best_score,   EXCLUDED.best_score),
        times_played = island_progress.times_played + EXCLUDED.times_played;

  INSERT INTO souvenirs (student_profile_id, island_id, souvenir_type, earned_at)
  SELECT p_target_profile_id, island_id, souvenir_type, earned_at
  FROM souvenirs
  WHERE student_profile_id = p_guest_profile_id
  ON CONFLICT DO NOTHING;

  DELETE FROM student_profiles WHERE id = p_guest_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
