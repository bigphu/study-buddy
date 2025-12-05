USE `cnpm`;

-- 4.1 Users
INSERT INTO `Users` (`id`, `username`, `password`, `role`, `full_name`, `academic_status`, `bio`) VALUES
(1, 'tutor_khoa', '1', 'Tutor', 'TS. Nguyễn Anh Khoa', 'PhD', 'Introduction to Programming & Data Structures'),
(2, 'tutor_hai', '1', 'Tutor', 'ThS. Phạm Thanh Hải', 'Master', 'Operating Systems'),
(3, 'tutor_quan', '1', 'Tutor', 'PGS.TS Trần Minh Quân', 'Assoc. Prof', 'Artificial Intelligence Expert'),
(4, 'tutor_lan', '1', 'Tutor', 'ThS. Lê Thị Lan', 'Master', 'Database & Web Development'),
(5, 'sv_nam', '1', 'Student', 'Trần Văn Nam', 'Student', NULL),
(6, 'sv_hung', '1', 'Student', 'Lê Quốc Hưng', 'Student', NULL);

-- 4.2 Courses
INSERT INTO `Courses` (`id`, `tutor_id`, `course_code`, `title`, `description`, `status`) VALUES
(1, 1, 'CO1005', 'Nhập môn Lập trình', 'Introduction to Programming', 'Ongoing'),
(2, 1, 'CO2003', 'Cấu trúc Dữ liệu & Giải thuật', 'Data Structures and Algorithms', 'Ongoing'),
(4, 3, 'CO3001', 'Trí tuệ Nhân tạo', 'Artificial Intelligence', 'Ongoing'),
(6, 4, 'CO2013', 'Hệ Cơ sở dữ liệu', 'Database Systems', 'Ongoing'),
(7, 4, 'CO3049', 'Lập trình Web', 'Web Programming', 'Ongoing');

-- 4.3 Enrollments
-- INSERT INTO `Enrollments` (`student_id`, `course_id`) VALUES
-- (6, 1), (6, 2), (6, 4), (6, 6), (6, 7);

-- 4.4 Sessions
INSERT INTO `Sessions` (`id`, `course_id`, `tutor_id`, `start_time`, `end_time`, `link`, `title`, `session_type`) VALUES
(1, 1, 1, NULL, NULL, 'meet.google.com/co1005-01', 'CO1005 - Nhập môn Lập trình', 'Meeting'), 
(2, 1, 1, '2025-12-06 07:00:00', '2025-12-06 10:00:00', 'meet.google.com/co1005-02', 'CO1005 - Nhập môn Lập trình', 'Meeting'),
(4, 2, 1, '2025-12-08 09:00:00', '2025-12-08 11:30:00', 'meet.google.com/dsa-01', 'CO2003 - Cấu trúc Dữ liệu (Midterm Quiz)', 'Quiz'),
(5, 2, 1, '2025-12-09 09:00:00', '2025-12-09 11:30:00', 'meet.google.com/dsa-02', 'CO2003 - Cấu trúc Dữ liệu & Giải thuật', 'Meeting'),
(16, 6, 4, '2025-12-11 14:00:00', '2025-12-11 17:00:00', 'teams.microsoft.com/db-01', 'CO2013 - Hệ Cơ sở dữ liệu (Reading Material)', 'Document'),
(19, 7, 4, '2025-12-07 11:00:00', '2025-12-07 21:00:00', 'teams.microsoft.com/web-01', 'CO3049 - Lập trình Web (Course Survey)', 'Form'),
(10, 4, 3, '2025-12-10 13:00:00', '2025-12-20 16:00:00', 'zoom.us/ai-01', 'CO3001 - Trí tuệ Nhân tạo (AI)', 'Meeting');

-- 4.5 Bookings
--  INSERT INTO `Bookings` (`student_id`, `session_id`) VALUES
--  (6, 2), (6, 4), (6, 5), (6, 16), (6, 19), (6, 10);