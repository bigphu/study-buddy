const db = require('../config/database');

class SubjectViewModel {
    // 1. Lấy thông tin cơ bản của một khóa học (Giữ nguyên)
    static async getCourseById(id) {
        const sql = "SELECT * FROM Courses WHERE id = ?";
        const [rows] = await db.execute(sql, [id]);
        return rows[0]; 
    }

    // 2. Lấy danh sách các buổi học 
    static async getSessionsByCourseId(courseId) {
        const sql = "SELECT * FROM Sessions WHERE course_id = ? ORDER BY start_time ASC";
        const [rows] = await db.execute(sql, [courseId]);
        return rows;
    }

    // 3. Cập nhật thông tin khóa học (CÓ PHÂN QUYỀN)
    static async updateCourse(id, data, userId, role) {
        // Câu lệnh SQL cơ bản
        let sql = "UPDATE Courses SET title = ?, description = ?, status = ? WHERE id = ?";
        let params = [data.title, data.description, data.status, id];

        // LOGIC QUAN TRỌNG:
        // Nếu KHÔNG PHẢI Admin (tức là Tutor), bắt buộc phải là chính chủ (tutor_id trùng userId)
        if (role !== 'admin') {
            sql += " AND tutor_id = ?";
            params.push(userId);
        }

        const [result] = await db.execute(sql, params);
        return result;
    }
}

module.exports = SubjectViewModel;