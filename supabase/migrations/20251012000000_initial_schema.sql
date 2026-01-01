CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- COMMON
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_user_id_from_auth()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- EXERCISE TYPES
CREATE TABLE exercise_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT exercise_types_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX idx_exercise_types_user_id ON exercise_types(user_id);
CREATE INDEX idx_exercise_types_deleted_at ON exercise_types(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE exercise_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exercise types"
    ON exercise_types
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can create their own exercise types"
    ON exercise_types
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own exercise types"
    ON exercise_types
    FOR UPDATE
    USING (
        auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE TRIGGER update_exercise_types_updated_at
    BEFORE UPDATE ON exercise_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_exercise_types_user_id
    BEFORE INSERT ON exercise_types
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_from_auth();

-- EXERCISES
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_type_id UUID NOT NULL REFERENCES exercise_types(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    machine_brand TEXT DEFAULT NULL,
    target_rep_range_min INTEGER DEFAULT NULL,
    target_rep_range_max INTEGER DEFAULT NULL,
    target_reps_in_reserve INTEGER DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT exercises_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT exercises_rep_range_valid CHECK (
        (target_rep_range_min IS NULL AND target_rep_range_max IS NULL) OR
        (target_rep_range_min IS NOT NULL AND target_rep_range_max IS NOT NULL AND target_rep_range_min <= target_rep_range_max)
    ),
    CONSTRAINT exercises_rep_range_positive CHECK (
        (target_rep_range_min IS NULL OR target_rep_range_min > 0) AND
        (target_rep_range_max IS NULL OR target_rep_range_max > 0)
    ),
    CONSTRAINT exercises_reps_in_reserve_valid CHECK (
        target_reps_in_reserve IS NULL OR target_reps_in_reserve >= 0
    )
);

CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_exercises_exercise_type_id ON exercises(exercise_type_id);
CREATE INDEX idx_exercises_deleted_at ON exercises(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exercises"
    ON exercises
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can create their own exercises"
    ON exercises
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own exercises"
    ON exercises
    FOR UPDATE
    USING (
        auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_exercises_user_id
    BEFORE INSERT ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_from_auth();
