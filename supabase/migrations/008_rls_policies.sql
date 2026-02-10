-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_history ENABLE ROW LEVEL SECURITY;

-- Helper function for checking list access
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

-- Profiles policies
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- Lists policies
CREATE POLICY "lists_select" ON lists
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR id IN (
    SELECT list_id FROM list_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "lists_insert" ON lists
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "lists_update" ON lists
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR id IN (
    SELECT list_id FROM list_members WHERE user_id = auth.uid() AND role = 'editor'
  ));

CREATE POLICY "lists_delete" ON lists
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Items policies
CREATE POLICY "items_select" ON items
  FOR SELECT TO authenticated
  USING (user_has_list_access(list_id));

CREATE POLICY "items_insert" ON items
  FOR INSERT TO authenticated
  WITH CHECK (user_has_list_access(list_id));

CREATE POLICY "items_update" ON items
  FOR UPDATE TO authenticated
  USING (user_has_list_access(list_id));

CREATE POLICY "items_delete" ON items
  FOR DELETE TO authenticated
  USING (user_has_list_access(list_id));

-- Categories policies
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

-- List members policies
CREATE POLICY "list_members_select" ON list_members
  FOR SELECT TO authenticated
  USING (user_has_list_access(list_id));

CREATE POLICY "list_members_insert" ON list_members
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM lists WHERE id = list_id AND owner_id = auth.uid()
  ));

CREATE POLICY "list_members_delete" ON list_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM lists WHERE id = list_id AND owner_id = auth.uid())
  );

-- List invites policies
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

-- Item history policies
CREATE POLICY "item_history_select" ON item_history
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "item_history_insert" ON item_history
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "item_history_update" ON item_history
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "item_history_delete" ON item_history
  FOR DELETE TO authenticated USING (user_id = auth.uid());
