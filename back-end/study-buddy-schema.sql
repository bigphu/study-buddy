-- Active: 1764917508156@@127.0.0.1@3306@cnpm
-- =======================================================
-- 1. DATABASE SETUP & TABLES
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
    `course_code` VARCHAR(20) UNIQUE, 
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