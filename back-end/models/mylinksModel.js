const db = require('../config/database');

class MylinksModel {
    // 1. Tìm Role của một User bất kỳ
    static async getUserRole(userId) {
        const sql = "SELECT role FROM Users WHERE id = ?";
        const [rows] = await db.execute(sql, [userId]);
        // Trả về role nếu có, ngược lại trả về undefined
        return rows[0] ? rows[0].role : null;
    }

    // 2. Lấy khóa học của Tutor (do họ tạo)
    static async getCoursesByTutor(tutorId) {
        const sql = "SELECT id, course_code, title, description, status FROM Courses WHERE tutor_id = ? AND status = 'Ongoing'";
        const [rows] = await db.execute(sql, [tutorId]);
        return rows;
    }

    // 3. Lấy khóa học của Student (do họ đăng ký)
    static async getCoursesByStudent(studentId) {
        const sql = `
            SELECT c.id, c.course_code, c.title, c.description, c.tutor_name 
            FROM Courses c
            JOIN Enrollments e ON c.id = e.course_id
            WHERE e.student_id = ?
        `;
        const [rows] = await db.execute(sql, [studentId]);
        return rows;
    }

    // 4. (Optional) Admin lấy toàn bộ khóa học
    static async getAllCourses() {
        const sql = "SELECT * FROM Courses ORDER BY id DESC";
        const [rows] = await db.execute(sql);
        return rows;
    }
}

module.exports = MylinksModel;