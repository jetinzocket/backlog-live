-- Migration: Add provenance columns to backlog_items
-- Run in Supabase SQL editor

ALTER TABLE backlog_items
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS requested_by TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS requested_at DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS request_context TEXT DEFAULT NULL;

-- Optional index for filtering by source
CREATE INDEX IF NOT EXISTS idx_backlog_items_source ON backlog_items(source);

-- Update existing items that came from Linear to mark them as linear source
UPDATE backlog_items
SET source = 'linear'
WHERE linear_id IS NOT NULL AND source IS NULL;
