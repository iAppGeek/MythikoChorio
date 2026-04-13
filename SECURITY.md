# Security Policy

## Scope

Mythiko Chorio is a children's educational app. We take security and privacy seriously, particularly because the app may be used by minors.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, contact the maintainers directly via the email address on the GitHub profile. Include:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

You will receive a response within 5 business days. We ask that you give us reasonable time to investigate and patch before any public disclosure.

## Data and Privacy

- The app uses Supabase Row Level Security — users can only access their own data
- Anonymous guest sessions are stored locally via AsyncStorage
- External school system links are reference-only — the app never writes to external systems
- No advertising SDKs or third-party analytics are included

## Supported Versions

Only the latest version of the app is actively supported.
