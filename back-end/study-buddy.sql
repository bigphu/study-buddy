-- =======================================================
-- 1. DATABASE SETUP & SCHEMA
-- =======================================================
DROP DATABASE IF EXISTS `cnpm`;
CREATE DATABASE `cnpm`;
USE `cnpm`;

-- 1.1 Users Table
CREATE TABLE `Users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE,
    `password` VARCHAR(255), 
    `role` ENUM('Student', 'Tutor', 'Admin') DEFAULT 'Student',     
    `full_name` VARCHAR(100),
    `academic_status` ENUM('Student', 'Bachelor', 'Master', 'PhD', 'Professor', 'Assoc. Prof') DEFAULT 'Student',
    `bio` TEXT              
);

-- 1.2 Courses Table
CREATE TABLE `Courses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tutor_id` INT,         
    `course_code` VARCHAR(20) UNIQUE, -- Changed to VARCHAR based on data (e.g. 'CO2039')
    `title` VARCHAR(255),
    `description` TEXT,
    `status` ENUM('Processing', 'Ongoing', 'Ended') DEFAULT 'Processing',
    FOREIGN KEY (`tutor_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE
);

-- 1.3 Enrollments Table
CREATE TABLE `Enrollments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT,
    `course_id` INT,
    FOREIGN KEY (`student_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`course_id`) REFERENCES `Courses`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_enrollment` (`student_id`, `course_id`)
);

-- 1.4 Sessions Table
CREATE TABLE `Sessions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_id` INT,
    `tutor_id` INT,
    `start_time` DATETIME,
    `end_time` DATETIME,
    `title` VARCHAR(255),
    `link` VARCHAR(255),
    `session_type` ENUM('Meeting', 'Quiz', 'Form', 'Document') DEFAULT 'Meeting',
    `assign_mode` ENUM('Manual', 'Auto_All') DEFAULT 'Manual',
    FOREIGN KEY (`course_id`) REFERENCES `Courses` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tutor_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE
);

-- 1.5 Bookings Table
CREATE TABLE `Bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `session_id` INT NOT NULL,
    `booking_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`session_id`) REFERENCES `Sessions`(`id`) ON DELETE CASCADE,
    CONSTRAINT `unique_student_booking` UNIQUE (`student_id`, `session_id`)
);

-- =======================================================
-- 2. TRIGGERS (SAFETY CHECKS)
-- =======================================================
DELIMITER $$

-- Check End Time > Start Time
DROP TRIGGER IF EXISTS `check_session_time_insert` $$
CREATE TRIGGER `check_session_time_insert` BEFORE INSERT ON `Sessions`
FOR EACH ROW BEGIN
    IF NEW.end_time <= NEW.start_time THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'End time must be after Start time'; END IF;
END $$

-- Check Tutor Availability (Overlap)
DROP TRIGGER IF EXISTS `check_tutor_overlap_insert` $$
CREATE TRIGGER `check_tutor_overlap_insert` BEFORE INSERT ON `Sessions`
FOR EACH ROW BEGIN
    IF EXISTS (SELECT 1 FROM `Sessions` WHERE `tutor_id` = NEW.tutor_id AND (NEW.start_time < `end_time` AND NEW.end_time > `start_time`)) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tutor has a conflicting session';
    END IF;
END $$

-- Check Student Enrollment before Booking
DROP TRIGGER IF EXISTS `check_enrollment_before_booking` $$
CREATE TRIGGER `check_enrollment_before_booking` BEFORE INSERT ON `Bookings`
FOR EACH ROW BEGIN
    DECLARE v_course_id INT;
    SELECT `course_id` INTO v_course_id FROM `Sessions` WHERE `id` = NEW.session_id;
    IF NOT EXISTS (SELECT 1 FROM `Enrollments` WHERE `student_id` = NEW.student_id AND `course_id` = v_course_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student is not enrolled in this course';
    END IF;
END $$

DROP TRIGGER IF EXISTS `check_student_overlap_booking` $$
CREATE TRIGGER `check_student_overlap_booking` BEFORE INSERT ON `Bookings`
FOR EACH ROW BEGIN
    DECLARE v_new_start DATETIME;
    DECLARE v_new_end DATETIME;
    DECLARE v_new_type VARCHAR(20);

    -- 1. Get start time, end time, AND TYPE of the session being booked
    SELECT `start_time`, `end_time`, `session_type` 
    INTO v_new_start, v_new_end, v_new_type
    FROM `Sessions`
    WHERE `id` = NEW.session_id;

    -- 2. LOGIC: Only proceed if the NEW session is a "Meeting"
    IF v_new_type = 'Meeting' THEN
    
        -- 3. Check for overlap against existing bookings that are ALSO "Meetings"
        IF EXISTS (
            SELECT 1
            FROM `Bookings` b
            JOIN `Sessions` s ON b.session_id = s.id
            WHERE b.student_id = NEW.student_id 
            AND s.id != NEW.session_id      -- Safety check
            AND s.session_type = 'Meeting'  -- Strict: Only clash if existing is also a Meeting
            AND s.start_time IS NOT NULL    -- Ignore undefined times
            AND (v_new_start < s.end_time AND v_new_end > s.start_time) -- Overlap Formula
        ) THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Conflict: You already have another live Meeting scheduled at this time.';
        END IF;
        
    END IF;
END $$

DELIMITER ;

-- =======================================================
-- 3. STORED PROCEDURES (OPTIMIZED FOR BACKEND)
-- =======================================================
DELIMITER $$

-- 3.1 Auth
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

-- 3.2 Profile & Dashboard
DROP PROCEDURE IF EXISTS `sp_get_user_profile` $$

CREATE PROCEDURE `sp_get_user_profile`(
    IN p_user_id INT,               -- Requesting user's ID (kept for consistency)
    IN p_role VARCHAR(20),          -- Requesting user's Role (kept for consistency)
    IN p_target_username VARCHAR(50) -- CHANGED: Now takes username string
)
BEGIN
    DECLARE v_c_count INT DEFAULT 0;
    DECLARE v_s_count INT DEFAULT 0;
    DECLARE v_target_role VARCHAR(20);
    DECLARE v_target_id INT; -- Variable to hold the converted ID

    -- 1. Get the ID and Role based on the provided Username
    SELECT `id`, `role` INTO v_target_id, v_target_role 
    FROM `Users` 
    WHERE `username` = p_target_username;
    
    -- 2. Check logic based on the retrieved ID
    IF v_target_id IS NOT NULL THEN
        IF v_target_role = 'Tutor' THEN
            -- Count courses taught and sessions hosted
            SELECT COUNT(*) INTO v_c_count FROM `Courses` WHERE `tutor_id` = v_target_id;
            SELECT COUNT(*) INTO v_s_count FROM `Sessions` WHERE `tutor_id` = v_target_id;
        ELSE
            -- Count courses enrolled and sessions booked
            SELECT COUNT(*) INTO v_c_count FROM `Enrollments` WHERE `student_id` = v_target_id;
            SELECT COUNT(*) INTO v_s_count FROM `Bookings` WHERE `student_id` = v_target_id;
        END IF;

        -- 3. Return the result
        SELECT 
            id, 
            username, 
            role, 
            full_name, 
            academic_status, 
            bio, 
            v_c_count AS stat_courses, 
            v_s_count AS stat_sessions 
        FROM `Users` 
        WHERE id = v_target_id;
    END IF;
END $$

DROP PROCEDURE IF EXISTS `sp_get_all_user_sessions` $$
CREATE PROCEDURE `sp_get_all_user_sessions`(
    IN p_user_id INT, 
    IN p_role VARCHAR(20)
)
BEGIN
    IF p_role = 'Student' THEN
        SELECT s.id, s.title, s.start_time, end_time, s.link, s.session_type, c.course_code, u.full_name AS member_name
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

-- 3.3 Courses & Discovery
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

-- 1. Get Courses Student is NOT enrolled in (For Discovery)
DROP PROCEDURE IF EXISTS `sp_get_available_courses` $$
CREATE PROCEDURE `sp_get_available_courses`(
    IN p_user_id INT, 
    IN p_role VARCHAR(20)
)
BEGIN
    -- Only relevant if user is a Student
    IF p_role = 'Student' THEN
        SELECT 
            c.id, 
            c.course_code, 
            c.title, 
            c.description, 
            c.status, 
            u.full_name AS member_name
        FROM `Courses` c
        JOIN `Users` u ON c.tutor_id = u.id
        WHERE c.id NOT IN (
            SELECT course_id FROM `Enrollments` WHERE student_id = p_user_id
        )
        AND c.status <> 'Ended'; -- Optional: Hide ended courses
    ELSE
        -- If Tutor/Admin, maybe show all courses? Or empty.
        -- Let's return all courses for now.
        SELECT 
            c.id, c.course_code, c.title, c.description, c.status, u.full_name AS member_name
        FROM `Courses` c
        JOIN `Users` u ON c.tutor_id = u.id;
    END IF;
END $$

-- 2. Get All Tutors (For CardUser display)
DROP PROCEDURE IF EXISTS `sp_get_all_tutors` $$
CREATE PROCEDURE `sp_get_all_tutors`()
BEGIN
    SELECT 
        id, 
        username, 
        full_name, 
        academic_status, 
        bio 
    FROM `Users` 
    WHERE `role` = 'Tutor';
END $$

-- 3.4 Sessions (Specific Course)
DROP PROCEDURE IF EXISTS `sp_get_sessions_by_course` $$
CREATE PROCEDURE `sp_get_sessions_by_course`(IN p_user_id INT, IN p_role VARCHAR(20), IN p_course_code VARCHAR(20))
BEGIN
    DECLARE v_cid INT;
    SELECT id INTO v_cid FROM Courses WHERE course_code = p_course_code;
    
    -- For this specific page, we return ALL sessions if student is enrolled, 
    -- but we can filter by booking if required. 
    -- Current logic: Show all available sessions in the course (MyLinks page)
    SELECT s.id, s.course_id, s.title, c.course_code, s.start_time, s.end_time, s.link, s.session_type, u.full_name AS member_name
    FROM `Sessions` s
    JOIN `Users` u ON s.tutor_id = u.id
    JOIN `Courses` c ON s.course_id = c.id
    WHERE s.course_id = v_cid
    ORDER BY s.start_time ASC;
END $$

DELIMITER $$

-- =======================================================
-- 3.5 Student Enrollment
-- Query: CALL sp_enroll_student(req.user.id, req.user.role, courseCode)
-- =======================================================
DROP PROCEDURE IF EXISTS `sp_enroll_student` $$
CREATE PROCEDURE `sp_enroll_student`(
    IN p_user_id INT, 
    IN p_role VARCHAR(20), 
    IN p_course_code VARCHAR(20)
)
BEGIN
    DECLARE v_course_id INT;

    -- 1. Security Check: Only Students can enroll
    IF p_role <> 'Student' THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Access Denied: Only students can enroll in courses.'; 
    END IF;

    -- 2. Find Course ID
    SELECT `id` INTO v_course_id FROM `Courses` WHERE `course_code` = p_course_code;
    
    IF v_course_id IS NULL THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Course not found.'; 
    END IF;

    -- 3. Check Duplicate Enrollment
    IF EXISTS (SELECT 1 FROM `Enrollments` WHERE `student_id` = p_user_id AND `course_id` = v_course_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You are already enrolled in this course.';
    END IF;

    -- 4. Insert Enrollment
    INSERT INTO `Enrollments` (`student_id`, `course_id`) 
    VALUES (p_user_id, v_course_id);

    -- Return success message or ID
    SELECT LAST_INSERT_ID() AS enrollment_id, 'Enrollment Successful' as message;
END $$


-- =======================================================
-- 3.6 Create Session
-- Query: CALL sp_create_session(id, role, code, start, end, title, link, type, assignMode)
-- =======================================================
DROP PROCEDURE IF EXISTS `sp_create_session` $$
CREATE PROCEDURE `sp_create_session`(
    IN p_user_id INT,
    IN p_role VARCHAR(20),
    IN p_course_code VARCHAR(20),
    IN p_start_time DATETIME,
    IN p_end_time DATETIME,
    IN p_title VARCHAR(255),
    IN p_link VARCHAR(255),
    IN p_type VARCHAR(20),      -- 'Meeting', 'Quiz', etc.
    IN p_assign_mode VARCHAR(20) -- 'Manual' or 'Auto_All'
)
BEGIN
    DECLARE v_course_id INT;
    DECLARE v_session_id INT;

    -- 1. Security Check: Only Tutors (or Admin) can create sessions
    IF p_role <> 'Tutor' AND p_role <> 'Admin' THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Access Denied: Only tutors can create sessions.'; 
    END IF;

    -- 2. Verify Course Ownership
    -- Ensure the course exists AND belongs to this specific Tutor
    SELECT `id` INTO v_course_id 
    FROM `Courses` 
    WHERE `course_code` = p_course_code AND `tutor_id` = p_user_id;

    IF v_course_id IS NULL THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Course not found or you are not the tutor for this course.'; 
    END IF;

    -- 3. Insert Session
    -- (Triggers check_session_time_insert and check_tutor_overlap_insert will fire here automatically)
    IF p_session_type = 'Document' THEN
        SET p_start_time = NULL;
        SET p_end_time = NULL;
    END IF;
    
    INSERT INTO `Sessions` (`course_id`, `tutor_id`, `start_time`, `end_time`, `title`, `link`, `session_type`, `assign_mode`)
    VALUES (v_course_id, p_user_id, p_start_time, p_end_time, p_title, p_link, p_type, p_assign_mode);

    SET v_session_id = LAST_INSERT_ID();

    -- 4. Handle "Auto_All" Logic
    -- If assign_mode is Auto_All, automatically book this session for ALL currently enrolled students
    IF p_assign_mode = 'Auto_All' THEN
        INSERT INTO `Bookings` (`student_id`, `session_id`)
        SELECT `student_id`, v_session_id
        FROM `Enrollments`
        WHERE `course_id` = v_course_id;
    END IF;

    SELECT v_session_id AS new_session_id, 'Session Created' as message;
END $$


-- =======================================================
-- 3.7 Book Session (Student)
-- Query: CALL sp_book_session(req.user.id, req.user.role, sessionId)
-- =======================================================
DROP PROCEDURE IF EXISTS `sp_book_session` $$
CREATE PROCEDURE `sp_book_session`(
    IN p_user_id INT,
    IN p_role VARCHAR(20),
    IN p_session_id INT
)
BEGIN
    -- 1. Security Check: Only Students book
    IF p_role <> 'Student' THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Access Denied: Only students can book sessions.'; 
    END IF;

    -- 2. Check if already booked
    IF EXISTS (SELECT 1 FROM `Bookings` WHERE `student_id` = p_user_id AND `session_id` = p_session_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You have already booked this session.';
    END IF;

    -- 3. Insert Booking
    -- (Trigger check_enrollment_before_booking will fire here to ensure they are enrolled in the course)
    INSERT INTO `Bookings` (`student_id`, `session_id`)
    VALUES (p_user_id, p_session_id);

    SELECT LAST_INSERT_ID() AS booking_id, 'Booking Successful' as message;
END $$

DELIMITER ;

-- =======================================================
-- 4. DATA SEEDING
-- =======================================================

-- Users
INSERT INTO `Users` (`id`, `username`, `password`, `role`, `full_name`, `academic_status`, `bio`) VALUES
(1, 'tutor_khoa', '1', 'Tutor', 'TS. Nguyễn Anh Khoa', 'PhD', 'Introduction to Programming & Data Structures'),
(2, 'tutor_hai', '1', 'Tutor', 'ThS. Phạm Thanh Hải', 'Master', 'Operating Systems'),
(3, 'tutor_quan', '1', 'Tutor', 'PGS.TS Trần Minh Quân', 'Assoc. Prof', 'Artificial Intelligence Expert'),
(4, 'tutor_lan', '1', 'Tutor', 'ThS. Lê Thị Lan', 'Master', 'Database & Web Development'),
(5, 'sv_nam', '1', 'Student', 'Trần Văn Nam', 'Student', NULL),
(6, 'sv_hung', '1', 'Student', 'Lê Quốc Hưng', 'Student', NULL);

-- 4.2 Courses
-- IDs here must match the course_id in your mockup
INSERT INTO `Courses` (`id`, `tutor_id`, `course_code`, `title`, `description`, `status`) VALUES
(1, 1, 'CO1005', 'Nhập môn Lập trình', 'Introduction to Programming', 'Ongoing'),
(2, 1, 'CO2003', 'Cấu trúc Dữ liệu & Giải thuật', 'Data Structures and Algorithms', 'Ongoing'),
(4, 3, 'CO3001', 'Trí tuệ Nhân tạo', 'Artificial Intelligence', 'Ongoing'),
(6, 4, 'CO2013', 'Hệ Cơ sở dữ liệu', 'Database Systems', 'Ongoing'),
(7, 4, 'CO3049', 'Lập trình Web', 'Web Programming', 'Ongoing');

-- 4.3 Enrollments
-- Enrolling Student "sv_hung" (id=6) into these courses so they appear in dashboard
INSERT INTO `Enrollments` (`student_id`, `course_id`) VALUES
(6, 1), (6, 2), (6, 4), (6, 6), (6, 7);

-- 4.4 Sessions (Your Mockup Data)
-- Explicitly setting IDs to match your JSON
INSERT INTO `Sessions` (`id`, `course_id`, `tutor_id`, `start_time`, `end_time`, `link`, `title`, `session_type`) VALUES
-- 1. Nhập môn Lập trình
(1, 1, 1, NULL, NULL, 'meet.google.com/co1005-01', 'CO1005 - Nhập môn Lập trình', 'Meeting'), 
(2, 1, 1, '2025-12-06 07:00:00', '2025-12-06 10:00:00', 'meet.google.com/co1005-02', 'CO1005 - Nhập môn Lập trình', 'Meeting'),

-- 2. Cấu trúc dữ liệu
(4, 2, 1, '2025-12-08 09:00:00', '2025-12-08 11:30:00', 'meet.google.com/dsa-01', 'CO2003 - Cấu trúc Dữ liệu (Midterm Quiz)', 'Quiz'),
(5, 2, 1, '2025-12-09 09:00:00', '2025-12-09 11:30:00', 'meet.google.com/dsa-02', 'CO2003 - Cấu trúc Dữ liệu & Giải thuật', 'Meeting'),

-- 6. Cơ sở dữ liệu
(16, 6, 4, '2025-12-11 14:00:00', '2025-12-11 17:00:00', 'teams.microsoft.com/db-01', 'CO2013 - Hệ Cơ sở dữ liệu (Reading Material)', 'Document'),

-- 7. Lập trình Web
(19, 7, 4, '2025-12-07 11:00:00', '2025-12-07 21:00:00', 'teams.microsoft.com/web-01', 'CO3049 - Lập trình Web (Course Survey)', 'Form'),

-- 4. Trí tuệ nhân tạo
(10, 4, 3, '2025-12-10 13:00:00', '2025-12-20 16:00:00', 'zoom.us/ai-01', 'CO3001 - Trí tuệ Nhân tạo (AI)', 'Meeting');

-- 4.5 Bookings
-- Automatically "Book" these sessions for student sv_hung (id=6)
-- so the SQL query returns them immediately.
INSERT INTO `Bookings` (`student_id`, `session_id`) VALUES
(6, 2), (6, 4), (6, 5), (6, 16), (6, 19), (6, 10);