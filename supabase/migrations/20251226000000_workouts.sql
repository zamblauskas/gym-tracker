-- WORKOUTS
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE RESTRICT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'in_progress',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT workouts_status_check CHECK (status IN ('in_progress', 'completed', 'cancelled'))
);

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_routine_id ON workouts(routine_id);
CREATE INDEX idx_workouts_deleted_at ON workouts(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workouts"
    ON workouts 
    FOR SELECT 
    USING (
      auth.uid() = user_id
    );

CREATE POLICY "Users can create their own workouts"
    ON workouts 
    FOR INSERT 
    WITH CHECK (
      auth.uid() = user_id
    );

CREATE POLICY "Users can update their own workouts"
    ON workouts 
    FOR UPDATE 
    USING (
      auth.uid() = user_id
    ) 
    WITH CHECK (
      auth.uid() = user_id
    );

CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_workouts_user_id
    BEFORE INSERT ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_from_auth();


-- WORKOUT EXERCISES (Logs)
CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_type_id UUID NOT NULL REFERENCES exercise_types(id) ON DELETE RESTRICT,
    exercise_id UUID REFERENCES exercises(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_workout_exercises_user_id ON workout_exercises(user_id);
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_exercise_type_id ON workout_exercises(exercise_type_id);
CREATE INDEX idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);
CREATE INDEX idx_workout_exercises_deleted_at ON workout_exercises(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workout exercises"
    ON workout_exercises
    FOR SELECT
    USING (
      auth.uid() = user_id
    );

CREATE POLICY "Users can create their own workout exercises"
    ON workout_exercises
    FOR INSERT
    WITH CHECK (
      auth.uid() = user_id
    );

CREATE POLICY "Users can update their own workout exercises"
    ON workout_exercises
    FOR UPDATE
    USING (
      auth.uid() = user_id
    )
    WITH CHECK (
      auth.uid() = user_id
    );

CREATE TRIGGER update_workout_exercises_updated_at
    BEFORE UPDATE ON workout_exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_workout_exercises_user_id
    BEFORE INSERT ON workout_exercises
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_from_auth();


-- WORKOUT SETS
CREATE TABLE workout_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    reps INTEGER NOT NULL,
    weight DECIMAL NOT NULL,
    reps_in_reserve INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT workout_sets_reps_check CHECK (reps > 0),
    CONSTRAINT workout_sets_weight_check CHECK (weight >= 0),
    CONSTRAINT workout_sets_rir_check CHECK (reps_in_reserve >= 0)
);

CREATE INDEX idx_workout_sets_user_id ON workout_sets(user_id);
CREATE INDEX idx_workout_sets_workout_exercise_id ON workout_sets(workout_exercise_id);
CREATE INDEX idx_workout_sets_deleted_at ON workout_sets(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workout sets"
    ON workout_sets 
    FOR SELECT
    USING (
      auth.uid() = user_id
    );

CREATE POLICY "Users can create their own workout sets"
    ON workout_sets
    FOR INSERT
    WITH CHECK (
      auth.uid() = user_id
    );

CREATE POLICY "Users can update their own workout sets"
    ON workout_sets
    FOR UPDATE
    USING (
      auth.uid() = user_id
    )
    WITH CHECK (
      auth.uid() = user_id
    );

CREATE TRIGGER update_workout_sets_updated_at
    BEFORE UPDATE ON workout_sets 
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_workout_sets_user_id
    BEFORE INSERT ON workout_sets
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_from_auth();
