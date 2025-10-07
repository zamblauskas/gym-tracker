-- Add status and exercise_selections columns to workout_sessions table
-- Migration for persistent active workout sessions feature

-- Add status column with default value
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed'
CHECK (status IN ('in-progress', 'completed', 'skipped'));

-- Add exercise_selections column for storing exercise selections per exercise type index
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS exercise_selections JSONB DEFAULT '{}'::jsonb;

-- Create index for querying in-progress sessions
CREATE INDEX IF NOT EXISTS idx_workout_sessions_status ON workout_sessions(status);

-- Migrate existing data: set status based on endTime and duration
UPDATE workout_sessions
SET status = CASE
  WHEN end_time IS NULL THEN 'in-progress'
  WHEN duration = 0 AND total_volume = 0 THEN 'skipped'
  ELSE 'completed'
END
WHERE status = 'completed'; -- Only update rows that still have the default value
