const BookingModel = require('../models/bookingModel');

// 1. Đăng ký lịch học
exports.bookSession = async (req, res) => {
    const { sessionId } = req.body;
    const studentId = req.user.id; // Lấy từ Token

    // Kiểm tra quyền: Chỉ student mới được book
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Chức năng này chỉ dành cho Sinh viên." });
    }

    try {
        await BookingModel.create(studentId, sessionId);
        res.status(201).json({ message: "Đặt lịch thành công!" });
    } catch (error) {
        if (error.message === 'SESSION_TAKEN') {
            return res.status(400).json({ message: "Rất tiếc, buổi học này đã có người đăng ký rồi." });
        }
        if (error.message === 'NOT_ENROLLED') {
            return res.status(400).json({ message: "Bạn chưa đăng ký khóa học này nên không thể đặt lịch." });
        }
        console.error(error);
        res.status(500).json({ message: "Lỗi server." });
    }
};

// 2. Hủy lịch
exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;
    const studentId = req.user.id;

    try {
        const result = await BookingModel.delete(bookingId, studentId);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy lịch đặt hoặc bạn không có quyền hủy." });
        }

        res.json({ message: "Đã hủy lịch học thành công." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server." });
    }
};

// 3. Đổi lịch (Reschedule)
exports.rescheduleBooking = async (req, res) => {
    const { bookingId } = req.params;
    const { newSessionId } = req.body; // ID buổi học mới muốn chuyển sang
    const studentId = req.user.id;

    try {
        const result = await BookingModel.update(bookingId, newSessionId, studentId);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy lịch cũ để đổi." });
        }

        res.json({ message: "Đổi lịch thành công!" });
    } catch (error) {
        if (error.message === 'SESSION_TAKEN') {
            return res.status(400).json({ message: "Buổi học mới bạn chọn đã có người khác đặt rồi." });
        }
        if (error.message === 'NOT_ENROLLED') {
            return res.status(400).json({ message: "Buổi học mới không thuộc khóa học bạn đã đăng ký." });
        }
        console.error(error);
        res.status(500).json({ message: "Lỗi server." });
    }
};

// 4. Xem lịch đã đăng ký (My Bookings)
exports.getMyBookings = async (req, res) => {
    const studentId = req.user.id;

    if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Chức năng này chỉ dành cho Sinh viên." });
    }

    try {
        const rows = await BookingModel.getByStudent(studentId);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server." });
    }
};