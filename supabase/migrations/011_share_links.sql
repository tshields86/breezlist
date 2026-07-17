-- Share-by-link: public read-only access to a list via an unguessable token.
-- All public access flows through SECURITY DEFINER RPCs below; the base-table
-- RLS policies are intentionally left unchanged (still authenticated-only).

ALTER TABLE lists
  ADD COLUMN share_token   TEXT UNIQUE,
  ADD COLUMN share_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_lists_share_token ON lists(share_token) WHERE share_token IS NOT NULL;

-- Owner enables (and lazily mints) a share link. Returns the token.
CREATE OR REPLACE FUNCTION create_share_link(_list_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _token TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM lists WHERE id = _list_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE lists
     SET share_token   = COALESCE(share_token, gen_random_uuid()::text),
         share_enabled = true
   WHERE id = _list_id
  RETURNING share_token INTO _token;

  RETURN _token;
END;
$$;

-- Owner disables the link (the URL stops resolving; re-enabling reuses the token).
CREATE OR REPLACE FUNCTION revoke_share_link(_list_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM lists WHERE id = _list_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE lists SET share_enabled = false WHERE id = _list_id;
END;
$$;

-- Public: fetch a shared list by token (read-only, limited columns — no owner PII).
CREATE OR REPLACE FUNCTION get_shared_list(_token TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  list_type TEXT,
  description TEXT,
  sort_preference TEXT,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, name, list_type, description, sort_preference, updated_at
  FROM lists
  WHERE share_token = _token AND share_enabled = true;
$$;

-- Public: fetch a shared list's items by token (read-only).
CREATE OR REPLACE FUNCTION get_shared_items(_token TEXT)
RETURNS TABLE (
  id UUID,
  list_id UUID,
  text TEXT,
  quantity NUMERIC,
  unit TEXT,
  notes TEXT,
  is_completed BOOLEAN,
  is_starred BOOLEAN,
  sort_order FLOAT,
  category_id UUID
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT i.id, i.list_id, i.text, i.quantity, i.unit, i.notes,
         i.is_completed, i.is_starred, i.sort_order, i.category_id
  FROM items i
  JOIN lists l ON l.id = i.list_id
  WHERE l.share_token = _token AND l.share_enabled = true;
$$;

-- Authenticated: join a shared list as an editor via the token.
CREATE OR REPLACE FUNCTION join_via_share_link(_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _list_id  UUID;
  _owner_id UUID;
BEGIN
  SELECT id, owner_id INTO _list_id, _owner_id
  FROM lists
  WHERE share_token = _token AND share_enabled = true;

  IF _list_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or disabled link';
  END IF;

  -- Owner opening their own link: nothing to add.
  IF _owner_id <> auth.uid() THEN
    INSERT INTO list_members (list_id, user_id, role, invited_by)
    VALUES (_list_id, auth.uid(), 'editor', _owner_id)
    ON CONFLICT (list_id, user_id) DO NOTHING;
  END IF;

  RETURN _list_id;
END;
$$;

-- Grants: read RPCs are public (anon); mutating RPCs require a session.
REVOKE ALL ON FUNCTION create_share_link(UUID)   FROM PUBLIC;
REVOKE ALL ON FUNCTION revoke_share_link(UUID)   FROM PUBLIC;
REVOKE ALL ON FUNCTION join_via_share_link(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_share_link(UUID)   TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_share_link(UUID)   TO authenticated;
GRANT EXECUTE ON FUNCTION join_via_share_link(TEXT) TO authenticated;

REVOKE ALL ON FUNCTION get_shared_list(TEXT)  FROM PUBLIC;
REVOKE ALL ON FUNCTION get_shared_items(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_shared_list(TEXT)  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_shared_items(TEXT) TO anon, authenticated;
