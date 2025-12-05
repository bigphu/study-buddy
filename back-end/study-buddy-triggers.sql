USE `cnpm`;

DELIMITER $$

-- 2.1 Check End Time > Start Time
DROP TRIGGER IF EXISTS `check_session_time_insert` $$
CREATE TRIGGER `check_session_time_insert` BEFORE INSERT ON `Sessions`
FOR EACH ROW BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        IF NEW.end_time <= NEW.start_time THEN 
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'End time must be after Start time'; 
        END IF;
    END IF;
END $$

-- 2.2 Check Tutor Availability (Overlap)
DROP TRIGGER IF EXISTS `check_tutor_overlap_insert` $$
CREATE TRIGGER `check_tutor_overlap_insert` BEFORE INSERT ON `Sessions`
FOR EACH ROW BEGIN
    -- ONLY check for overlap if the new session actually has time values
    IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
        
        IF EXISTS (
            SELECT 1 
            FROM `Sessions` 
            WHERE `tutor_id` = NEW.tutor_id 
            AND `start_time` IS NOT NULL
            AND `end_time` IS NOT NULL
            AND (NEW.start_time < `end_time` AND NEW.end_time > `start_time`)
        ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tutor has a conflicting session';
        END IF;

    END IF;
END $$

-- 2.3 Check Student Enrollment before Booking
DROP TRIGGER IF EXISTS `check_enrollment_before_booking` $$
CREATE TRIGGER `check_enrollment_before_booking` BEFORE INSERT ON `Bookings`
FOR EACH ROW BEGIN
    DECLARE v_course_id INT;
    SELECT `course_id` INTO v_course_id FROM `Sessions` WHERE `id` = NEW.session_id;
    IF NOT EXISTS (SELECT 1 FROM `Enrollments` WHERE `student_id` = NEW.student_id AND `course_id` = v_course_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student is not enrolled in this course';
    END IF;
END $$

-- 2.4 Check Student Booking Overlap (Meetings only)
DROP TRIGGER IF EXISTS `check_student_overlap_booking` $$
CREATE TRIGGER `check_student_overlap_booking` BEFORE INSERT ON `Bookings`
FOR EACH ROW BEGIN
    DECLARE v_new_start DATETIME;
    DECLARE v_new_end DATETIME;
    DECLARE v_new_type VARCHAR(20);

    SELECT `start_time`, `end_time`, `session_type` 
    INTO v_new_start, v_new_end, v_new_type
    FROM `Sessions`
    WHERE `id` = NEW.session_id;

    IF v_new_type = 'Meeting' THEN
        IF EXISTS (
            SELECT 1
            FROM `Bookings` b
            JOIN `Sessions` s ON b.session_id = s.id
            WHERE b.student_id = NEW.student_id 
            AND s.id != NEW.session_id
            AND s.session_type = 'Meeting'
            AND s.start_time IS NOT NULL
            AND (v_new_start < s.end_time AND v_new_end > s.start_time)
        ) THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Conflict: You already have another live Meeting scheduled at this time.';
        END IF;
    END IF;
END $$

-- 2.5 Check Session Update Overlap (Meetings only)
DROP TRIGGER IF EXISTS `check_session_update_logic` $$
CREATE TRIGGER `check_session_update_logic` BEFORE UPDATE ON `Sessions`
FOR EACH ROW BEGIN
    -- 1. Validity Check: End Time must be after Start Time
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        IF NEW.end_time <= NEW.start_time THEN 
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'End time must be after Start time'; 
        END IF;
    END IF;

    -- 2. Conflict Check: Ensure no overlap with OTHER sessions for this Tutor
    -- Only runs if the session type is time-bound (not Document) and times are provided
    IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 
            FROM `Sessions` 
            WHERE `tutor_id` = NEW.tutor_id 
            AND `id` != NEW.id  -- CRITICAL: Exclude the session currently being edited
            AND `start_time` IS NOT NULL 
            AND (NEW.start_time < `end_time` AND NEW.end_time > `start_time`)
        ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Update Failed: Tutor has a conflicting session during this time slot.';
        END IF;
    END IF;
END $$

DELIMITER ;