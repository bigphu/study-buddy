const SubjectViewModel = require('../models/subjectviewModel'); 

// 1. Xem chi tiết
exports.getCourseDetail = async (req, res) => {
    const { id } = req.params; 

    try {
        const courseInfo = await SubjectViewModel.getCourseById(id);
        if (!courseInfo) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học này' });
        }

        const sessionRows = await SubjectViewModel.getSessionsByCourseId(id);

        res.status(200).json({
            course: courseInfo,
            sessions: sessionRows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 2. Cập nhật khóa học
exports.updateCourse = async (req, res) => {
    const { id } = req.params; 
    const { title, description, status } = req.body;
    
    // Lấy thông tin người đang đăng nhập (Từ Token)
    const { id: userId, role } = req.user;

    try {
        // Gọi Model và truyền thêm userId, role
        const result = await SubjectViewModel.updateCourse(
            id, 
            { title, description, status }, 
            userId, 
            role
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'Không tìm thấy khóa học hoặc bạn không có quyền sửa.' });
        }

        res.json({ message: 'Cập nhật khóa học thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};