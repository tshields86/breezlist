CREATE TABLE list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor',
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(list_id, user_id)
);

CREATE INDEX idx_list_members_user ON list_members(user_id);
CREATE INDEX idx_list_members_list ON list_members(list_id);
