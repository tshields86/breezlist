CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'New List',
  description TEXT,
  list_type TEXT NOT NULL DEFAULT 'general',
  is_template BOOLEAN NOT NULL DEFAULT false,
  sort_preference TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lists_owner ON lists(owner_id);
CREATE INDEX idx_lists_template ON lists(is_template) WHERE is_template = true;
