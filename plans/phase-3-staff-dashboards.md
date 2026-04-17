# Phase 3 — Staff Dashboards (Weeks 13–17)

**Goal:** The full teacher and admin dashboard experience.

**Milestone:** A teacher can sign in and see their own class(es). An admin can sign in and see all classes school-wide. Both can drill into student detail and export reports. A guest who later signs in as a student has their anonymous history instantly linked and visible to staff.

**Prerequisite:** Phase 2 complete — full alphabet coverage, five game types working, scoring data flowing into Supabase.

---

## Tasks

- [ ] Build the teacher dashboard UI: class overview, student detail view, game analytics
- [ ] Build the admin/headteacher dashboard: school-wide overview, all classes, filtering
- [ ] Implement Supabase database functions for aggregated queries
- [ ] Build score aggregation views using `students` → `student_profiles` → `game_scores` via `student_classes`
- [ ] Build exportable PDF progress report for individual students
- [ ] Refine RLS policies: teachers see own classes only, admins see all
- [ ] Build the "unregistered user" screen for Microsoft users not in the database
- [ ] Implement guest-to-student linking flow

---

## Context: Data Access Rules

Staff never access the game tables directly — they use `SECURITY DEFINER` functions that join across existing and new tables.

- **Teachers** (`role = 'teacher'`): see only students enrolled in their class(es) via `student_classes` junction table
- **Admins & Headteachers** (`role IN ('admin', 'headteacher')`): see all students across all classes
- **Guest profiles** (`student_id = NULL`): invisible to all staff dashboards because queries join through `students` → `student_classes`

The dashboard query functions were created in Phase 0:
- `get_class_overview(p_class_id)` — students in a class with scores, trends, app_active status
- `get_teacher_classes(p_staff_id)` — all classes for a teacher with aggregated stats
- `get_all_classes()` — all classes school-wide (admin view) with teacher names
- `get_student_detail(p_student_id)` — per-game-type breakdown for a single student

---

## 1. Dashboard Service

> **Prompt:** "Create a dashboard service at `src/shared/services/dashboardService.ts` with:
> 1. `getTeacherClasses(staffId: string)` — calls the `get_teacher_classes` Supabase function, returns array of `{ classId, className, yearGroup, studentCount, avgClassScore }`
> 2. `getAllClasses()` — calls the `get_all_classes` Supabase function (for admin/headteacher), returns array of `{ classId, className, yearGroup, teacherName, studentCount, avgClassScore }`
> 3. `getClassOverview(classId: string)` — calls the `get_class_overview` Supabase function, returns array of `{ studentId, studentName, appActive, currentIsland, totalStars, avgScore, lastActive, trend }`
> 4. `getStudentDetail(studentId: string)` — calls the `get_student_detail` Supabase function, returns array of `{ gameType, avgScore, totalGames, recentScores }`
>
> Type all return values with TypeScript interfaces in `src/shared/models/`."

### Phase-1 starter snippets

These were shipped during Phase 1 but removed from `main` in the remediation
cleanup because nothing consumed them. Restore them as `getAllPlayerProfiles`
and `getAllGameScores` helpers in `dashboardService.ts` when the service is
re-introduced:

```ts
// Returns all player profiles — accessible to teachers and admins.
export async function getAllPlayerProfiles(): Promise<StudentProfile[]> {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('is_guest', false)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch player profiles: ${error.message}`);
  }

  return (data ?? []) as StudentProfile[];
}

// Returns recent game scores across all players — accessible to teachers and admins.
export async function getAllGameScores(limit = 200): Promise<GameScore[]> {
  const { data, error } = await supabase
    .from('game_scores')
    .select('*')
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch game scores: ${error.message}`);
  }

  return (data ?? []) as GameScore[];
}
```

### Auth RPC helpers (also stashed here)

`resolveUserRole` and `linkToExternalSystem` were removed from
`src/shared/services/authService.ts` because the Phase-1 guest flow never
calls them. Re-add them when SSO + admin-driven external links land:

```ts
import type { AppRole } from '../models/Staff';

export type ResolvedUser = {
  role: AppRole | 'unregistered';
  app_user_id: string | null;
};

export async function resolveUserRole(
  authUserId: string,
): Promise<ResolvedUser> {
  const { data, error } = await supabase.rpc('resolve_user_role', {
    p_auth_user_id: authUserId,
  });

  if (error) {
    throw new Error(`Failed to resolve user role: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return { role: 'unregistered', app_user_id: null };
  }

  const row = data[0];
  return {
    role: row.role as AppRole | 'unregistered',
    app_user_id: row.app_user_id ?? null,
  };
}

export async function linkToExternalSystem(
  appUserId: string,
  systemName: string,
  externalId: string,
  linkedBy: string,
  notes?: string,
): Promise<'linked' | 'updated' | 'conflict'> {
  const { data, error } = await supabase.rpc('link_to_external_system', {
    p_app_user_id: appUserId,
    p_system_name: systemName,
    p_external_id: externalId,
    p_linked_by: linkedBy,
    p_notes: notes,
  });

  if (error) {
    throw new Error(`Failed to link external system: ${error.message}`);
  }

  return data as 'linked' | 'updated' | 'conflict';
}
```

---

## 2. Teacher Dashboard

> **Prompt 1 — Class list screen:** "Build a TeacherDashboardScreen at `src/features/dashboard/screens/TeacherDashboardScreen.tsx`. Requirements:
> - Header: 'Welcome, [display_name]' — use `staff.display_name` or fallback to `first_name + last_name`
> - Shows 'My Classes' — a list of the teacher's classes from `getTeacherClasses()`
> - Each class card shows: class name, year group, number of students, average score
> - Tapping a class navigates to ClassOverviewScreen
> - Professional, clean design — distinct from the child-facing watercolour style. Use clean whites, subtle greys, and Ocean Blue (#3B82F6) as accent
> - Pull-to-refresh to reload data"

> **Prompt 2 — Class overview screen:** "Build a ClassOverviewScreen at `src/features/dashboard/screens/ClassOverviewScreen.tsx`. Requirements:
> - Header: class name and year group
> - List of all students enrolled in the class from `getClassOverview()`
> - Each student row shows: name, current island, total stars, last active date, trend arrow (↑ improving, → steady, ↓ declining)
> - Colour-coded status indicator: green (active in last 7 days), amber (active 7–14 days ago), red (inactive 14+ days)
> - Students with `app_active = false` shown in a separate 'Not Yet Activated' section
> - Tapping a student navigates to StudentDetailScreen
> - [Export Report] button (placeholder — PDF generation below)
> - [Analytics] button → navigates to ClassAnalyticsScreen"

> **Prompt 3 — Student detail screen:** "Build a StudentDetailScreen at `src/features/dashboard/screens/StudentDetailScreen.tsx`. Requirements:
> - Header: student name with their current island and total stars
> - Score trend chart: line graph of average scores over the last 30 days (use a charting library — suggest `react-native-chart-kit` or similar)
> - Breakdown by game type: table/cards showing each game type with average score, total games played. Highlight strongest and weakest
> - 'Struggling areas' section: letters or vocabulary with consistently low scores (derived from `details` JSONB in game_scores)
> - Session log: list of recent sessions with date, duration, games played
> - [Full Report PDF] button
> - All data from `getStudentDetail()` plus additional queries for session history"

> **Prompt 4 — Class analytics screen:** "Build a ClassAnalyticsScreen at `src/features/dashboard/screens/ClassAnalyticsScreen.tsx`. Requirements:
> - Most played game type across the class (bar chart)
> - Average score per game type (bar chart)
> - Class-wide weak spots: 'X of Y students struggle with [letter/word]' — query the `details` JSONB from game_scores to find common low-scoring items
> - Engagement metrics: active students this week, average session length, total games played"

---

## 3. Admin / Headteacher Dashboard

> **Prompt:** "Build an AdminDashboardScreen at `src/features/dashboard/screens/AdminDashboardScreen.tsx`. Requirements:
> - Header: 'Welcome, [name] (Admin)' or '(Headteacher)'
> - 'All Classes' section: list of every active class from `getAllClasses()`, each showing class name, year group, teacher name, student count, average score
> - School-wide stats panel: total active students, overall average score, most common weak letter/word, engagement percentage (students active in last 7 days)
> - Filter controls: filter by year group, filter by teacher
> - Tapping any class → same ClassOverviewScreen used by teachers
> - Tapping any student → same StudentDetailScreen
> - Same professional visual style as the teacher dashboard"

---

## 4. PDF Report Generation

> **Prompt:** "Implement PDF report generation for individual student progress reports. Requirements:
> - Generate a single-page PDF containing: student name, class, date, current island, total stars, score trend chart (as a static image), breakdown by game type, top 3 strengths, top 3 areas for improvement, session summary for the last 30 days
> - Use a library suitable for React Native PDF generation (suggest `react-native-html-to-pdf` or `@react-pdf/renderer`)
> - The PDF should be shareable via the device's share sheet (for emailing to guardians)
> - Trigger from the [Full Report PDF] button on StudentDetailScreen
> - Include a header with 'GreekPlay Progress Report' and a footer with the generation date"

---

## 5. Guest-to-Student Linking

> **Prompt:** "Implement the guest-to-student linking flow. When a guest user taps 'Sign in with Microsoft' and is matched to a student record:
> 1. Check if the current session has an existing guest `student_profile` (where `is_guest = TRUE`)
> 2. If yes, call `link_guest_to_student(profileId, studentId)` via Supabase RPC
> 3. If the function returns `'linked'`: update the local auth state, navigate to the Island Map. All historical data is now visible to staff
> 4. If the function returns `'conflict'`: show a dialog explaining that the student already has a profile from another device. Offer two options:
>    a. 'Keep my guest progress' — calls `merge_guest_into_student(guestProfileId, existingStudentProfileId)` to re-point all game data, then navigate to Island Map
>    b. 'Use my school progress' — delete the guest profile, switch to the existing student profile, navigate to Island Map
> 5. If the current session has no guest profile: just create a new `student_profile` with the student_id and navigate to Island Map
>
> Build this in the auth service and trigger it from the WelcomeScreen SSO flow."

---

## 6. Unregistered User Screen

> **Prompt:** "Build an UnregisteredScreen at `src/features/auth/screens/UnregisteredScreen.tsx`. Shown when a Microsoft SSO user's email is not found in either the `staff` or `students` table. Display:
> - A friendly message: 'Your account isn't registered for GreekPlay. Please contact your school admin to get set up.'
> - A [Sign Out] button that calls `signOut()` and returns to the WelcomeScreen
> - A [Try Again] button that re-runs `resolveUserRole()` in case the admin just added them"

---

## Done when:
- A teacher signs in with Microsoft and sees their class(es) with student progress data
- An admin signs in and sees all classes school-wide with filtering
- Both can drill into individual student detail with score trends and game breakdowns
- PDF reports can be generated and shared
- A guest who signs in via SSO and matches a student record has their data linked (or merged if there's a conflict)
- Unregistered Microsoft users see a clear message
