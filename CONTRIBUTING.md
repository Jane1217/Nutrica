# Contributing to Nutrica

Thanks for improving Nutrica. Keep changes focused, accessible, and safe for
people tracking personal nutrition data.

## Before opening a pull request

1. Use Node.js 20 (see [`.nvmrc`](.nvmrc)) and install dependencies with the
   committed lockfiles:

   ```bash
   npm --prefix frontend ci
   npm --prefix backend ci
   ```

2. Keep browser-only configuration in `frontend/.env.local` and server secrets
   in `backend/.env`. Never commit either file.
3. Run the complete verification suite:

   ```bash
   npm run verify
   npm run audit
   ```

## Code guidelines

- Use PascalCase for React component files and camelCase for utility modules.
- Prefer small, pure utility functions for rules that can be tested outside the
  browser; place UI state and side effects at route or component boundaries.
- Preserve keyboard access, visible focus states, responsive layouts, and
  meaningful labels for interactive controls.
- Validate untrusted data at the API boundary. Do not move server credentials
  or privileged database work into the client.
- Include tests whenever changing validation, parsing, progress calculations,
  or other deterministic behavior.

## Pull request notes

Describe the user-visible behavior, verification performed, and any changes to
environment variables, Supabase schema, or deployment configuration. Do not
include screenshots or logs containing personal data, tokens, or credentials.
