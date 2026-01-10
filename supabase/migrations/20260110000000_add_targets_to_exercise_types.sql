ALTER TABLE exercise_types
    ADD COLUMN target_rep_range_min INTEGER DEFAULT NULL;

ALTER TABLE exercise_types
    ADD COLUMN target_rep_range_max INTEGER DEFAULT NULL;

ALTER TABLE exercise_types
    ADD COLUMN target_reps_in_reserve INTEGER DEFAULT NULL;
