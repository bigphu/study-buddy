const db = require('../config/database');

class BookingModel {
    // 1. Đăng ký lịch (Create)
    static async create(studentId, sessionId) {
        try {
            const sql = "INSERT INTO Bookings (student_id, session_id) VALUES (?, ?)";
            const [result] = await db.execute(sql, [studentId, sessionId]);
            return result;
        } catch (error) {
            // Xử lý các lỗi từ MySQL trả về
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('SESSION_TAKEN'); // Lỗi: Session này đã có người khác book rồi
            }
            if (error.sqlState === '45000') {
                throw new Error('NOT_ENROLLED'); // Lỗi: Sinh viên chưa đăng ký khóa học này (Do Trigger chặn)
            }
            throw error;
        }
    }

    // 2. Hủy lịch (Delete)
    // Xóa dựa trên ID của Booking và phải đúng Student đó (để không hủy bậy của người khác)
    static async delete(bookingId, studentId) {
        const sql = "DELETE FROM Bookings WHERE id = ? AND student_id = ?";
        const [result] = await db.execute(sql, [bookingId, studentId]);
        return result;
    }

    // 3. Đổi lịch (Reschedule - Update)
    static async update(bookingId, newSessionId, studentId) {
        try {
            // Cập nhật session_id mới cho booking cũ
            const sql = "UPDATE Bookings SET session_id = ? WHERE id = ? AND student_id = ?";
            const [result] = await db.execute(sql, [newSessionId, bookingId, studentId]);
            return result;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') throw new Error('SESSION_TAKEN');
            if (error.sqlState === '45000') throw new Error('NOT_ENROLLED');
            throw error;
        }
    }

    // 4. Xem danh sách đã đăng ký (Get My Bookings)
    static async getByStudent(studentId) {
        // Join 3 bảng để lấy đầy đủ thông tin: Tên môn, Giờ học, Link...
        const sql = `
            SELECT 
                b.id as booking_id, 
                b.session_id, 
                b.booking_time,
                s.start_time, 
                s.end_time, 
                s.link, 
                c.title as course_title, 
                c.course_code,
                c.tutor_name
            FROM Bookings b
            JOIN Sessions s ON b.session_id = s.id
            JOIN Courses c ON s.course_id = c.id
            WHERE b.student_id = ?
            ORDER BY s.start_time ASC
        `;
        const [rows] = await db.execute(sql, [studentId]);
        return rows;
    }
}

module.exports = BookingModel;