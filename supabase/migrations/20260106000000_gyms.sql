-- GYMS
CREATE TABLE gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT gyms_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX idx_gyms_user_id ON gyms(user_id);
CREATE INDEX idx_gyms_deleted_at ON gyms(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gyms"
    ON gyms
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can insert their own gyms"
    ON gyms
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own gyms"
    ON gyms
    FOR UPDATE
    USING (
        auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE TRIGGER update_gyms_updated_at
    BEFORE UPDATE ON gyms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_gyms_user_id
    BEFORE INSERT ON gyms
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_from_auth();
