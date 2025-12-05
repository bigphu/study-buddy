USE `cnpm`;

DELIMITER $$

-- =======================================================
-- 3.1 AUTHENTICATION
-- =======================================================
DROP PROCEDURE IF EXISTS `sp_register_user` $$
CREATE PROCEDURE `sp_register_user`(IN p_username VARCHAR(50), IN p_password VARCHAR(255), IN p_role VARCHAR(20), IN p_full_name VARCHAR(100), IN p_academic_status VARCHAR(20), IN p_bio TEXT)
BEGIN
    IF EXISTS (SELECT 1 FROM `Users` WHERE `username` = p_username) THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username taken'; END IF;
    INSERT INTO `Users` (`username`, `password`, `role`, `full_name`, `academic_status`, `bio`) VALUES (p_username, p_password, p_role, p_full_name, p_academic_status, p_bio);
    SELECT LAST_INSERT_ID() as new_id;
END $$

DROP PROCEDURE IF EXISTS `sp_login_user` $$
CREATE PROCEDURE `sp_login_user`(IN p_username VARCHAR(50), IN p_password VARCHAR(255))
BEGIN
    SELECT `id`, `username`, `role`, `full_name`, `academic_status`, `bio` FROM `Users` WHERE `username` = p_username AND `password` = p_password;
END $$

-- =======================================================
-- 3.2 PROFILE & DASHBOARD
-- =======================================================
DROP PROCEDURE IF EXISTS `sp_get_user_profile` $$
CREATE PROCEDURE `sp_get_user_profile`(IN p_user_id INT, IN p_role VARCHAR(20), IN p_target_username VARCHAR(50))
BEGIN
    DECLARE v_c_count INT DEFAULT 0;
    DECLARE v_s_count INT DEFAULT 0;
    DECLARE v_target_role VARCHAR(20);
    DECLARE v_target_id INT; 

    SELECT `id`, `role` INTO v_target_id, v_target_role FROM `Users` WHERE `username` = p_target_username;
    
    IF v_target_id IS NOT NULL THEN
        IF v_target_role = 'Tutor' THEN
            SELECT COUNT(*) INTO v_c_count FROM `Courses` WHERE `tutor_id` = v_target_id;
            SELECT COUNT(*) INTO v_s_count FROM `Sessions` WHERE `tutor_id` = v_target_id;
        ELSE
            SELECT COUNT(*) INTO v_c_count FROM `Enrollments` WHERE `student_id` = v_target_id;
            SELECT COUNT(*) INTO v_s_count FROM `Bookings` WHERE `student_id` = v_target_id;
        END IF;

        SELECT id, username, role, full_name, academic_status, bio, v_c_count AS stat_courses, v_s_count AS stat_sessions 
        FROM `Users` WHERE id = v_target_id;
    END IF;
END $$

DROP PROCEDURE IF EXISTS `sp_get_all_user_sessions` $$
CREATE PROCEDURE `sp_get_all_user_sessions`(IN p_user_id INT, IN p_role VARCHAR(20))
BEGIN
    IF p_role = 'Student' THEN
        SELECT s.id, s.title, s.start_time, s.end_time, s.link, s.session_type, c.course_code, u.full_name AS member_name
        FROM `Bookings` b
        JOIN `Sessions` s ON b.session_id = s.id
        JOIN `Courses` c ON s.course_id = c.id
        JOIN `Users` u ON c.tutor_id = u.id
        WHERE b.student_id = p_user_id
        ORDER BY s.start_time ASC;
    ELSE
        SELECT s.id, s.title, s.start_time, end_time, s.link, s.session_type, c.course_code, u.full_name AS member_name
        FROM `Sessions` s
        JOIN `Courses` c ON s.course_id = c.id
        JOIN `Users` u ON c.tutor_id = u.id
        WHERE s.tutor_id = p_user_id
        ORDER BY s.start_time ASC;
    END IF;
END $$

-- =======================================================
-- 3.3 COURSES & DISCOVERY
-- =======================================================
DROP PROCEDURE IF EXISTS `sp_get_courses` $$
CREATE PROCEDURE `sp_get_courses`(IN p_user_id INT, IN p_role VARCHAR(20))
BEGIN
    IF p_role = 'Student' THEN
        SELECT c.id, c.course_code, c.title, c.description, c.status, u.full_name AS member_name
        FROM `Enrollments` e
        JOIN `Courses` c ON e.course_id = c.id
        JOIN `Users` u ON c.tutor_id = u.id
        WHERE e.student_id = p_user_id;
    ELSE
        SELECT c.id, c.course_code, c.title, c.description, c.status, u.full_name AS member_name
        FROM `Courses` c
        JOIN `Users` u ON c.tutor_id = u.id
        WHERE c.tutor_id = p_user_id;
    END IF;
END $$

DROP PROCEDURE IF EXISTS `sp_get_available_courses` $$
CREATE PROCEDURE `sp_get_available_courses`(IN p_user_id INT, IN p_role VARCHAR(20))
BEGIN
    IF p_role = 'Student' THEN
        SELECT c.id, c.course_code, c.title, c.description, c.status, u.full_name AS member_name
        FROM `Courses` c
        JOIN `Users` u ON c.tutor_id = u.id
        WHERE c.id NOT IN (SELECT course_id FROM `Enrollments` WHERE student_id = p_user_id)
        AND c.status <> 'Ended';
    ELSE
        SELECT c.id, c.course_code, c.title, c.description, c.status, u.full_name AS member_name
        FROM `Courses` c
        JOIN `Users` u ON c.tutor_id = u.id;
    END IF;
END $$

DROP PROCEDURE IF EXISTS `sp_get_all_tutors` $$
CREATE PROCEDURE `sp_get_all_tutors`()
BEGIN
    SELECT id, username, full_name, academic_status, bio FROM `Users` WHERE `role` = 'Tutor';
END $$

-- =======================================================
-- CREATE COURSE
-- Logic: 
-- 1. Only Tutors or Admins can create.
-- 2. Check if course_code is already taken.
-- 3. Insert and return new ID.
-- =======================================================
DROP PROCEDURE IF EXISTS `sp_create_course` $$
CREATE PROCEDURE `sp_create_course`(
    IN p_user_id INT, 
    IN p_role VARCHAR(20), 
    IN p_course_code VARCHAR(20), 
    IN p_title VARCHAR(255), 
    IN p_description TEXT
)
BEGIN
    -- 1. Permission Check
    IF p_role <> 'Tutor' AND p_role <> 'Admin' THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Access Denied: Only Tutors or Admins can create courses.'; 
    END IF;

    -- 2. Unique Code Check
    IF EXISTS (SELECT 1 FROM `Courses` WHERE `course_code` = p_course_code) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Course code already exists.';
    END IF;

    -- 3. Insert Course
    -- Note: 'status' defaults to 'Processing' per schema definition
    INSERT INTO `Courses` (`tutor_id`, `course_code`, `title`, `description`)
    VALUES (p_user_id, p_course_code, p_title, p_description);

    SELECT LAST_INSERT_ID() AS new_course_id, 'Course Created Successfully' AS message;
END $$

-- =======================================================
-- UPDATE COURSE
-- Logic:
-- 1. Find course by course_code.
-- 2. Check permissions (Admin OR Owner of the course).
-- 3. Update Title, Description, and Status.
-- =======================================================
DROP PROCEDURE IF EXISTS `sp_update_course` $$
CREATE PROCEDURE `sp_update_course`(
    IN p_requestor_id INT,        -- The user attempting the update
    IN p_target_course_code VARCHAR(20), -- The identifier
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_status VARCHAR(20)       -- 'Processing', 'Ongoing', 'Ended'
)
BEGIN
    DECLARE v_course_id INT;
    DECLARE v_owner_id INT;
    DECLARE v_user_role VARCHAR(20);

    -- 1. Get Requestor Role
    SELECT `role` INTO v_user_role FROM `Users` WHERE `id` = p_requestor_id;

    -- 2. Find Course ID and Owner based on Code
    SELECT `id`, `tutor_id` INTO v_course_id, v_owner_id 
    FROM `Courses` 
    WHERE `course_code` = p_target_course_code;

    -- 3. Check if Course Exists
    IF v_course_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Course not found.';
    END IF;

    -- 4. Check Permissions
    -- Allow if: (User is Admin) OR (User is the Tutor who owns this course)
    IF v_user_role = 'Admin' OR (v_user_role = 'Tutor' AND v_owner_id = p_requestor_id) THEN
        
        UPDATE `Courses`
        SET 
            `title` = p_title,
            `description` = p_description,
            `status` = p_status
        WHERE `id` = v_course_id;

        SELECT 'Course updated successfully' AS message;

    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Permission Denied: You do not own this course.';
    END IF;

END $$

-- =======================================================
-- 3.4 SESSIONS & TRANSACTIONS
-- =======================================================
DROP PROCEDURE IF EXISTS `sp_get_sessions_by_course` $$
CREATE PROCEDURE `sp_get_sessions_by_course`(
    IN p_user_id INT, 
    IN p_role VARCHAR(20), 
    IN p_course_code VARCHAR(20),
    IN p_view_mode VARCHAR(20) -- New Parameter: 'Booked' or 'Available'
)
BEGIN
    DECLARE v_cid INT;
    
    -- Get Course ID from the code
    SELECT id INTO v_cid FROM `Courses` WHERE `course_code` = p_course_code;

    -- LOGIC BRANCHING
    IF p_role = 'Student' THEN
        IF p_view_mode = 'Booked' THEN
            -- 1. STUDENT BOOKED: Inner Join with Bookings
            SELECT s.id, s.course_id, s.title, c.course_code, s.start_time, s.end_time, s.link, s.session_type, u.full_name AS member_name
            FROM `Sessions` s
            INNER JOIN `Bookings` b ON s.id = b.session_id
            JOIN `Users` u ON s.tutor_id = u.id
            JOIN `Courses` c ON s.course_id = c.id
            WHERE s.course_id = v_cid AND b.student_id = p_user_id
            ORDER BY s.start_time ASC;
        ELSE 
            -- 2. STUDENT AVAILABLE: Exclude sessions currently booked by this student
            SELECT s.id, s.course_id, s.title, c.course_code, s.start_time, s.end_time, s.link, s.session_type, u.full_name AS member_name
            FROM `Sessions` s
            JOIN `Users` u ON s.tutor_id = u.id
            JOIN `Courses` c ON s.course_id = c.id
            WHERE s.course_id = v_cid
            AND s.id NOT IN (SELECT session_id FROM `Bookings` WHERE student_id = p_user_id)
            ORDER BY s.start_time ASC;
        END IF;
        
    ELSE
        -- 3. TUTOR/ADMIN VIEW: Show all sessions regardless of view mode
        SELECT s.id, s.course_id, s.title, c.course_code, s.start_time, s.end_time, s.link, s.session_type, u.full_name AS member_name
        FROM `Sessions` s
        JOIN `Users` u ON s.tutor_id = u.id
        JOIN `Courses` c ON s.course_id = c.id
        WHERE s.course_id = v_cid
        ORDER BY s.start_time ASC;
    END IF;
END $$

DROP PROCEDURE IF EXISTS `sp_enroll_student` $$
CREATE PROCEDURE `sp_enroll_student`(IN p_user_id INT, IN p_role VARCHAR(20), IN p_course_code VARCHAR(20))
BEGIN
    DECLARE v_course_id INT;
    IF p_role <> 'Student' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Access Denied: Only students can enroll.'; END IF;
    SELECT `id` INTO v_course_id FROM `Courses` WHERE `course_code` = p_course_code;
    IF v_course_id IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Course not found.'; END IF;
    IF EXISTS (SELECT 1 FROM `Enrollments` WHERE `student_id` = p_user_id AND `course_id` = v_course_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You are already enrolled in this course.';
    END IF;
    INSERT INTO `Enrollments` (`student_id`, `course_id`) VALUES (p_user_id, v_course_id);
    SELECT LAST_INSERT_ID() AS enrollment_id, 'Enrollment Successful' as message;
END $$

DROP PROCEDURE IF EXISTS `sp_book_session` $$
CREATE PROCEDURE `sp_book_session`(IN p_user_id INT, IN p_role VARCHAR(20), IN p_session_id INT)
BEGIN
    IF p_role <> 'Student' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Access Denied'; END IF;
    IF EXISTS (SELECT 1 FROM `Bookings` WHERE `student_id` = p_user_id AND `session_id` = p_session_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You have already booked this session.';
    END IF;
    INSERT INTO `Bookings` (`student_id`, `session_id`) VALUES (p_user_id, p_session_id);
    SELECT LAST_INSERT_ID() AS booking_id, 'Booking Successful' as message;
END $$

DROP PROCEDURE IF EXISTS `sp_create_session` $$
CREATE PROCEDURE `sp_create_session`(
    IN p_user_id INT, 
    IN p_role VARCHAR(20), 
    IN p_course_code VARCHAR(20), 
    IN p_start_time DATETIME, 
    IN p_end_time DATETIME,
    IN p_title VARCHAR(255), 
    IN p_link VARCHAR(255), 
    IN p_type VARCHAR(20), 
    IN p_assign_mode VARCHAR(20)
)
BEGIN
    DECLARE v_course_id INT;
    DECLARE v_session_id INT;

    -- 1. Check User Role
    IF p_role <> 'Tutor' AND p_role <> 'Admin' THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Access Denied'; 
    END IF;

    -- 2. Validate Course Ownership
    SELECT `id` INTO v_course_id FROM `Courses` WHERE `course_code` = p_course_code AND `tutor_id` = p_user_id;
    IF v_course_id IS NULL THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Course not found or permission denied'; 
    END IF;

    -- 3. Enforce Time Logic based on Type
    IF p_type = 'Document' THEN
        -- If Document, force times to NULL
        SET p_start_time = NULL;
        SET p_end_time = NULL;
    ELSE
        -- If NOT Document, ensure times are provided
        IF p_start_time IS NULL OR p_end_time IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start time and End time are required for non-Document sessions.';
        END IF;
    END IF;
    
    -- 4. Insert the Session
    INSERT INTO `Sessions` (`course_id`, `tutor_id`, `start_time`, `end_time`, `title`, `link`, `session_type`, `assign_mode`)
    VALUES (v_course_id, p_user_id, p_start_time, p_end_time, p_title, p_link, p_type, p_assign_mode);

    SET v_session_id = LAST_INSERT_ID();

    -- 5. Handle Auto-Assign Logic
    IF p_assign_mode = 'Auto_All' THEN
        INSERT IGNORE INTO `Bookings` (`student_id`, `session_id`)
        SELECT `student_id`, v_session_id FROM `Enrollments` WHERE `course_id` = v_course_id;
    END IF;

    SELECT v_session_id AS new_session_id, 'Session Created' as message;
END $$

DROP PROCEDURE IF EXISTS `sp_update_session` $$

CREATE PROCEDURE `sp_update_session`(
    IN p_requestor_id INT,       -- The ID of the user trying to make the edit
    IN p_session_id INT,         -- The ID of the session to update
    IN p_title VARCHAR(255),
    IN p_session_type VARCHAR(50),
    IN p_link VARCHAR(255),      -- Renamed to match schema 'link'
    IN p_start_time DATETIME,
    IN p_end_time DATETIME
)
BEGIN
    DECLARE v_user_role VARCHAR(50);
    DECLARE v_owner_id INT;

    -- 1. Get the Role of the Requestor
    SELECT `role` INTO v_user_role FROM `Users` WHERE `id` = p_requestor_id;

    -- 2. Get the Owner of the Session (tutor_id)
    SELECT `tutor_id` INTO v_owner_id FROM `Sessions` WHERE `id` = p_session_id;

    -- 3. Check Permissions
    -- Allow if: (User is Admin) OR (User is Tutor AND they own the session)
    IF v_user_role = 'Admin' OR (v_user_role = 'Tutor' AND v_owner_id = p_requestor_id) THEN
        
        -- 4. Enforce Time Logic based on Type
        IF p_session_type = 'Document' THEN
            -- If Document, force times to NULL
            SET p_start_time = NULL;
            SET p_end_time = NULL;
        ELSE
            -- If NOT Document, ensure times are provided
            IF p_start_time IS NULL OR p_end_time IS NULL THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start time and End time are required for non-Document sessions.';
            END IF;
        END IF;

        -- 5. Perform the Update
        UPDATE `Sessions`
        SET 
            `title` = p_title,
            `session_type` = p_session_type,
            `link` = p_link,
            `start_time` = p_start_time,
            `end_time` = p_end_time
            -- Removed updated_at because it wasn't in your schema definition for Sessions
        WHERE `id` = p_session_id;

        SELECT 'Session updated successfully' AS message;

    ELSE
        -- Deny Access
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Permission Denied: Only Admins or the owning Tutor can edit this session.';
    END IF;

END $$
DELIMITER ;