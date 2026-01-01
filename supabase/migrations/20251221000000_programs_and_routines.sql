-- PROGRAMS
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT programs_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX idx_programs_user_id ON programs(user_id);
CREATE INDEX idx_programs_deleted_at ON programs(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own programs"
    ON programs
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can create their own programs"
    ON programs
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own programs"
    ON programs
    FOR UPDATE
    USING (
        auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE TRIGGER update_programs_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_programs_user_id
    BEFORE INSERT ON programs
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_from_auth();

-- ROUTINES
CREATE TABLE routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    position TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT routines_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_program_id ON routines(program_id);
CREATE INDEX idx_routines_program_position ON routines(program_id, position);
CREATE INDEX idx_routines_deleted_at ON routines(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own routines"
    ON routines
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can create their own routines"
    ON routines
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own routines"
    ON routines
    FOR UPDATE
    USING (
        auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE TRIGGER update_routines_updated_at
    BEFORE UPDATE ON routines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_routines_user_id
    BEFORE INSERT ON routines
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_from_auth();

-- ROUTINE EXERCISE TYPES (ordered association)
CREATE TABLE routine_exercise_types (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE RESTRICT,
    exercise_type_id UUID NOT NULL REFERENCES exercise_types(id) ON DELETE RESTRICT,
    position TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- no soft delete

    PRIMARY KEY(routine_id, exercise_type_id)
);

CREATE INDEX idx_routine_exercise_types_user_id ON routine_exercise_types(user_id);
CREATE INDEX idx_routine_exercise_types_routine_id ON routine_exercise_types(routine_id);
CREATE INDEX idx_routine_exercise_types_routine_position ON routine_exercise_types(routine_id, position);

ALTER TABLE routine_exercise_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own routine exercise types"
    ON routine_exercise_types
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can create their own routine exercise types"
    ON routine_exercise_types
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own routine exercise types"
    ON routine_exercise_types
    FOR UPDATE
    USING (
        auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() = user_id
    );

-- We don't use soft delete for association tables
CREATE POLICY "Users can delete their own routine exercise types"
    ON routine_exercise_types
    FOR DELETE
    USING (
        auth.uid() = user_id
    );

CREATE TRIGGER update_routine_exercise_types_updated_at
    BEFORE UPDATE ON routine_exercise_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_routine_exercise_types_user_id
    BEFORE INSERT ON routine_exercise_types
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_from_auth();
