-- EXERCISE GYMS
CREATE TABLE exercise_gyms (
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- no soft delete
    PRIMARY KEY(exercise_id, gym_id)
);

CREATE INDEX idx_exercise_gyms_user_id ON exercise_gyms(user_id);
CREATE INDEX idx_exercise_gyms_exercise_id ON exercise_gyms(exercise_id);
CREATE INDEX idx_exercise_gyms_gym_id ON exercise_gyms(gym_id);

ALTER TABLE exercise_gyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exercise gyms"
    ON exercise_gyms
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can insert their own exercise gyms"
    ON exercise_gyms
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

-- We don't use soft delete for association tables
CREATE POLICY "Users can delete their own exercise gyms"
    ON exercise_gyms
    FOR DELETE
    USING (
        auth.uid() = user_id
    );

CREATE TRIGGER set_exercise_gyms_user_id
    BEFORE INSERT ON exercise_gyms
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_from_auth();
