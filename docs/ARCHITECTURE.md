# Architecture

## System boundaries

Nutrica is split into a React client and a serverless Express API. This is intentional: the client owns interaction and presentation, while the API owns privileged work such as OpenAI calls and service-role database operations.

| Boundary | Responsibility | Trust level |
| --- | --- | --- |
| `frontend/` | UI, route state, public Supabase client, file selection | Untrusted browser |
| `backend/` | Token verification, validation, AI requests, privileged persistence | Trusted server |
| Supabase | Authentication, user-scoped data, storage | Managed service |
| OpenAI | Nutrition-label extraction and meal-description estimates | Managed service |

## Request flow

1. The client obtains a Supabase session and attaches its bearer token to API calls.
2. Express verifies the token before routes that access a user's data.
3. Request validators normalize and bound input before database or AI operations.
4. Service modules isolate OpenAI and Supabase calls from route handlers.
5. The API returns a consistent JSON envelope; the client renders success or recoverable error state.

## Operational decisions

- Vercel serves the static frontend at `nutrica.fit` and routes `/api/*` to the API deployment.
- `VITE_*` values are public build-time configuration; server-only credentials never use that prefix.
- The health endpoint intentionally avoids upstream calls so deployment and cold-start diagnosis remain reliable.
- The API uses CORS allowlists, security headers, request limits, compression, and rate limiting at the edge.
