const MylinksModel = require('../models/mylinksModel'); // Import Model

exports.getMyCourses = async (req, res) => {
    // 1. Lấy thông tin người đang đăng nhập (Từ Token)
    const { id: loggedId, role: loggedRole } = req.user;
    
    // 2. Xác định: Muốn xem dữ liệu của ai? (Target ID)
    let targetId = loggedId; // Mặc định là xem của chính mình

    // LOGIC ADMIN: Nếu là Admin và có gửi ID muốn soi -> Đổi target
    if (loggedRole === 'admin' && req.body.userId) {
        targetId = req.body.userId;
        console.log(`--> ADMIN (ID: ${loggedId}) đang soi User ID: ${targetId}`);
    } else if (loggedRole === 'admin' && !req.body.userId) {
        // Nếu Admin không gửi ID -> Xem toàn bộ (Optional feature)
        try {
            const allCourses = await MylinksModel.getAllCourses();
            return res.status(200).json({ role: 'admin', courses: allCourses, message: "Toàn bộ khóa học hệ thống" });
        } catch (e) { return res.status(500).json({ message: 'Lỗi server' }); }
    } else {
        console.log(`--> ${loggedRole} (ID: ${loggedId}) đang xem dữ liệu chính chủ.`);
    }

    try {
        // --- BƯỚC 1: Gọi Model để kiểm tra Role của người cần xem ---
        const targetRole = await MylinksModel.getUserRole(targetId);

        if (!targetRole) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng này.' });
        }

        // --- BƯỚC 2: Gọi Model để lấy dữ liệu tùy theo Role ---
        let courses = [];

        if (targetRole === 'tutor') {
            courses = await MylinksModel.getCoursesByTutor(targetId);
        } 
        else if (targetRole === 'student') {
            courses = await MylinksModel.getCoursesByStudent(targetId);
        } 
        else {
            // Trường hợp target là Admin khác hoặc role lạ
            return res.json({ 
                role: targetRole, 
                courses: [], 
                message: "User này không có dữ liệu khóa học cá nhân." 
            });
        }

        // --- BƯỚC 3: Trả về kết quả ---
        res.status(200).json({
            viewing_user_id: targetId,
            role: targetRole, 
            courses: courses
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};