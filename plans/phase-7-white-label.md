# Phase 7 — White-Label Deployment (Post-Launch)

**Goal:** Enable the app to be deployed for additional schools with minimal effort — one database per school, same codebase.

**Milestone:** A repeatable process for onboarding a new school: create their Supabase project, run the migration, configure their Azure AD, set branding, and ship.

**Prerequisite:** Phase 6 complete — app published and proven with the first school.

---

## Architecture: Database-Per-School

Each school gets its own Supabase project, which provides:
- Its own PostgreSQL database (complete data isolation)
- Its own Supabase Auth instance (configured with the school's Azure AD tenant)
- Its own API URL and anon key
- Its own storage bucket (for any school-specific assets)

The app codebase is identical across all schools. The only difference per deployment is the Supabase connection config and optional branding.

**Why this approach:**
- Zero changes to the existing schema, RLS policies, or database functions
- Complete data isolation between schools — no risk of cross-school data leaks
- Each school's admin manages their own staff, students, and classes independently
- Simple to reason about, simple to debug, simple to support
- If a school leaves the platform, just delete their Supabase project

**Trade-off:** No cross-school analytics out of the box. If this is needed later, a separate aggregation service can read from multiple Supabase projects.

---

## Tasks

- [ ] Build the school configuration system (connection switching)
- [ ] Create the deployment automation script
- [ ] Add optional branding support (school name, logo, accent colour)
- [ ] Write the school onboarding runbook
- [ ] Build a school selection flow (if using a single app binary)

---

## 1. School Configuration System

There are two approaches — choose based on your distribution model:

### Option A: Separate app build per school (simplest)

Each school gets a build with their Supabase credentials baked into the environment config. No school selection UI needed.

> **Prompt:** "Refactor the Supabase client at `src/shared/services/supabaseClient.ts` to read the Supabase URL and anon key from `react-native-config` environment variables (`SUPABASE_URL` and `SUPABASE_ANON_KEY`). Create environment files:
> - `.env.school-alpha` (first school — the one we've been building for)
> - `.env.school-template` (a template with placeholder values for new schools)
>
> Update the build scripts in `package.json` to support building for a specific school:
> ```
> \"build:school-alpha\": \"ENVFILE=.env.school-alpha react-native run-ios\",
> \"build:school-template\": \"ENVFILE=.env.school-template react-native run-ios\"
> ```
>
> Document how to create a new `.env.school-[name]` file for each new school."

### Option B: Single app binary with school selection (more scalable)

One app on the App Store. On first launch, the user enters a school code or selects from a list, which sets the Supabase connection for that device.

> **Prompt:** "Add a school selection flow to the app. Requirements:
> - On first launch (no school configured), show a SchoolSelectionScreen before the WelcomeScreen
> - The user enters a school code (e.g., 'ALPHA-PRIMARY') or selects from a searchable list
> - The app looks up the school code against a central registry to get the Supabase URL and anon key
> - These are stored in AsyncStorage and used to initialise the Supabase client on all subsequent launches
> - A 'Change School' option in Settings allows switching (clears local data and returns to school selection)
>
> **Central school registry:**
> Create a lightweight registry — this could be:
> - A separate small Supabase project that just holds a `schools` table with: `school_code`, `school_name`, `supabase_url`, `supabase_anon_key`, `logo_url`, `accent_colour`
> - Or a simple JSON file hosted on a CDN that the app fetches on the school selection screen
>
> The registry only stores connection metadata — no student or staff data. It's the only shared resource across schools.
>
> Create the SchoolSelectionScreen at `src/features/auth/screens/SchoolSelectionScreen.tsx` with:
> - A school code text input with a 'Connect' button
> - Validation: check the code against the registry, show error if not found
> - On success: store the config in AsyncStorage, initialise the Supabase client, navigate to WelcomeScreen
> - A loading state while verifying the code"

---

## 2. Deployment Automation Script

> **Prompt:** "Create a shell script at `scripts/deploy-new-school.sh` that automates setting up a new school. The script should:
>
> 1. **Accept parameters:** school name, school code, Azure AD tenant ID, Azure AD client ID
>
> 2. **Create Supabase project** (manual step — output instructions since this requires the Supabase dashboard or CLI):
>    - Project name: `greekplay-[school-code]`
>    - Region: closest to the school
>    - Output the project URL and anon key
>
> 3. **Run database migration:** Connect to the new Supabase project and execute all SQL from Phase 0:
>    - The `ALTER TABLE` statements for adding `email`, `app_active`, `app_consent_at` to students
>    - All `CREATE TABLE` statements (student_profiles, game_scores, island_progress, souvenirs)
>    - All `CREATE FUNCTION` statements (resolve_user_role, link_guest_to_student, merge_guest_into_student, get_class_overview, get_teacher_classes, get_all_classes, get_student_detail)
>    - All RLS policies
>    - Note: the existing tables (staff, students, classes, etc.) are assumed to already exist — they are created by the school's admin application
>
> 4. **Configure Azure AD:** Output step-by-step instructions for:
>    - Adding the school's Azure AD tenant as an OAuth provider in Supabase Auth settings
>    - Setting the redirect URL
>    - Enabling anonymous auth
>
> 5. **Generate environment file:** Create `.env.school-[code]` with the Supabase URL and anon key
>
> 6. **Update school registry** (if using Option B): Add the new school to the central registry
>
> 7. **Output a summary:** School name, code, Supabase URL, what was deployed, what manual steps remain
>
> Use the Supabase CLI (`supabase`) for database operations where possible. Include error handling and a dry-run mode."

---

## 3. Optional Branding

> **Prompt:** "Add per-school branding support. Requirements:
>
> **Branding config:**
> Create a `school_config` table in each school's Supabase database:
> ```sql
> CREATE TABLE school_config (
>   id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
>   school_name TEXT NOT NULL,
>   school_code TEXT UNIQUE NOT NULL,
>   logo_url    TEXT,           -- URL to school logo image
>   accent_colour TEXT,         -- Hex colour to override Ocean Blue
>   welcome_message TEXT,       -- Optional custom welcome text
>   created_at  TIMESTAMPTZ DEFAULT NOW()
> );
>
> -- Allow all authenticated users to read (no write — admin sets this externally)
> ALTER TABLE school_config ENABLE ROW LEVEL SECURITY;
> CREATE POLICY read_school_config ON school_config FOR SELECT USING (true);
> ```
>
> **App integration:**
> - On app launch, after Supabase client is initialised, fetch the single row from `school_config`
> - Store in a Zustand store slice: `useSchoolConfig()`
> - If `accent_colour` is set, override the theme's `oceanBlue` with the school's colour throughout the app
> - If `logo_url` is set, show the school's logo on the WelcomeScreen alongside the GreekPlay logo
> - If `welcome_message` is set, show it below the app title on the WelcomeScreen
> - If no `school_config` row exists, use defaults (the current GreekPlay branding)
>
> **Update the theme system:**
> - Refactor `src/app/theme/colors.ts` to export a function `getColors(accentOverride?: string)` that returns the colour palette with the accent swapped if provided
> - All components that use `oceanBlue` should read from the Zustand store rather than the static constant"

---

## 4. School Onboarding Runbook

> **Prompt:** "Write a school onboarding runbook in Markdown. This is a step-by-step guide for setting up GreekPlay for a new school. Include:
>
> **Prerequisites (what the school needs to provide):**
> - Microsoft Education licence with Azure AD tenant
> - Azure AD tenant ID and a registered app client ID (instructions for the school's IT team to create this)
> - Staff data loaded into the admin application (staff table populated with emails and roles)
> - Student data loaded into the admin application (students table populated)
> - Class structure set up (classes and student_classes populated)
>
> **Setup steps (what we do):**
> 1. Create Supabase project
> 2. Run the deployment script
> 3. Configure Azure AD in Supabase Auth
> 4. Set up school branding (logo, colour, welcome message)
> 5. Test with a staff account and a student account from the school
> 6. Hand over: provide the school code and any instructions for the school
>
> **Verification checklist:**
> - [ ] Staff member can sign in via Microsoft and see the teacher dashboard
> - [ ] Admin can sign in and see all classes
> - [ ] Student with `app_active = TRUE` can sign in and reach the Island Map
> - [ ] Student with `app_active = FALSE` sees the 'not activated' screen
> - [ ] Guest can play without signing in
> - [ ] Game scores are recorded to the correct Supabase database
> - [ ] School branding appears on the welcome screen
>
> **Estimated time:** 1–2 hours per school (mostly waiting for Azure AD config)
>
> **Troubleshooting:** Common issues and solutions (Azure AD redirect mismatch, RLS blocking queries, missing migration steps)"

---

## 5. Considerations for the Future

**Cross-school analytics (if ever needed):**
- Build a separate lightweight service that connects to multiple Supabase projects via their service role keys
- Aggregates anonymised metrics: total students, total games played, average scores, most popular islands
- Could be a simple dashboard or a scheduled report
- Not needed at launch — only relevant once 10+ schools are onboarded

**App Store distribution:**
- Option A (separate builds): each school gets their own app listing. More effort per school but maximum isolation and branding control. Practical for up to ~10 schools
- Option B (single binary): one App Store listing. All schools use the same app with school selection on first launch. Scales to hundreds of schools. Recommended if growth is expected
- A hybrid is possible: start with Option A for the first few schools, migrate to Option B when the school registry is built

**Admin application:**
- The school's admin application (which manages staff, students, classes, and `app_active`) would also need to be deployable per school. If it's already a Supabase-backed app, the same database-per-school model applies
- Consider whether the admin app and GreekPlay should share the same Supabase project per school (simpler) or be separate projects (more isolated)

---

## Done when:
- A new school can be onboarded in under 2 hours using the deployment script and runbook
- The app connects to the correct Supabase instance based on school configuration
- School branding (name, logo, accent colour) displays correctly
- All existing functionality works identically for the new school
- The process is documented well enough that someone other than the original developer can onboard a school
