ALTER TABLE workouts
    ADD CONSTRAINT workouts_completed_at_required_when_completed
    CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR
        (status != 'completed')
    );
