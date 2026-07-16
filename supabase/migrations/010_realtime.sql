-- Enable Supabase Realtime for shared-list collaboration.
--
-- Realtime only streams changes for tables that belong to the
-- `supabase_realtime` publication. Without this, clients can subscribe to a
-- channel but never receive INSERT/UPDATE/DELETE events, so edits and
-- completions made by one collaborator don't propagate to others live.
ALTER PUBLICATION supabase_realtime ADD TABLE items;

-- REPLICA IDENTITY FULL makes the WAL include the full old row on UPDATE/DELETE.
-- This is required for row-level filters (e.g. `list_id=eq.<id>`) to match on
-- DELETE events — otherwise only the primary key is emitted and the client's
-- filtered subscription drops the delete.
ALTER TABLE items REPLICA IDENTITY FULL;
