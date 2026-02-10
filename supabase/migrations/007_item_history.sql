CREATE TABLE item_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text_normalized TEXT NOT NULL,
  text_display TEXT NOT NULL,
  category_hint TEXT,
  frequency INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, text_normalized)
);

CREATE INDEX idx_item_history_user ON item_history(user_id);
CREATE INDEX idx_item_history_search ON item_history(user_id, text_normalized text_pattern_ops);
