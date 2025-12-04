const db = require('../config/database');

class AuthModel {
    // 1. Tìm User theo username (Dùng cho Login)
    static async findByUsername(username) {
        const sql = "SELECT * FROM Users WHERE username = ?";
        const [rows] = await db.execute(sql, [username]);
        
        // Trả về user đầu tiên tìm thấy (hoặc undefined nếu không có)
        return rows[0]; 
    }

    // 2. Lấy danh sách tất cả User (Dùng cho Admin xem)
    static async getAll() {
        const sql = "SELECT id, username, full_name, role FROM Users";
        const [rows] = await db.execute(sql);
        return rows;
    }
}

module.exports = AuthModel;