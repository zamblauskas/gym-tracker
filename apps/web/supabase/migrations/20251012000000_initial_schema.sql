CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
        AND deleted_at IS NULL
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

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exercise_types_updated_at
    BEFORE UPDATE ON exercise_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();