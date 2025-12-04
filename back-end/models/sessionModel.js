const db = require('../config/database');

class SessionModel {
    // 1. Lấy danh sách khóa học
    static async getAllCourses() {
        const [rows] = await db.execute('SELECT id, title FROM Courses');
        return rows;
    }

    // 2. Lấy danh sách Session
    static async getAllSessions(userId, role) {
        let sql = "SELECT * FROM Sessions";
        let params = [];

        // Nếu là Admin: Xem hết
        if (role === 'admin') {
            sql += " ORDER BY start_time DESC";
        } 
        // Nếu là Tutor: Chỉ xem của mình
        else {
            sql += " WHERE tutor_id = ? ORDER BY start_time DESC";
            params = [userId];
        }

        const [rows] = await db.execute(sql, params);
        return rows;
    }
    // 3. Tạo Session
    static async create(data) {
        const sql = "INSERT INTO Sessions (tutor_id, course_id, start_time, end_time, link) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.execute(sql, [
            data.tutorId, 
            data.course_id, 
            data.start_time, 
            data.end_time, 
            data.link
        ]);
        return result;
    }

    // 4. Sửa Session
static async update(id, data, userId, role) {
        let sql = "UPDATE Sessions SET course_id=?, start_time=?, end_time=?, link=? WHERE id=?";
        
        let params = [
            data.course_id, 
            data.start_time, 
            data.end_time, 
            data.link, 
            id
        ];

        // LOGIC QUAN TRỌNG:
        // Nếu KHÔNG PHẢI Admin (tức là Tutor), thì thêm điều kiện "chính chủ"
        if (role !== 'admin') {
            sql += " AND tutor_id = ?";
            params.push(userId);
        }
        // (Nếu là Admin thì SQL giữ nguyên, không cần check tutor_id -> Sửa thoải mái)

        const [result] = await db.execute(sql, params);
        return result;
    }

    // 5. Xóa Session
    static async delete(id) {
        const sql = "DELETE FROM Sessions WHERE id = ?";
        const [result] = await db.execute(sql, [id]);
        return result;
    }
}

module.exports = SessionModel;