const SessionModel = require('../models/sessionModel'); // Import Model

// 1. Lấy danh sách Khóa học
exports.getCourses = async (req, res) => {
    try {
        const rows = await SessionModel.getAllCourses();
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách khóa học' });
    }
};

// 2. Lấy danh sách Session
exports.getSessions = async (req, res) => {
    // Lấy thông tin người dùng từ Token (đã qua middleware)
    const { id: userId, role } = req.user; 

    try {
        // Gọi Model và TRUYỀN ID + ROLE sang
        const rows = await SessionModel.getAllSessions(userId, role);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 3. Tạo Session mới
exports.createSession = async (req, res) => {
    const { course_id, start_time, end_time, link } = req.body;
    const { id: loggedId, role } = req.user;
    let finalTutorId = loggedId; 

    // --- LOGIC PHÂN QUYỀN ---
    if (role === 'admin') {
        // Nếu là ADMIN: Kiểm tra xem có nhập tutorId muốn gán không?
        if (req.body.tutorId) {
            finalTutorId = req.body.tutorId;
            console.log(`--> ADMIN đang tạo lịch dùm cho Tutor ID: ${finalTutorId}`);
        } else {
            console.log(`--> ADMIN tạo lịch cho chính mình (ID: ${finalTutorId})`);
        }
    } 
    else {
        // Nếu là TUTOR: Bắt buộc dùng ID của chính mình (LoggedId)
        // Dù Tutor có cố tình gửi req.body.tutorId thì code cũng LỜ ĐI -> Bảo mật tuyệt đối
        console.log(`--> TUTOR (ID: ${finalTutorId}) đang tạo lịch cho chính mình.`);
    }

    try {
        // Gọi Model để lưu vào DB
        await SessionModel.create({ 
            tutorId: finalTutorId, 
            course_id, 
            start_time, 
            end_time, 
            link 
        });
        
        res.status(201).json({ message: 'Tạo thành công!' });
    } catch (error) {
        console.error("Lỗi tạo session:", error);
        res.status(500).json({ message: 'Lỗi server (Kiểm tra lại ID khóa học có tồn tại không)' });
    }
};

// 4. Sửa Session
exports.updateSession = async (req, res) => {
    const { id } = req.params; // ID session cần sửa
    const { course_id, start_time, end_time, link } = req.body; // Dữ liệu mới
    const { id: userId, role } = req.user;

    try {
        const result = await SessionModel.update(id, { 
            course_id, start_time, end_time, link 
        }, userId, role);

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'Không tìm thấy session hoặc bạn không có quyền sửa.' });
        }

        res.json({ message: 'Cập nhật thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 5. Xóa Session
exports.deleteSession = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await SessionModel.delete(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy ID để xóa.' });
        }

        res.json({ message: 'Đã xóa thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};