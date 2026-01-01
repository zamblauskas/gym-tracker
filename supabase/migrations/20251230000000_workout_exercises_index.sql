ALTER TABLE workout_exercises
    ADD COLUMN index INTEGER NOT NULL DEFAULT 0;

ALTER TABLE workout_exercises
    ADD CONSTRAINT workout_exercises_index_check CHECK (index >= 0);

CREATE INDEX idx_workout_exercises_index ON workout_exercises(workout_id, index);
