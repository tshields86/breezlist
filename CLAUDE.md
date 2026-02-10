# CLAUDE.md — Breezlist

## Project Overview

Breezlist is a lightweight, easy-to-use Progressive Web App (PWA) for managing shared lists. Users can create, share, and collaborate on lists of any kind — grocery shopping, todo items, packing lists, gift ideas, and more.

**The core philosophy: dead simple, breezy to use.** Every design and engineering decision should favor simplicity and intuitive UX with a slick UI. If a feature adds complexity without clear user value, cut it. If there are two ways to build something, pick the simpler one. The app should feel effortless — like a breeze.

The key differentiator is smart item re-adding: users can easily reference past items, copy from previous lists, and save templates for recurring scenarios like weekly grocery shopping.

## Branding

**Name:** Breezlist (stylized as **breez**list in the logo)

**Two-tone logo treatment:**
- "breez" → Primary brand color (Sky/Teal: `#0ea5e9` light mode, `#38bdf8` dark mode)
- "list" → Secondary brand color (Slate: `#334155` light mode, `#e2e8f0` dark mode)
- This two-tone split should be used in the app header, splash screen, and anywhere the logo/wordmark appears
- The primary brand color (sky/teal) is also used for accent elements: buttons, links, active states, checkmarks

**Domain strategy:**
- `breezlist.com` → Marketing/landing site (future)
- `app.breezlist.com` → The PWA (future)
- `breezlist.vercel.app` → Initial deployment during development

## Design Philosophy

1. **Simplicity first** — Every screen should be immediately understandable. No onboarding tutorial needed.
2. **Mobile-native feel** — Bottom navigation, thumb-friendly tap targets (44px minimum), swipe gestures where natural.
3. **Speed over features** — Fast load, fast interactions. Cut features before compromising speed.
4. **Calm UI** — Generous whitespace, subtle animations, no visual clutter. The content IS the interface.
5. **Smart defaults** — Minimize decisions the user has to make. Pre-fill, auto-suggest, remember preferences.
6. **Slick but not flashy** — Polished micro-interactions (checkbox animations, smooth transitions) that feel premium without being distracting.

## Tech Stack

### Frontend
- **React 18+** with **TypeScript** (strict mode)
- **Vite** for build tooling and dev server
- **React Router v6** for client-side routing
- **Tailwind CSS v4** for styling (dark/light mode from day one)
- **dnd-kit** for drag-and-drop item reordering
- **Workbox** (via vite-plugin-pwa) for PWA service worker and caching

### Backend / Database / Auth
- **Supabase** (hosted PostgreSQL)
  - **Supabase Auth** for authentication (email/password + Google OAuth)
  - **Supabase Realtime** for live sync on shared lists
  - **Row Level Security (RLS)** for data access policies
  - **Supabase Edge Functions** for server-side logic if needed

### Hosting & Deployment
- **Vercel** (free tier) for frontend hosting
- **Supabase** (free tier) for backend
- **GitHub Actions** for CI/CD

### Testing
- **Vitest** for unit and integration tests
- **React Testing Library** for component tests
- **Playwright** for end-to-end tests

## Project Structure

```
breezlist/
├── public/
│   ├── manifest.json
│   ├── icons/
│   └── favicon.ico
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── ui/                # Button, Input, Modal, Toast, etc.
│   │   ├── layout/            # AppShell, Header, BottomNav, ThemeToggle
│   │   ├── lists/             # ListCard, ListGrid, CreateListModal, ShareListModal
│   │   ├── items/             # ItemRow, AddItemInput, ItemAutocomplete, CategoryGroup
│   │   └── auth/              # LoginForm, SignupForm, GoogleAuthButton
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Home.tsx
│   │   ├── ListView.tsx
│   │   ├── Templates.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLists.ts
│   │   ├── useItems.ts
│   │   ├── useRealtime.ts
│   │   ├── useItemHistory.ts
│   │   └── useTheme.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── database.types.ts
│   │   └── utils.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .github/workflows/ci.yml
├── CLAUDE.md
├── TASKS.md
├── TECHNICAL_SPEC.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── .env.example
```

## Key Architecture Decisions

### Authentication
- Supabase Auth handles all auth flows.
- Support email/password signup and Google OAuth.
- On signup, auto-create a `profiles` row via database trigger.
- Protect all routes except landing/login page.

### Data Access & Row Level Security (RLS)

**RLS is required on every table** — without it, anyone with the public anon key can read/write all data. But policies must be **simple and tested** to avoid blocking legitimate operations.

**RLS Principles:**
- Keep policies as simple as possible. One or two conditions max.
- Use a single helper function `user_has_list_access(list_id)` for shared-list access checks.
- Every table needs explicit policies for each operation type (SELECT, INSERT, UPDATE, DELETE).
- INSERT uses `WITH CHECK`, not `USING`. UPDATE needs both.
- Helper functions MUST use `SECURITY DEFINER` so they can query other RLS-protected tables.
- Test policies through the Supabase JS client (not the SQL editor, which bypasses RLS).

**If writes are failing and you suspect RLS:**
1. Check browser Network tab — Supabase returns empty arrays (not errors) when RLS blocks.
2. Verify the policy exists for that specific operation (SELECT ≠ INSERT ≠ UPDATE ≠ DELETE).
3. Check that helper functions use `SECURITY DEFINER`.
4. Test with `set role authenticated; set request.jwt.claims = '{"sub":"<user-id>"}';` in SQL editor.
5. **Last resort**: add a temporary permissive policy (`USING (true)`) to isolate the problem — **never leave in production**.
6. **Never remove RLS entirely** — fix the policy instead.

See TECHNICAL_SPEC.md for all policy definitions.

### Realtime
- Subscribe to item changes on shared lists via Supabase Realtime.
- Subscribe when a list is opened, unsubscribe when navigating away.

### Sorting
- Recently added: `ORDER BY created_at DESC`
- Alphabetical: `ORDER BY text ASC`
- Manual: `ORDER BY sort_order ASC` with fractional indexing (only update moved item)
- Preference stored per-list.

### Completed Items (Soft Delete)
- Completed items sink to bottom with strikethrough. Tap to restore.
- "Clear completed" action for bulk removal.

### Item History & Autocomplete
- On item add, upsert into `item_history` (normalized text, frequency, last_used_at).
- Autocomplete searches history by prefix, ranked by frequency.
- Per-user, not per-list.

### Dark/Light Mode
- Tailwind class strategy with CSS custom properties.
- System preference by default, manual override in localStorage.

## Coding Conventions

- **TypeScript strict mode** — no `any` without a justifying comment.
- **Functional components only** with named exports (default exports only for pages).
- **Components under 150 lines** — extract logic into hooks, utilities into `lib/`.
- **Tailwind for styling** — use `cn()` utility for conditional classes. Avoid custom CSS.
- **Mobile-first** — default styles are mobile, add `sm:`/`md:`/`lg:` for larger screens.
- **No Redux** — React context + hooks for state. Keep it simple.
- **Error handling** — try/catch around Supabase calls, user-friendly toasts, never expose raw DB errors.
- **Accessibility** — semantic HTML, keyboard navigation, `aria-label` on icon buttons, WCAG AA contrast.

### Commit Practices
- **Commit frequently** - After completing each logical unit of work
- **Omit signature** - Do not include "Generated by Claude Code" or similar signatures in commits
- **Use conventional commits:** `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `test:`

## Environment Variables

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Vitest unit/integration
npm run test:e2e     # Playwright E2E
npm run typecheck    # TypeScript check
npm run lint         # ESLint
```

## Deployment

- **Vercel**: Auto-deploys `main` branch. Preview deployments on PRs.
- **Supabase**: Migrations via `supabase db push`.
- **Initial URL**: `breezlist.vercel.app`
- **Future URL**: `app.breezlist.com`

## Important Reminders

- **Never disable RLS.** Fix the policy, don't remove it.
- **Never store secrets in frontend code** — only the anon key is safe to expose.
- **Test RLS from the client**, not the SQL editor.
- **Optimize for mobile** — phone-first app, always test on mobile viewports.
- **Keep it simple** — a simple feature that works beats a complex feature that confuses.
- **Favor simplicity and intuitive UX with slick UI** — this is the guiding principle for every decision.
