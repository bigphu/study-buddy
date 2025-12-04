DROP DATABASE IF EXISTS `cnpm`;
CREATE DATABASE `cnpm`;
USE `cnpm`;

-- =======================================================
-- 1. XÓA BẢNG CŨ & TẠO LẠI
-- =======================================================
DROP TABLE IF EXISTS `Sessions`;
DROP TABLE IF EXISTS `Enrollments`;
DROP TABLE IF EXISTS `Courses`;
DROP TABLE IF EXISTS `Users`;

-- 1. Bảng User
CREATE TABLE `Users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50),
    `password` VARCHAR(255), 
    `role` VARCHAR(20),     
    `full_name` VARCHAR(100),
    `academic_status` ENUM('Member', 'Student', 'Bachelor', 'Master', 'PhD', 'Professor') DEFAULT 'Member',
    `bio` TEXT              
);

-- 2. Bảng Courses
CREATE TABLE `Courses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tutor_id` INT,         
    `tutor_name` VARCHAR(100), 
    `course_code` VARCHAR(20), 
    `title` VARCHAR(255),
    `description` TEXT,
    `status` ENUM('Processing', 'Ongoing', 'Ended') DEFAULT 'Processing',
    FOREIGN KEY (`tutor_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE
);

-- 3. Bảng Enrollments
CREATE TABLE `Enrollments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT,
    `course_id` INT
);

-- 4. Bảng Sessions (CÓ KHÓA NGOẠI RÀNG BUỘC)
CREATE TABLE `Sessions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_id` INT,
    `tutor_id` INT,
    `start_time` DATETIME,
    `end_time` DATETIME,
    `link` VARCHAR(255),
    CONSTRAINT `fk_session_course` FOREIGN KEY (`course_id`) REFERENCES `Courses` (`id`) ON DELETE CASCADE
);

-- 5. Bảng Bookings
CREATE TABLE `Bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `session_id` INT NOT NULL,
    `booking_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Ràng buộc khóa ngoại
    FOREIGN KEY (`student_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`session_id`) REFERENCES `Sessions`(`id`) ON DELETE CASCADE,
    
    -- Ràng buộc nghiệp vụ: 1 Session chỉ được book 1 lần
    CONSTRAINT `unique_session_booking` UNIQUE (`session_id`)
);

USE `cnpm`;

DELIMITER $$

-- 1. Trigger chặn khi Đặt lịch mới (INSERT)
DROP TRIGGER IF EXISTS `check_enrollment_before_insert` $$
CREATE TRIGGER `check_enrollment_before_insert`
BEFORE INSERT ON `Bookings`
FOR EACH ROW
BEGIN
    DECLARE v_course_id INT;
    DECLARE v_count INT;

    -- Tìm course_id của session định book
    SELECT `course_id` INTO v_course_id FROM `Sessions` WHERE `id` = NEW.session_id;

    -- Kiểm tra sinh viên có học môn đó không
    SELECT COUNT(*) INTO v_count FROM `Enrollments` 
    WHERE `student_id` = NEW.student_id AND `course_id` = v_course_id;

    -- Nếu không học -> Chặn ngay
    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'NOT_ENROLLED';
    END IF;
END $$

-- 2. Trigger chặn khi Đổi lịch (UPDATE)
DROP TRIGGER IF EXISTS `check_enrollment_before_update` $$
CREATE TRIGGER `check_enrollment_before_update`
BEFORE UPDATE ON `Bookings`
FOR EACH ROW
BEGIN
    DECLARE v_course_id INT;
    DECLARE v_count INT;

    -- Chỉ kiểm tra nếu session_id thay đổi
    IF NEW.session_id <> OLD.session_id THEN
        SELECT `course_id` INTO v_course_id FROM `Sessions` WHERE `id` = NEW.session_id;

        SELECT COUNT(*) INTO v_count FROM `Enrollments` 
        WHERE `student_id` = NEW.student_id AND `course_id` = v_course_id;

        IF v_count = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'NOT_ENROLLED';
        END IF;
    END IF;
END $$

DELIMITER ;
-- =======================================================
-- 2. INSERT DỮ LIỆU
-- =======================================================

-- USERS
INSERT INTO `Users` (`username`, `password`, `role`, `full_name`, `academic_status`, `bio`) VALUES

('tutor_khoa', '1', 'tutor', 'TS. Nguyễn Anh Khoa', 'Bachelor', 'Chuyên gia Giải thuật & Cấu trúc dữ liệu.'),
('tutor_hai', '1', 'tutor', 'ThS. Phạm Thanh Hải', 'PhD', 'Giảng viên Hệ điều hành & Mạng máy tính.'),
('tutor_toan', '1', 'tutor', 'TS. Lê Bá Khánh Trình', 'Professor', 'Chuyên dạy Giải tích, Đại số tuyến tính.'),
('tutor_lyhoa', '1', 'tutor', 'PGS. Trần Thiên Nhiên', 'Master', 'Phụ trách các môn Khoa học tự nhiên.'),
('tutor_triet', '1', 'tutor', 'ThS. Nguyễn Ái Quốc', 'PhD', 'Giảng viên lý luận chính trị.'),
('tutor_lan', '1', 'tutor', 'Cô Lê Thị Lan', 'Student', 'Công nghệ phần mềm & Web.'),

-- [ID 7-16] SINH VIÊN (STUDENT)
('sv_nam', '1', 'student', 'Trần Văn Nam', NULL),
('sv_hung', '1', 'student', 'Lê Quốc Hưng', NULL),
('sv_linh', '1', 'student', 'Nguyễn Thùy Linh', NULL),
('sv_bao', '1', 'student', 'Hoàng Gia Bảo', NULL),
('sv_an', '1', 'student', 'Phạm Bình An', NULL),
('sv_vy', '1', 'student', 'Đỗ Tường Vy', NULL),
('sv_khang', '1', 'student', 'Trần Minh Khang', NULL),
('sv_phuc', '1', 'student', 'Lê Hồng Phúc', NULL),
('sv_dat', '1', 'student', 'Nguyễn Tấn Đạt', NULL),
('sv_thao', '1', 'student', 'Phan Thu Thảo', NULL),

-- [ID 17] ADMIN
('admin_vip', '1', 'admin', 'System Admin', 'Quản trị viên hệ thống.');

-- COURSES (Tất cả đều Open)
INSERT INTO `Courses` (`tutor_id`, `tutor_name`, `course_code`, `title`, `description`, `status`) VALUES
-- 1.(Code)
(1, 'TS. Nguyễn Anh Khoa', 'CO2039', 'Lập trình Nâng cao', 'Advanced Programming.', 'Ongoing'),
(1, 'TS. Nguyễn Anh Khoa', 'CO2003', 'Cấu trúc Dữ liệu và Giải Thuật', 'Data Structures & Algorithms.', 'Ongoing'),
(1, 'TS. Nguyễn Anh Khoa', 'CO1027', 'Kỹ thuật Lập trình', 'Programming Techniques.', 'Processing'),
(1, 'TS. Nguyễn Anh Khoa', 'CO1005', 'Nhập môn Điện toán', 'Intro to Computing.', 'Ended'),
(1, 'TS. Nguyễn Anh Khoa', 'CO1007', 'Cấu trúc Rời rạc cho KHMT', 'Discrete Structures.', 'Ongoing'),

-- 2.(Hệ thống & Mạng)
(2, 'ThS. Phạm Thanh Hải', 'CO2017', 'Hệ điều hành', 'Operating Systems.', 'Ongoing'),
(2, 'ThS. Phạm Thanh Hải', 'CO2007', 'Kiến trúc Máy tính', 'Computer Architecture.', 'Processing'),
(2, 'ThS. Phạm Thanh Hải', 'CO1023', 'Hệ thống số', 'Digital Systems.', 'Ended'),
(2, 'ThS. Phạm Thanh Hải', 'CO3093', 'Mạng Máy tính', 'Computer Networks.', 'Ongoing'),

-- 3. 
(3, 'TS. Lê Bá Khánh Trình', 'MT2013', 'Xác suất và Thống kê', 'Prob & Stats.', 'Ongoing'),
(3, 'TS. Lê Bá Khánh Trình', 'CO2011', 'Mô hình hóa Toán học', 'Math Modeling.', 'Processing'),
(3, 'TS. Lê Bá Khánh Trình', 'MT1007', 'Đại số Tuyến tính', 'Linear Algebra.', 'Ongoing'),
(3, 'TS. Lê Bá Khánh Trình', 'MT1005', 'Giải tích 2', 'Calculus 2.', 'Ended'),
(3, 'TS. Lê Bá Khánh Trình', 'MT1003', 'Giải tích 1', 'Calculus 1.', 'Ended'),

-- 4. (Đại cương)
(4, 'PGS. Trần Thiên Nhiên', 'CH1003', 'Hóa đại cương', 'General Chemistry.', 'Ongoing'),
(4, 'PGS. Trần Thiên Nhiên', 'PH1003', 'Vật lý 1', 'General Physics 1.', 'Ended'),
(4, 'PGS. Trần Thiên Nhiên', 'PH1005', 'Vật lý 2', 'General Physics 2.', 'Processing'),
(4, 'PGS. Trần Thiên Nhiên', 'PH1007', 'Thí nghiệm Vật lý', 'Physics Lab.', 'Ongoing'),

-- 5.(Chính trị & Xã hội)
(5, 'ThS. Nguyễn Ái Quốc', 'SP1033', 'Kinh tế Chính trị Mác - Lênin', 'Political Economy.', 'Ongoing'),
(5, 'ThS. Nguyễn Ái Quốc', 'SP1031', 'Triết học Mác - Lênin', 'Philosophy.', 'Ended'),
(5, 'ThS. Nguyễn Ái Quốc', 'SP1035', 'Chủ nghĩa Xã hội Khoa học', 'Scientific Socialism.', 'Processing'),
(5, 'ThS. Nguyễn Ái Quốc', 'SP1037', 'Tư tưởng Hồ Chí Minh', 'Ho Chi Minh Ideology.', 'Ongoing'),
(5, 'ThS. Nguyễn Ái Quốc', 'SP1039', 'Lịch sử Đảng CSVN', 'History of VCP.', 'Processing'),

-- 6. (Soft skills & Khác)
(6, 'Cô Lê Thị Lan', 'SP1015', 'Kỹ năng Xã hội', 'Social Skills', 'Ongoing'),
(6, 'Cô Lê Thị Lan', 'IM1003', 'Nhập môn Quản lý', 'Intro to Management.', 'Processing');

-- ENROLLMENTS
INSERT INTO `Enrollments` (`student_id`, `course_id`) VALUES
(7, 2), (7, 6), (7, 10), (7, 15), -- Nam: DSA, OS, Xác suất, Hóa
(8, 1), (8, 6), (8, 19),          -- Hưng: LT Nâng cao, OS, KTCT
(9, 2), (9, 12), (9, 20),         -- Linh: DSA, Đại số, Triết
(10, 4), (10, 8), (10, 16),       -- Bảo: Điện toán, Hệ thống số, Lý 1
(11, 2), (11, 6), (11, 14),       -- An: DSA, OS, Giải tích 2
(12, 5), (12, 11), (12, 24),      -- Vy: Rời rạc, Mô hình toán, SHCD
(13, 10), (13, 12), (13, 22),     -- Khang: Xác suất, Đại số, CNXHKH
(14, 1), (14, 2), (14, 9),        -- Phúc: LTNC, DSA, Mạng
(15, 15), (15, 19), (15, 23),     -- Đạt: Hóa, KTCT, TTHCM
(16, 24), (16, 25);               -- Thảo: SHCD, Quản lý


-- SESSIONS
INSERT INTO `Sessions` (`course_id`, `tutor_id`, `start_time`, `end_time`, `link`) VALUES

-- [1] Lập trình Nâng cao (Tutor 1)
(1, 1, '2025-12-01 07:00:00', '2025-12-01 10:00:00', 'meet.google.com/co2039-1'),
(1, 1, '2025-12-08 07:00:00', '2025-12-08 10:00:00', 'meet.google.com/co2039-2'),
(1, 1, '2025-12-15 07:00:00', '2025-12-15 10:00:00', 'meet.google.com/co2039-3'),

-- [2] Cấu trúc Dữ liệu (Tutor 1)
(2, 1, '2025-12-02 09:00:00', '2025-12-02 11:30:00', 'meet.google.com/dsa-1'),
(2, 1, '2025-12-09 09:00:00', '2025-12-09 11:30:00', 'meet.google.com/dsa-2'),
(2, 1, '2025-12-16 09:00:00', '2025-12-16 11:30:00', 'meet.google.com/dsa-3'),

-- [3] Kỹ thuật Lập trình (Tutor 1)
(3, 1, '2025-12-03 13:00:00', '2025-12-03 16:00:00', 'meet.google.com/ktlt-1'),
(3, 1, '2025-12-10 13:00:00', '2025-12-10 16:00:00', 'meet.google.com/ktlt-2'),
(3, 1, '2025-12-17 13:00:00', '2025-12-17 16:00:00', 'meet.google.com/ktlt-3'),

-- [4] Nhập môn Điện toán (Tutor 1)
(4, 1, '2025-10-04 08:00:00', '2025-10-04 11:00:00', 'meet.google.com/nmdt-1'),
(4, 1, '2025-10-11 08:00:00', '2025-10-11 11:00:00', 'meet.google.com/nmdt-2'),
(4, 1, '2025-10-18 08:00:00', '2025-10-18 11:00:00', 'meet.google.com/nmdt-3'),

-- [5] Cấu trúc Rời rạc (Tutor 1)
(5, 1, '2025-12-05 07:00:00', '2025-12-05 10:00:00', 'meet.google.com/discrete-1'),
(5, 1, '2025-12-12 07:00:00', '2025-12-12 10:00:00', 'meet.google.com/discrete-2'),
(5, 1, '2025-12-19 07:00:00', '2025-12-19 10:00:00', 'meet.google.com/discrete-3'),

-- [6] Hệ điều hành (Tutor 2)
(6, 2, '2025-12-06 07:00:00', '2025-12-06 10:00:00', 'teams.microsoft.com/os-1'),
(6, 2, '2025-12-13 07:00:00', '2025-12-13 10:00:00', 'teams.microsoft.com/os-2'),
(6, 2, '2025-12-20 07:00:00', '2025-12-20 10:00:00', 'teams.microsoft.com/os-3'),

-- [7] Kiến trúc Máy tính (Tutor 2)
(7, 2, '2025-12-07 13:00:00', '2025-12-07 16:00:00', 'teams.microsoft.com/arch-1'),
(7, 2, '2025-12-14 13:00:00', '2025-12-14 16:00:00', 'teams.microsoft.com/arch-2'),
(7, 2, '2025-12-21 13:00:00', '2025-12-21 16:00:00', 'teams.microsoft.com/arch-3'),

-- [8] Hệ thống số (Tutor 2)
(8, 2, '2025-10-01 08:00:00', '2025-10-01 11:00:00', 'teams.microsoft.com/digi-1'),
(8, 2, '2025-10-08 08:00:00', '2025-10-08 11:00:00', 'teams.microsoft.com/digi-2'),
(8, 2, '2025-10-15 08:00:00', '2025-10-15 11:00:00', 'teams.microsoft.com/digi-3'),

-- [9] Mạng máy tính (Tutor 2)
(9, 2, '2025-12-02 13:00:00', '2025-12-02 16:00:00', 'teams.microsoft.com/net-1'),
(9, 2, '2025-12-09 13:00:00', '2025-12-09 16:00:00', 'teams.microsoft.com/net-2'),
(9, 2, '2025-12-16 13:00:00', '2025-12-16 16:00:00', 'teams.microsoft.com/net-3'),

-- [10] Xác suất và Thống kê (Tutor 3)
(10, 3, '2025-12-03 14:00:00', '2025-12-03 17:00:00', 'zoom.us/prob-1'),
(10, 3, '2025-12-10 14:00:00', '2025-12-10 17:00:00', 'zoom.us/prob-2'),
(10, 3, '2025-12-17 14:00:00', '2025-12-17 17:00:00', 'zoom.us/prob-3'),

-- [11] Mô hình hóa Toán học (Tutor 3)
(11, 3, '2025-12-04 07:00:00', '2025-12-04 10:00:00', 'zoom.us/mathmod-1'),
(11, 3, '2025-12-11 07:00:00', '2025-12-11 10:00:00', 'zoom.us/mathmod-2'),
(11, 3, '2025-12-18 07:00:00', '2025-12-18 10:00:00', 'zoom.us/mathmod-3'),

-- [12] Đại số Tuyến tính (Tutor 3)
(12, 3, '2025-12-05 09:00:00', '2025-12-05 11:30:00', 'zoom.us/linear-1'),
(12, 3, '2025-12-12 09:00:00', '2025-12-12 11:30:00', 'zoom.us/linear-2'),
(12, 3, '2025-12-19 09:00:00', '2025-12-19 11:30:00', 'zoom.us/linear-3'),

-- [13] Giải tích 2 (Tutor 3)
(13, 3, '2025-10-06 14:00:00', '2025-10-06 17:00:00', 'zoom.us/cal2-1'),
(13, 3, '2025-10-13 14:00:00', '2025-10-13 17:00:00', 'zoom.us/cal2-2'),
(13, 3, '2025-10-20 14:00:00', '2025-10-20 17:00:00', 'zoom.us/cal2-3'),

-- [14] Giải tích 1 (Tutor 3)
(14, 3, '2025-09-07 13:00:00', '2025-09-07 16:00:00', 'zoom.us/cal1-1'),
(14, 3, '2025-09-14 13:00:00', '2025-09-14 16:00:00', 'zoom.us/cal1-2'),
(14, 3, '2025-09-21 13:00:00', '2025-09-21 16:00:00', 'zoom.us/cal1-3'),

-- [15] Hóa đại cương (Tutor 4)
(15, 4, '2025-12-08 09:00:00', '2025-12-08 11:30:00', 'meet.google.com/chem-1'),
(15, 4, '2025-12-15 09:00:00', '2025-12-15 11:30:00', 'meet.google.com/chem-2'),
(15, 4, '2025-12-22 09:00:00', '2025-12-22 11:30:00', 'meet.google.com/chem-3'),

-- [16] Vật lý 1 (Tutor 4)
(16, 4, '2025-10-09 13:00:00', '2025-10-09 15:00:00', 'meet.google.com/phy1-1'),
(16, 4, '2025-10-16 13:00:00', '2025-10-16 15:00:00', 'meet.google.com/phy1-2'),
(16, 4, '2025-10-23 13:00:00', '2025-10-23 15:00:00', 'meet.google.com/phy1-3'),

-- [17] Vật lý 2 (Tutor 4)
(17, 4, '2025-12-10 13:00:00', '2025-12-10 15:00:00', 'meet.google.com/phy2-1'),
(17, 4, '2025-12-17 13:00:00', '2025-12-17 15:00:00', 'meet.google.com/phy2-2'),
(17, 4, '2025-12-24 13:00:00', '2025-12-24 15:00:00', 'meet.google.com/phy2-3'),

-- [18] Thí nghiệm Vật lý (Tutor 4)
(18, 4, '2025-12-01 13:00:00', '2025-12-01 16:00:00', 'offline-lab-b4'),
(18, 4, '2025-12-08 13:00:00', '2025-12-08 16:00:00', 'offline-lab-b4'),
(18, 4, '2025-12-15 13:00:00', '2025-12-15 16:00:00', 'offline-lab-b4'),

-- [19] Kinh tế Chính trị (Tutor 5)
(19, 5, '2025-12-02 18:00:00', '2025-12-02 20:30:00', 'zoom.us/poleco-1'),
(19, 5, '2025-12-09 18:00:00', '2025-12-09 20:30:00', 'zoom.us/poleco-2'),
(19, 5, '2025-12-16 18:00:00', '2025-12-16 20:30:00', 'zoom.us/poleco-3'),

-- [20] Triết học (Tutor 5)
(20, 5, '2025-10-03 18:00:00', '2025-10-03 20:30:00', 'zoom.us/marx-1'),
(20, 5, '2025-10-10 18:00:00', '2025-10-10 20:30:00', 'zoom.us/marx-2'),
(20, 5, '2025-10-17 18:00:00', '2025-10-17 20:30:00', 'zoom.us/marx-3'),

-- [21] CNXH Khoa học (Tutor 5)
(21, 5, '2025-12-04 18:00:00', '2025-12-04 20:30:00', 'zoom.us/socialism-1'),
(21, 5, '2025-12-11 18:00:00', '2025-12-11 20:30:00', 'zoom.us/socialism-2'),
(21, 5, '2025-12-18 18:00:00', '2025-12-18 20:30:00', 'zoom.us/socialism-3'),

-- [22] Tư tưởng HCM (Tutor 5)
(22, 5, '2025-12-05 18:00:00', '2025-12-05 20:30:00', 'zoom.us/hcm-1'),
(22, 5, '2025-12-12 18:00:00', '2025-12-12 20:30:00', 'zoom.us/hcm-2'),
(22, 5, '2025-12-19 18:00:00', '2025-12-19 20:30:00', 'zoom.us/hcm-3'),

-- [23] Lịch sử Đảng (Tutor 5)
(23, 5, '2025-12-06 18:00:00', '2025-12-06 20:30:00', 'zoom.us/vcp-1'),
(23, 5, '2025-12-13 18:00:00', '2025-12-13 20:30:00', 'zoom.us/vcp-2'),
(23, 5, '2025-12-20 18:00:00', '2025-12-20 20:30:00', 'zoom.us/vcp-3'),

-- [24] Sinh hoạt công dân (Tutor 6)
(24, 6, '2025-12-25 08:00:00', '2025-12-25 11:00:00', 'hcmut.edu.vn/shcd-1'),
(24, 6, '2025-12-26 08:00:00', '2025-12-26 11:00:00', 'hcmut.edu.vn/shcd-2'),
(24, 6, '2025-12-27 08:00:00', '2025-12-27 11:00:00', 'hcmut.edu.vn/shcd-3'),

-- [25] Nhập môn Quản lý (Tutor 6)
(25, 6, '2026-01-08 09:00:00', '2026-01-08 11:00:00', 'meet.google.com/mgt-1'),
(25, 6, '2026-01-15 09:00:00', '2026-01-15 11:00:00', 'meet.google.com/mgt-2'),
(25, 6, '2026-01-22 09:00:00', '2026-01-22 11:00:00', 'meet.google.com/mgt-3');




-- KIỂM TRA
SELECT * FROM Users;
SELECT * FROM Courses;
SELECT * FROM Sessions;
SELECT * FROM Enrollments;
SELECT * FROM Bookings;
