# Contributing

Thank you for your interest in Mythiko Chorio.

## Reporting bugs

Open a GitHub issue with:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behaviour
- Device / OS / simulator details

## Suggesting features

Open a GitHub issue with the `enhancement` label. Describe the use case and the expected user experience.

## Pull requests

1. Fork the repo and create a branch from `main`
2. Keep changes focused — one feature or fix per PR
3. Ensure all checks pass before requesting review:
   ```bash
   npx tsc --noEmit
   npx eslint "src/**/*.{ts,tsx}"
   npm test
   ```
4. Update `supabase/schema.sql` if your change requires database modifications
5. Write a clear PR description explaining what changed and why

## Code style

- TypeScript strict mode — no `any`, explicit return types on functions
- `type` over `interface` unless extending
- Every new function or component needs a corresponding test
- No TODO comments — implement it or skip it

## Database changes

Edit `supabase/schema.sql` directly — it is the single source of truth for the schema.
Migrations will be introduced once the schema stabilises for production.
