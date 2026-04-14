# Phase 6 — Testing & Launch (Weeks 29–34)

**Goal:** Quality assurance and public release.

**Milestone:** Published app on both Apple App Store and Google Play Store.

**Prerequisite:** Phase 5 complete — all 10 islands, all 7 game types, tablet layouts, offline mode, performance optimised.

---

## Tasks

- [ ] Usability testing with children in the target age range
- [ ] Accessibility review
- [ ] Security review
- [ ] Localisation framework
- [ ] App store assets
- [ ] Beta testing
- [ ] Submit to app stores

---

## 1. Usability Testing

> **Prompt:** "Create a usability testing plan for a Greek language learning app targeted at children ages 5–11. Include:
> - Test session structure (duration, setup, facilitator script)
> - 8–10 specific tasks to observe (e.g., 'Can the child find and start a game on Alpha Island without help?', 'Can the child complete the Letter Lab tracing for the letter Γ?', 'Does the child understand how to use the Memory Match game?')
> - What to observe and record: task completion rate, time on task, errors, confusion points, emotional responses (frustration, delight, boredom)
> - Metrics for success: 80%+ task completion without assistance, average satisfaction rating
> - Separate test scripts for: children (gameplay), teachers (dashboard), and guests (onboarding)
> - Recommended group size: 5–8 children across the age range, 2–3 teachers, 2–3 guest users
> - Equipment needed and consent forms for testing with minors"

---

## 2. Accessibility Review

> **Prompt:** "Perform an accessibility audit of a React Native app. Check and fix:
>
> **Visual:**
> - Colour contrast ratios meet WCAG AA (4.5:1 for text, 3:1 for large text) — check all theme colours against backgrounds
> - Text sizing: ensure all text respects the device's accessibility text size settings
> - Icons have sufficient size (minimum 24×24 dp) and are not the sole indicator of state
> - Colour is never the only way to convey information (e.g., the red/amber/green status on the dashboard also uses icons or text)
>
> **Screen reader:**
> - All interactive elements have `accessibilityLabel` and `accessibilityRole`
> - Game screens have meaningful descriptions (e.g., Memory Match cards announce 'Face down card, position 1 of 12' and 'Greek letter Alpha, uppercase')
> - Navigation announcements work with VoiceOver (iOS) and TalkBack (Android)
> - The Skia canvas in Letter Lab needs special accessibility handling — provide an alternative input method or descriptive mode
>
> **Motor:**
> - All tap targets are at least 44×44 points
> - Drag-and-drop in Sentence Builder has an alternative tap-to-place mode
> - No time-critical interactions that can't be paused (Word Bubbles should have a pause option)
>
> **Cognitive:**
> - Instructions are clear, short, and reinforced with visual cues
> - No penalty for mistakes — every game allows retry
> - Audio instructions accompany text for younger/pre-reading children
>
> Generate a checklist with pass/fail for each item and remediation steps for failures."

---

## 3. Security Review

> **Prompt:** "Perform a security review for a React Native app that uses Supabase with Microsoft SSO and anonymous auth. Check:
>
> **Authentication:**
> - Supabase anon key is used in the app (acceptable — designed to be public)
> - No service role key is embedded in the app bundle
> - Microsoft SSO token handling follows OAuth best practices (PKCE flow, secure token storage)
> - Anonymous auth sessions are properly scoped — an anonymous user cannot escalate to a staff role
>
> **Data protection:**
> - RLS policies are tested: verify that a teacher cannot query another teacher's students, that a student cannot read another student's data, and that an anonymous user can only access their own profile
> - The app never writes to existing tables (staff, students, classes, student_classes, guardians, attendance, timetable_slots) — verify with RLS policy review
> - `SECURITY DEFINER` functions are reviewed for SQL injection (parameterised queries only)
> - No sensitive data in client-side logs
>
> **Children's data (COPPA/GDPR-K):**
> - Students cannot play until `app_active = TRUE` (set by admin app)
> - Guest data is anonymous — no PII beyond self-provided name and age
> - `app_consent_at` timestamp provides an audit trail (set by admin app)
> - Data deletion path exists for school admins
> - No third-party analytics or tracking SDKs that collect children's data
>
> **Network:**
> - All Supabase communication is over HTTPS
> - No data cached in plaintext on device (except AsyncStorage for anonymous auth ID — acceptable)
> - Offline score queue is stored securely and cleared after sync
>
> Generate a security report with findings, risk levels, and remediation actions."

---

## 4. Localisation Framework

> **Prompt:** "Set up a localisation framework for a React Native app. The game content (Greek vocabulary, songs) stays in Greek, but the UI text (instructions, button labels, error messages, dashboard labels) needs to support multiple languages. Requirements:
> - Use `i18next` and `react-i18next` for the framework
> - Create an English language file at `src/locales/en.json` with all UI strings extracted from the app
> - Structure the file by feature: `auth`, `map`, `games`, `dashboard`, `rewards`, `settings`
> - Set up the framework so adding a new language is just adding a new JSON file (e.g., `src/locales/fr.json`)
> - Language selection in the Settings screen (default to device language)
> - For Phase 6, only English is fully translated — but the framework is in place for future languages
>
> Add `i18next`, `react-i18next`, and `@os-team/i18next-react-native-language-detector` to dependencies."

---

## 5. App Store Assets

> **Prompt:** "Create a checklist and specifications for app store submission assets for both Apple App Store and Google Play Store.
>
> **Apple App Store:**
> - App name: GreekPlay
> - Subtitle (30 chars): Learn Greek Through Play
> - Description (4000 chars): write a compelling description highlighting the island adventure, 7 game types, letter tracing, music, and teacher dashboard. Mention it's designed for ages 5–11 with no prior Greek knowledge needed
> - Keywords (100 chars): suggest optimal ASO keywords
> - Screenshots: 6.7" (iPhone 15 Pro Max), 6.1" (iPhone 15), 12.9" (iPad Pro) — list 6 screenshot scenes that showcase the best features
> - App Preview video: 30-second storyboard showing the welcome screen → island map → letter tracing → memory match → results → teacher dashboard
> - Age rating: 4+ (educational, no objectionable content)
> - Privacy policy URL (placeholder)
> - Category: Education
>
> **Google Play Store:**
> - Short description (80 chars)
> - Full description (4000 chars)
> - Feature graphic (1024×500)
> - Screenshots: phone and tablet — same 6 scenes
> - Content rating: IARC questionnaire guidance (educational app for children)
> - Target audience: under 13 (triggers Designed for Families policies)
>
> Generate the full text for descriptions and keyword suggestions."

---

## 6. Beta Testing

> **Prompt:** "Create a beta testing plan. Requirements:
> - **TestFlight (iOS):** Set up internal testing group (development team), then external testing group (5–10 families, 1 partner school)
> - **Google Play Internal Testing:** Same groups
> - **Testing checklist for beta testers:** 20 items covering: account creation (SSO and guest), gameplay across at least 3 islands, score tracking, Jukebox, Backpack, teacher dashboard, offline mode, tablet layout. Include a feedback form (Google Form or similar)
> - **Duration:** 2 weeks of beta with a feedback collection cutoff
> - **Bug triage process:** How to categorise and prioritise feedback (critical = crash/data loss, high = broken feature, medium = UX issue, low = cosmetic)
> - **Success criteria for launch:** 0 critical bugs, <3 high bugs, crash-free rate >99%, positive feedback from >80% of child testers"

---

## 7. App Store Submission

> **Prompt:** "Create a step-by-step submission guide for:
>
> **Apple App Store (App Store Connect):**
> - Create App Store Connect record
> - Upload build via Xcode (Archive → Upload)
> - Fill in all metadata, screenshots, app preview
> - Complete App Review Information (demo account credentials for reviewer — provide a test staff account and a test student account)
> - Submit for review — note common rejection reasons for children's apps and how to avoid them
>
> **Google Play Store (Google Play Console):**
> - Create app listing
> - Upload AAB (Android App Bundle)
> - Complete store listing, content rating, pricing
> - Designed for Families programme requirements (Teacher Approved badge eligibility)
> - Submit for review
>
> Include a pre-submission checklist for each platform."

---

## Done when:
- Usability issues from child testing have been addressed
- Accessibility audit passes with no critical failures
- Security review completed with all high-risk items resolved
- Localisation framework is in place with English strings extracted
- App store listings are complete with screenshots and descriptions
- Beta testing completed with feedback addressed
- App submitted and approved on both App Store and Google Play
