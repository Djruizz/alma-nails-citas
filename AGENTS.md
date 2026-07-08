# AGENTS.md

Notes that are not obvious from the file tree. Read before editing.

## Tooling

- Package manager is **pnpm** (lockfile `pnpm-lock.yaml`; `pnpm-workspace.yaml` only configures build allow-list, this is not a monorepo).
- Nuxt 4 with `ssr: false` (pure SPA). Modules: `@nuxtjs/supabase`, `@nuxt/ui` v4. Tailwind v4 via `app/assets/css/main.css` (`@import "tailwindcss"` + `@import "@nuxt/ui"`).
- Nuxt 4 source dir is `app/` (not root) — pages/components/composables/middleware/schemas/types/layouts all live under `app/`.
- Scripts: `pnpm dev`, `pnpm build`, `pnpm generate`, `pnpm preview`. No `lint`, `typecheck`, or `test` script is defined — do not assume one exists. `postinstall` runs `nuxt prepare`.
- A `nuxt-ui` skill is installed (see `.agents/skills/nuxt-ui/SKILL.md` and `skills-lock.json`); load it via the skill tool before building UI.

## Supabase

- Backend is Supabase (project id `ivhbffyoxcjltawnjnma`, hardcoded in the `gen-types` script). Config is provided to `@nuxtjs/supabase` via env vars (`SUPABASE_URL` / `SUPABASE_KEY`); no `.env.example` is committed.
- Regenerate DB types after schema changes: `pnpm gen-types` → writes `app/types/database.types.ts`. This file is generated — edit the schema, not the types.
- Tables: `appointments`, `clients`, `services`. Enum `appointment_status`: `PENDING | CONFIRMED | COMPLETED | CANCELED`. Use the exported `Tables` / `TablesInsert` / `TablesUpdate` helpers from `~/types/database.types` for typed payloads.

## App conventions

- UI language is **Spanish** (labels, validation messages, error strings, WhatsApp reminder text). Keep new strings Spanish.
- Use `@nuxt/ui` components (`UApp`, `UButton`, `UIcon`, etc.) and `useSupabaseClient()` / `useSupabaseUser()` from `@nuxtjs/supabase` — do not add another Supabase client or fetch library.
- Data access lives in `app/composables/` (`useAppointments`, `useClients`, `useServices`, `useAppointmentStatus`, `useDateUtils`). Each composable owns its `useState` keys; reuse them rather than re-querying inline in pages.
- Validation schemas in `app/schemas/` use **zod v4** (`import * as z from "zod"`).
- Auth gating: `app/middleware/admin-auth.global.ts` redirects unauthenticated users from `/admin/*` to `/login`. `app/pages/index.vue` is the session router. New admin pages go under `app/pages/admin/` and inherit this guard automatically.
- Appointment status transitions are enforced client-side by `useAppointmentStatus().isValidStatusTransition` (PENDING→CONFIRMED|CANCELED, CONFIRMED→COMPLETED|CANCELED, terminal states immutable). Mirror these rules if you touch status logic.
- Primary color is `pink` (set in `app/app.config.ts`); do not hardcode brand colors in components.