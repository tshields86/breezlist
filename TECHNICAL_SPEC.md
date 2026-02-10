# TECHNICAL_SPEC.md — Breezlist

## 1. Database Schema (Supabase / PostgreSQL)

### 1.1 Tables

#### `profiles`
Extends Supabase Auth users with app-specific data. Created automatically via trigger on auth.users insert.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

#### `lists`

```sql
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'New List',
  description TEXT,
  list_type TEXT NOT NULL DEFAULT 'general',
    -- Values: 'grocery', 'todo', 'packing', 'gift', 'general'
  is_template BOOLEAN NOT NULL DEFAULT false,
  sort_preference TEXT NOT NULL DEFAULT 'manual',
    -- Values: 'recent', 'alphabetical', 'manual'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lists_owner ON lists(owner_id);
CREATE INDEX idx_lists_template ON lists(is_template) WHERE is_template = true;
```

#### `list_members`
Tracks sharing. The owner is NOT stored here — ownership is on `lists.owner_id`.

```sql
CREATE TABLE list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor',
    -- Values: 'editor', 'viewer'
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(list_id, user_id)
);

CREATE INDEX idx_list_members_user ON list_members(user_id);
CREATE INDEX idx_list_members_list ON list_members(list_id);
```

#### `list_invites`
Pending invites for users who haven't signed up yet.

```sql
CREATE TABLE list_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  UNIQUE(list_id, email)
);

CREATE INDEX idx_list_invites_email ON list_invites(email);
```

#### `categories`
User-defined sections within a list.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_list ON categories(list_id);
```

#### `items`

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
    -- Values: null, 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'cups', 'pcs', 'dozen', 'pack'
  notes TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  sort_order FLOAT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_items_list ON items(list_id);
CREATE INDEX idx_items_list_sort ON items(list_id, sort_order);
```

#### `item_history`
Per-user history for autocomplete suggestions.

```sql
CREATE TABLE item_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text_normalized TEXT NOT NULL,     -- Lowercase, trimmed for matching
  text_display TEXT NOT NULL,        -- Original casing for display
  category_hint TEXT,                -- Last category this item was in
  frequency INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, text_normalized)
);

CREATE INDEX idx_item_history_user ON item_history(user_id);
CREATE INDEX idx_item_history_search ON item_history(user_id, text_normalized text_pattern_ops);
```

### 1.2 Row Level Security (RLS)

**Philosophy:** RLS is mandatory on every table — it's the only thing stopping unauthorized access via the public anon key. But policies should be as simple as possible to avoid accidentally blocking legitimate operations.

**Common pitfalls we're guarding against:**
- Missing policies for a specific operation (e.g., having SELECT but no UPDATE policy)
- Helper functions that fail because they don't have `SECURITY DEFINER`
- Overly complex WHERE clauses that silently return empty results
- Forgetting that INSERT uses `WITH CHECK` not `USING`

#### Enable RLS on all tables

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_history ENABLE ROW LEVEL SECURITY;
```

#### Helper function

This is the single reusable function for checking list access. It uses `SECURITY DEFINER` so it can query `lists` and `list_members` without being blocked by those tables' own RLS policies.

```sql
CREATE OR REPLACE FUNCTION user_has_list_access(_list_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM lists WHERE id = _list_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM list_members WHERE list_id = _list_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

**Why two separate EXISTS instead of UNION?** Simpler to debug, and the query planner can short-circuit after the first match.

#### Profiles policies

```sql
-- Any authenticated user can read profiles (needed to show collaborator names/avatars)
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());
```

#### Lists policies

```sql
-- Users see lists they own OR are a member of
CREATE POLICY "lists_select" ON lists
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR id IN (
    SELECT list_id FROM list_members WHERE user_id = auth.uid()
  ));

-- Any authenticated user can create a list (must set themselves as owner)
CREATE POLICY "lists_insert" ON lists
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Owners and editors can update list details (name, sort preference, etc.)
CREATE POLICY "lists_update" ON lists
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR id IN (
    SELECT list_id FROM list_members WHERE user_id = auth.uid() AND role = 'editor'
  ));

-- Only owners can delete lists
CREATE POLICY "lists_delete" ON lists
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());
```

#### Items policies

```sql
-- Users can see items in any list they have access to
CREATE POLICY "items_select" ON items
  FOR SELECT TO authenticated
  USING (user_has_list_access(list_id));

-- Users can add items to any list they have access to
CREATE POLICY "items_insert" ON items
  FOR INSERT TO authenticated
  WITH CHECK (user_has_list_access(list_id));

-- Users can update items in any list they have access to
CREATE POLICY "items_update" ON items
  FOR UPDATE TO authenticated
  USING (user_has_list_access(list_id));

-- Users can delete items in any list they have access to
CREATE POLICY "items_delete" ON items
  FOR DELETE TO authenticated
  USING (user_has_list_access(list_id));
```

**Note:** Items policies intentionally do NOT restrict by role (editor vs viewer). This keeps things simple for MVP. If viewer restrictions are needed later, add a `user_has_list_edit_access()` function.

#### Categories policies

```sql
-- Same pattern as items — full access if you can access the list
CREATE POLICY "categories_select" ON categories
  FOR SELECT TO authenticated
  USING (user_has_list_access(list_id));

CREATE POLICY "categories_insert" ON categories
  FOR INSERT TO authenticated
  WITH CHECK (user_has_list_access(list_id));

CREATE POLICY "categories_update" ON categories
  FOR UPDATE TO authenticated
  USING (user_has_list_access(list_id));

CREATE POLICY "categories_delete" ON categories
  FOR DELETE TO authenticated
  USING (user_has_list_access(list_id));
```

#### List members policies

```sql
-- Users can see members of lists they have access to
CREATE POLICY "list_members_select" ON list_members
  FOR SELECT TO authenticated
  USING (user_has_list_access(list_id));

-- Only list owners can add members
CREATE POLICY "list_members_insert" ON list_members
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM lists WHERE id = list_id AND owner_id = auth.uid()
  ));

-- Owners can remove anyone; members can remove themselves
CREATE POLICY "list_members_delete" ON list_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM lists WHERE id = list_id AND owner_id = auth.uid())
  );
```

#### List invites policies

```sql
-- Only list owners can manage invites
CREATE POLICY "list_invites_select" ON list_invites
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lists WHERE id = list_id AND owner_id = auth.uid()
  ));

CREATE POLICY "list_invites_insert" ON list_invites
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM lists WHERE id = list_id AND owner_id = auth.uid()
  ));

CREATE POLICY "list_invites_delete" ON list_invites
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lists WHERE id = list_id AND owner_id = auth.uid()
  ));
```

#### Item history policies

```sql
-- Users can only access their own history (simplest possible policy)
CREATE POLICY "item_history_select" ON item_history
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "item_history_insert" ON item_history
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "item_history_update" ON item_history
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "item_history_delete" ON item_history
  FOR DELETE TO authenticated USING (user_id = auth.uid());
```

### 1.3 RLS Testing Checklist

Run these checks after applying policies to catch issues early:

```sql
-- Simulate a specific user (replace with a real user UUID from auth.users)
SET role authenticated;
SET request.jwt.claims = '{"sub": "USER_UUID_HERE"}';

-- Test 1: User can see their own lists
SELECT * FROM lists;

-- Test 2: User can create a list
INSERT INTO lists (owner_id, name) VALUES (auth.uid(), 'Test List') RETURNING *;

-- Test 3: User can add items to their own list
INSERT INTO items (list_id, text, created_by)
VALUES ('LIST_ID', 'Test Item', auth.uid()) RETURNING *;

-- Test 4: User can update items in their list
UPDATE items SET text = 'Updated Item' WHERE id = 'ITEM_ID' RETURNING *;

-- Test 5: User can delete items
DELETE FROM items WHERE id = 'ITEM_ID' RETURNING *;

-- Test 6: User CANNOT see another user's private list
-- (Switch to a different user and verify the list doesn't appear)

-- Reset
RESET role;
RESET request.jwt.claims;
```

### 1.4 Database Functions

#### Auto-update item history on item creation
```sql
CREATE OR REPLACE FUNCTION update_item_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO item_history (user_id, text_normalized, text_display, category_hint)
  VALUES (
    NEW.created_by,
    lower(trim(NEW.text)),
    NEW.text,
    (SELECT name FROM categories WHERE id = NEW.category_id)
  )
  ON CONFLICT (user_id, text_normalized)
  DO UPDATE SET
    frequency = item_history.frequency + 1,
    last_used_at = now(),
    text_display = EXCLUDED.text_display,
    category_hint = EXCLUDED.category_hint;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_item_created
  AFTER INSERT ON items
  FOR EACH ROW EXECUTE FUNCTION update_item_history();
```

#### Auto-update `updated_at` timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON lists FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

#### Accept pending invites on signup
```sql
CREATE OR REPLACE FUNCTION accept_pending_invites()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO list_members (list_id, user_id, role, invited_by)
  SELECT li.list_id, NEW.id, li.role, li.invited_by
  FROM list_invites li
  WHERE li.email = NEW.email AND li.expires_at > now();

  DELETE FROM list_invites WHERE email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_accept_invites
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION accept_pending_invites();
```

### 1.5 Realtime Configuration

Enable realtime on these tables in Supabase dashboard:
- `items` — live item updates on shared lists
- `list_members` — when someone is added/removed
- `lists` — list rename/settings changes

---

## 2. Authentication

### 2.1 Email / Password
- `supabase.auth.signUp({ email, password })` for registration
- `supabase.auth.signInWithPassword({ email, password })` for login
- Password minimum: 8 characters (client-side and server-side)

### 2.2 Google OAuth
- `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Configure credentials in Supabase dashboard
- Redirect URL: Vercel preview URL during development, `app.breezlist.com` in production

### 2.3 Session Management
- `@supabase/auth-helpers-react` for session context
- Check `supabase.auth.getSession()` on app load
- Listen to `onAuthStateChange` for login/logout events
- Supabase handles refresh tokens automatically

### 2.4 Protected Routes
- All routes except `/login` and `/signup` require authentication
- `ProtectedRoute` wrapper redirects to `/login` if no session

---

## 3. API Patterns (Supabase Client Queries)

No custom API layer — all data access through Supabase JS client with RLS.

### 3.1 Lists

```typescript
// Fetch all lists (owned + shared)
const { data, error } = await supabase
  .from('lists')
  .select(`
    *,
    list_members(user_id, role, profiles:profiles(display_name, avatar_url)),
    items(count)
  `)
  .eq('is_template', false)
  .order('updated_at', { ascending: false });

// Create a list
const { data, error } = await supabase
  .from('lists')
  .insert({ name, list_type, owner_id: user.id })
  .select()
  .single();

// Update list
const { data, error } = await supabase
  .from('lists')
  .update({ name, sort_preference })
  .eq('id', listId)
  .select()
  .single();

// Delete list
const { error } = await supabase
  .from('lists')
  .delete()
  .eq('id', listId);
```

### 3.2 Items

```typescript
// Fetch items for a list
const { data, error } = await supabase
  .from('items')
  .select(`*, category:categories(id, name)`)
  .eq('list_id', listId)
  .order('is_completed', { ascending: true })
  .order('sort_order', { ascending: true });

// Add item
const { data, error } = await supabase
  .from('items')
  .insert({
    list_id: listId,
    text,
    quantity,
    unit,
    notes,
    category_id: categoryId,
    sort_order: nextSortOrder,
    created_by: user.id
  })
  .select()
  .single();

// Toggle completion
const { data, error } = await supabase
  .from('items')
  .update({
    is_completed: !currentState,
    completed_at: !currentState ? new Date().toISOString() : null,
    completed_by: !currentState ? user.id : null
  })
  .eq('id', itemId)
  .select()
  .single();

// Update sort order (drag and drop) — single row update
const { error } = await supabase
  .from('items')
  .update({ sort_order: newSortOrder })
  .eq('id', itemId);
```

### 3.3 Item History (Autocomplete)

```typescript
const { data, error } = await supabase
  .from('item_history')
  .select('text_display, frequency, category_hint')
  .eq('user_id', user.id)
  .ilike('text_normalized', `${query.toLowerCase()}%`)
  .order('frequency', { ascending: false })
  .limit(10);
```

### 3.4 Sharing

```typescript
async function shareList(listId: string, email: string, role: string) {
  // Check if user exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (profile) {
    // User exists — add as member directly
    return supabase.from('list_members').insert({
      list_id: listId, user_id: profile.id, role, invited_by: currentUser.id
    });
  } else {
    // User doesn't exist — create pending invite
    return supabase.from('list_invites').insert({
      list_id: listId, email, role, invited_by: currentUser.id
    });
  }
}
```

### 3.5 Realtime Subscriptions

```typescript
const channel = supabase
  .channel(`list:${listId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'items',
    filter: `list_id=eq.${listId}`
  }, (payload) => {
    // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    // payload.new / payload.old
  })
  .subscribe();

// Cleanup
return () => { supabase.removeChannel(channel); };
```

---

## 4. Frontend Architecture

### 4.1 Routing

```
/                  → Landing (unauthenticated) or redirect to /lists
/login             → Login form
/signup            → Signup form
/lists             → Dashboard — all lists
/lists/:id         → Single list view with items
/templates         → Template management
/settings          → User settings
```

### 4.2 Key Components

#### AddItemInput (most important UX component)
```
┌─────────────────────────────────────────────────┐
│  🔍 Add an item...                    [+]       │
│  ┌─────────────────────────────────────────────┐ │
│  │ Milk (added 12 times)               [+]     │ │
│  │ Mushrooms (added 3 times)           [+]     │ │
│  │ Mozzarella (added 2 times)          [+]     │ │
│  └─────────────────────────────────────────────┘ │
│  [Qty: __] [Unit: ▾] [Notes: ___] [Category: ▾] │
└─────────────────────────────────────────────────┘
```

- On focus: show frequent items. On type: filter by prefix.
- Tapping a suggestion adds it immediately.
- Expanded detail fields toggle with a chevron.
- After adding: clear input, keep focus for rapid entry.

#### ItemRow
```
┌─────────────────────────────────────────────────┐
│ [○] Organic Milk          2 gal    ⭐  [≡]     │
│      Notes: 2% preferred                        │
└─────────────────────────────────────────────────┘

Completed:
┌─────────────────────────────────────────────────┐
│ [✓] ~~Organic Milk~~      ~~2 gal~~      [≡]   │
└─────────────────────────────────────────────────┘
```

- Checkbox toggles completion. Star toggles importance.
- Tap text to edit. Drag handle for manual reorder.
- Completed items: strikethrough + muted colors + bottom section.

### 4.3 Theme System & Brand Colors

```css
/* globals.css */
:root {
  /* Brand — two-tone wordmark */
  --color-brand-breez: #0ea5e9;      /* Sky-500 — for "breez" */
  --color-brand-list: #334155;        /* Slate-700 — for "list" */

  /* Accent (derived from brand-breez) */
  --color-accent: #0ea5e9;
  --color-accent-hover: #0284c7;

  /* Surfaces */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;

  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;

  /* Borders */
  --color-border: #e5e7eb;

  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-star: #f59e0b;
}

.dark {
  --color-brand-breez: #38bdf8;      /* Sky-400 */
  --color-brand-list: #e2e8f0;        /* Slate-200 */

  --color-accent: #38bdf8;
  --color-accent-hover: #0ea5e9;

  --color-bg-primary: #0f172a;        /* Slate-900 */
  --color-bg-secondary: #1e293b;      /* Slate-800 */
  --color-bg-tertiary: #334155;       /* Slate-700 */

  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;

  --color-border: #334155;

  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-danger: #f87171;
  --color-star: #fbbf24;
}
```

**Logo component usage:**
```jsx
<span style={{ color: 'var(--color-brand-breez)' }}>breez</span>
<span style={{ color: 'var(--color-brand-list)' }}>list</span>
```

### 4.4 Data Export

Export a list as shareable text:

```
📋 Grocery List (Feb 10, 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━

🥬 Produce
  ☐ Organic Spinach (2 bags)
  ☐ Avocados (4 pcs)
  ☐ Bananas

🥛 Dairy
  ☐ Organic Milk (2 gal) — 2% preferred
  ☐ Greek Yogurt

✅ Completed
  ☑ Bread
  ☑ Eggs (1 dozen)

━━━━━━━━━━━━━━━━━━━━━━━━━━
Shared via Breezlist
```

Uses Web Share API on mobile, clipboard fallback on desktop.

---

## 5. PWA Configuration

### 5.1 manifest.json
```json
{
  "name": "Breezlist",
  "short_name": "Breezlist",
  "description": "Easy shared lists for everything",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0ea5e9",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 5.2 Service Worker (Workbox via vite-plugin-pwa)
- Precache: App shell (HTML, CSS, JS bundles, icons)
- Runtime cache: Supabase API with stale-while-revalidate
- Network-first for API, cache-first for static assets

---

## 6. Rate Limiting & Security

- Supabase Auth has built-in rate limits (30 signups/hour/IP by default)
- RLS enforces all data access rules at database level
- Never use service_role key in frontend
- Validate input lengths client-side: item text (500 chars), list name (100 chars), notes (1000 chars)

---

## 7. Performance Targets

- First Contentful Paint: < 1.5s on 4G
- Time to Interactive: < 3s on 4G
- Lighthouse PWA Score: 100
- Lighthouse Performance: > 90
- Bundle size: < 150KB gzipped (initial load)
- List load time: < 500ms for 100 items
