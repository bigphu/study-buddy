const db = require('../config/database');

class DiscoveryModel {
    // 1. Lấy tất cả khóa học đang mở (Ongoing)
    static async getAllOpenCourses() {
        // CẬP NHẬT: Thêm 'course_code' và 'status' vào câu SELECT
        const sql = `
            SELECT id, course_code, title, description, tutor_name, tutor_id, status 
            FROM Courses 
            WHERE status = 'Ongoing'
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }

    // 2. Tìm thông tin Tutor theo ID
    static async findTutorById(tutorId) {
        // Lấy thông tin cơ bản (full_name, bio)
        const sql = "SELECT full_name, bio FROM Users WHERE id = ? AND role = 'tutor'";
        const [rows] = await db.execute(sql, [tutorId]);
        
        // Trả về người đầu tiên (hoặc undefined nếu không thấy)
        return rows[0];
    }

    // 3. Lấy lịch dạy của Tutor đó (Chi tiết)
    static async getTutorSessions(tutorId) {
        // CẬP NHẬT: Join thêm để lấy Mã môn (c.course_code) cho chuyên nghiệp
        const sql = `
            SELECT s.*, c.title as course_title, c.course_code
            FROM Sessions s
            JOIN Courses c ON s.course_id = c.id
            WHERE s.tutor_id = ?
            ORDER BY s.start_time ASC
        `;
        const [rows] = await db.execute(sql, [tutorId]);
        return rows;
    }
}

module.exports = DiscoveryModel;