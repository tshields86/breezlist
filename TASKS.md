# TASKS.md — Breezlist Implementation Plan

## How to Use This File

Tasks are in implementation order — each builds on the previous. Complete them sequentially. Each task has acceptance criteria that define "done."

**Notation:**
- `[ ]` = Not started
- `[x]` = Complete
- Priority: 🔴 Critical (blocks other work) | 🟡 Important | 🟢 Nice-to-have

---

## Phase 1: Project Foundation

### Task 1.1 — Project Scaffolding 🔴
Set up the base project with all tooling.

- [ ] Initialize Vite React-TypeScript project: `npm create vite@latest breezlist -- --template react-ts`
- [ ] Install core dependencies:
  - `react-router-dom` (routing)
  - `@supabase/supabase-js @supabase/auth-helpers-react` (backend)
  - `tailwindcss` (styling)
  - `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` (drag and drop)
  - `clsx tailwind-merge` (class utilities)
  - `vite-plugin-pwa` (PWA support)
- [ ] Install dev dependencies:
  - `vitest @testing-library/react @testing-library/jest-dom jsdom`
  - `playwright @playwright/test`
  - `eslint eslint-plugin-react-hooks @typescript-eslint/eslint-plugin`
- [ ] Configure `tsconfig.json` with strict mode, path aliases (`@/` → `src/`)
- [ ] Configure `vite.config.ts` with path aliases and PWA plugin
- [ ] Configure `tailwind.config.ts` with dark mode class strategy
- [ ] Configure `vitest.config.ts` and `playwright.config.ts`
- [ ] Create `.env.example` and `.gitignore`
- [ ] Set up directory structure per CLAUDE.md

**Acceptance Criteria:**
- `npm run dev` starts with hot reload
- `npm run build` produces production build with no errors
- TypeScript strict mode enabled
- Tailwind classes work in a test component

### Task 1.2 — Theme System & Brand Colors 🔴
Implement dark/light mode with two-tone Breezlist branding.

- [ ] Create `src/styles/globals.css` with all CSS custom properties (per TECHNICAL_SPEC.md §4.3):
  - Brand colors: `--color-brand-breez` (sky/teal) and `--color-brand-list` (slate)
  - Full light and dark theme tokens
- [ ] Create `src/lib/utils.ts` with `cn()` utility (clsx + tailwind-merge)
- [ ] Create `src/contexts/ThemeContext.tsx`:
  - Reads system preference via `prefers-color-scheme`
  - Reads stored preference from `localStorage`
  - Manual toggle overrides system preference
  - Applies `dark` class to `<html>` element
- [ ] Create `src/hooks/useTheme.ts`
- [ ] Create `src/components/ui/ThemeToggle.tsx` — sun/moon icon button
- [ ] Create `src/components/ui/Logo.tsx` — two-tone "breezlist" wordmark:
  - "breez" in `var(--color-brand-breez)`
  - "list" in `var(--color-brand-list)`

**Acceptance Criteria:**
- App respects system dark/light preference on first visit
- Toggle switches between dark and light
- Preference persists after reload
- Logo renders in two colors, correct for each theme
- All CSS variables switch correctly between themes

### Task 1.3 — Supabase Setup 🔴
Create Supabase project and configure database.

- [ ] Create Supabase project (or `supabase init` for local dev)
- [ ] Create `src/lib/supabase.ts` — initialize client with env vars
- [ ] Write SQL migrations in `supabase/migrations/` (numbered):
  - `001_profiles.sql` — profiles table + auto-create trigger
  - `002_lists.sql` — lists table + indexes
  - `003_list_members.sql` — list_members table
  - `004_list_invites.sql` — list_invites table
  - `005_categories.sql` — categories table
  - `006_items.sql` — items table
  - `007_item_history.sql` — item_history table + auto-update trigger
  - `008_rls_policies.sql` — helper function + ALL RLS policies
  - `009_functions.sql` — updated_at triggers, invite acceptance trigger
- [ ] Apply migrations to Supabase
- [ ] Generate TypeScript types: `npx supabase gen types typescript > src/lib/database.types.ts`
- [ ] **Test RLS policies** using the checklist in TECHNICAL_SPEC.md §1.3

**Acceptance Criteria:**
- All tables created with correct schemas
- RLS enabled on all tables with policies applied
- Triggers work: new auth user → profile created, item added → history updated
- TypeScript types generated and importable
- RLS test checklist passes (can read/write own data, cannot access others')

### Task 1.4 — Authentication 🔴
Implement signup, login, and session management.

- [ ] Create `src/contexts/AuthContext.tsx`:
  - Provides `user`, `session`, `signUp`, `signIn`, `signInWithGoogle`, `signOut`
  - Listens to `onAuthStateChange`
  - Handles loading state during session init
- [ ] Create `src/hooks/useAuth.ts`
- [ ] Create `src/components/auth/LoginForm.tsx` — email/password + Google button + errors
- [ ] Create `src/components/auth/SignupForm.tsx` — email/password/confirm + Google button
- [ ] Create `src/components/auth/GoogleAuthButton.tsx`
- [ ] Create `src/components/auth/ProtectedRoute.tsx` — redirects to /login if no session
- [ ] Create `src/pages/Landing.tsx` — unauthenticated landing with login/signup

**Acceptance Criteria:**
- Signup with email/password works
- Login with email/password works
- Google OAuth works
- Session persists on page refresh
- Unauthenticated → redirected to login
- Authenticated → redirected from login to /lists
- Errors display for invalid credentials / existing email

---

## Phase 2: Core List Management

### Task 2.1 — App Layout & Navigation 🔴
Build the app shell with routing.

- [ ] Create `src/App.tsx` with React Router:
  - Public: `/`, `/login`, `/signup`
  - Protected: `/lists`, `/lists/:id`, `/templates`, `/settings`
- [ ] Create `src/components/layout/AppShell.tsx` — header + main + bottom nav
- [ ] Create `src/components/layout/BottomNav.tsx` — Lists / Templates / Settings tabs
- [ ] Create `src/components/layout/Header.tsx` — Logo (two-tone), theme toggle, user avatar/menu

**Acceptance Criteria:**
- Navigation between all routes works
- Bottom nav shows active state
- Layout looks good on 375px mobile viewport
- Header shows two-tone logo, theme toggle, sign out

### Task 2.2 — List CRUD 🔴
Create, read, update, delete lists.

- [ ] Create `src/hooks/useLists.ts` — fetchLists, createList, updateList, deleteList, duplicateList
- [ ] Create `src/components/lists/ListCard.tsx` — name, item count, last updated, collaborator avatars
- [ ] Create `src/components/lists/ListGrid.tsx` — "My Lists" + "Shared with Me" sections
- [ ] Create `src/components/lists/CreateListModal.tsx` — blank / copy from existing / from template
- [ ] Create `src/pages/Home.tsx` — ListGrid + FAB for creating lists

**Acceptance Criteria:**
- Dashboard shows owned and shared lists
- Create blank list with name and type
- Rename and delete lists
- Copy from existing list copies all items (unchecked)
- Empty state when no lists exist

### Task 2.3 — Item CRUD 🔴
Add, edit, complete, delete, and star items.

- [ ] Create `src/hooks/useItems.ts` — fetchItems, addItem, updateItem, toggleComplete, toggleStar, deleteItem, clearCompleted, reorderItem
- [ ] Create `src/components/items/ItemRow.tsx` — checkbox, text, qty, star, drag handle, completed state
- [ ] Create `src/components/items/AddItemInput.tsx` — sticky bottom input, expandable details
- [ ] Create `src/components/items/EditItemModal.tsx` — full edit form with delete
- [ ] Create `src/pages/ListView.tsx` — header, items, completed section, add input

**Acceptance Criteria:**
- Add items with text (required), qty/unit/notes (optional)
- Edit any field on existing items
- Checkbox marks complete → item moves to bottom with strikethrough
- Tap completed item to restore
- Star toggle works
- Delete removes item
- "Clear completed" removes all completed items
- Adding items triggers item_history update (verify in DB)

---

## Phase 3: Advanced Features

### Task 3.1 — Item Autocomplete & History 🟡
Smart suggestions from past items.

- [ ] Create `src/hooks/useItemHistory.ts` — searchHistory, getFrequentItems
- [ ] Create `src/components/items/ItemAutocomplete.tsx` — dropdown with suggestions
- [ ] Update AddItemInput to show autocomplete on focus and on type
- [ ] Tapping suggestion adds item immediately with category auto-assignment

**Acceptance Criteria:**
- Suggestions appear as user types (prefix match, ranked by frequency)
- On empty focus: show recent/frequent items
- Tapping suggestion adds item immediately
- Category auto-assigned from suggestion's category_hint

### Task 3.2 — Drag-and-Drop Sorting 🟡
Manual item reordering.

- [ ] Implement dnd-kit sortable list in ListView
- [ ] Sort mode selector: Recently added / Alphabetical / Manual
- [ ] Fractional indexing for sort_order (only update moved item)
- [ ] Drag handle visible only in manual sort mode

**Acceptance Criteria:**
- Items draggable and reorderable in manual mode
- Sort order persists after reload
- Sort mode switching works
- Drag handle only shows in manual mode

### Task 3.3 — Categories / Sections 🟡
Group items by category.

- [ ] Create `src/components/items/CategoryGroup.tsx` — collapsible section
- [ ] Category management: add, rename, delete
- [ ] AddItemInput includes category selector
- [ ] ListView renders items grouped by category
- [ ] Default category suggestions for common list types (grocery → Produce, Dairy, Meat, etc.)

**Acceptance Criteria:**
- Create/rename/delete categories within a list
- Assign items to categories
- Items display grouped by category
- Categories are collapsible
- Completed items in separate bottom section (not in categories)

### Task 3.4 — List Sharing 🟡
Share lists for real-time collaboration.

- [ ] Create `src/components/lists/ShareListModal.tsx` — invite by email, manage members
- [ ] Implement sharing logic: existing user → add member, new user → pending invite
- [ ] Create `src/hooks/useRealtime.ts` — subscribe to item changes, update UI live
- [ ] Show collaborator avatars on shared lists

**Acceptance Criteria:**
- Share list by email (existing user: instant, new user: pending invite)
- Shared users see list in "Shared with Me"
- Changes sync in real time between collaborators
- Members can leave, owners can remove members

### Task 3.5 — Templates 🟡
Save and use list templates.

- [ ] Create `src/pages/Templates.tsx` — template grid with "Use template" button
- [ ] Save existing list as template
- [ ] Create new list from template (items copied, unchecked)
- [ ] Edit and delete templates
- [ ] Update CreateListModal with "From template" option

**Acceptance Criteria:**
- Save any list as template
- Create new list from template
- Templates editable independently
- Templates appear on Templates page

### Task 3.6 — Data Export 🟢
Export lists as shareable text.

- [ ] Create `src/lib/exportList.ts` — formatted text output (per TECHNICAL_SPEC.md §4.4)
- [ ] Export action in list menu: Web Share API on mobile, clipboard fallback on desktop
- [ ] Toast confirmation on export/copy

**Acceptance Criteria:**
- Export produces formatted text with categories and completion status
- Web Share API on supporting devices, clipboard fallback elsewhere
- Toast confirms action

---

## Phase 4: PWA & Polish

### Task 4.1 — PWA Configuration 🟡
Make the app installable.

- [ ] Create `public/manifest.json` (per TECHNICAL_SPEC.md §5.1)
- [ ] Create app icons (192, 512, maskable) — placeholder initially
- [ ] Configure vite-plugin-pwa: precache app shell, runtime cache for API
- [ ] Add PWA meta tags to `index.html`

**Acceptance Criteria:**
- Lighthouse PWA score: 100
- App installable on mobile
- Standalone mode (no browser chrome)
- App shell loads from cache on repeat visits

### Task 4.2 — UI Polish & Animations 🟢
Make it feel premium and native.

- [ ] Smooth transitions: checkbox animation, item completion slide, modal open/close
- [ ] Touch targets: minimum 44x44px on all interactive elements
- [ ] Loading skeletons for list and item fetches
- [ ] Empty states with helpful messages and icons
- [ ] Toast notification system (success, error)
- [ ] Responsive audit: 375px, 390px, 768px, 1024px+

**Acceptance Criteria:**
- Animations smooth (60fps)
- All elements have visible active/focus states
- Loading and empty states present
- Toast notifications for key actions
- Looks good across all target viewports

### Task 4.3 — Settings Page 🟢
User preferences and account management.

- [ ] Create `src/pages/Settings.tsx`:
  - Account: display name (editable), email (read-only)
  - Appearance: theme preference (System / Light / Dark)
  - Data: export all data, delete account
  - About: version, link to breezlist.com
- [ ] Account deletion with "Type DELETE to confirm"

**Acceptance Criteria:**
- Display name editable
- Theme changeable from settings
- Account deletion works with confirmation

---

## Phase 5: Testing & Deployment

### Task 5.1 — Unit & Component Tests 🟡

- [ ] Unit tests: `cn()`, text normalization, export formatting, fractional indexing
- [ ] Component tests: ItemRow, AddItemInput, ListCard, ThemeToggle, LoginForm, CreateListModal

**Acceptance Criteria:**
- All tests pass in < 30 seconds
- Coverage > 70% for tested modules

### Task 5.2 — E2E Tests 🟡

- [ ] `auth.spec.ts` — signup, login, logout
- [ ] `lists.spec.ts` — create, rename, delete
- [ ] `items.spec.ts` — add, complete, star, delete
- [ ] `sharing.spec.ts` — share list, real-time sync
- [ ] `templates.spec.ts` — save and use templates
- [ ] `sorting.spec.ts` — sort modes, drag and drop

**Acceptance Criteria:**
- All E2E tests pass against test Supabase instance
- Tests run in GitHub Actions CI

### Task 5.3 — CI/CD Pipeline 🟡

- [ ] Create `.github/workflows/ci.yml` — typecheck, lint, unit tests, E2E
- [ ] Configure Vercel: connect repo, set env vars, auto-deploy main
- [ ] Code splitting by route (React.lazy)

**Acceptance Criteria:**
- CI runs on every push/PR
- Vercel auto-deploys on merge to main
- Production bundle < 150KB gzipped

### Task 5.4 — Final QA & Launch 🟢

- [ ] Lighthouse audit: Performance > 90, PWA = 100, Accessibility > 90
- [ ] Mobile testing: iOS Safari, Android Chrome
- [ ] Security review: RLS policies verified, no exposed secrets
- [ ] Error handling review
- [ ] README with setup instructions

**Acceptance Criteria:**
- All Lighthouse audits pass
- No console errors in production
- Works on iOS Safari and Android Chrome
- Deployed at breezlist.vercel.app

---

## Future Enhancements (Post-MVP)

- [ ] Offline support (IndexedDB + background sync)
- [ ] Push notifications
- [ ] Undo/redo stack
- [ ] AI item suggestions
- [ ] Barcode scanning
- [ ] Store aisle mapping
- [ ] Price tracking
- [ ] Recurring lists
- [ ] Multi-language support
- [ ] Marketing site (breezlist.com)
