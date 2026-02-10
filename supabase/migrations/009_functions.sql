-- Auto-update updated_at timestamp
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

-- Auto-update item history on item creation
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

-- Accept pending invites on signup
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
