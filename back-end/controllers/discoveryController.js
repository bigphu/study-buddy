const DiscoveryModel = require('../models/discoveryModel'); // Import Model

// 1. Discovery: Lấy danh sách khóa học
exports.getDiscovery = async (req, res) => {
    try {
        const courses = await DiscoveryModel.getAllOpenCourses();
        res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 2. Discovery - Expand: Xem chi tiết Tutor + Lịch
exports.getTutorDetails = async (req, res) => {
    const { tutorId } = req.params;

    try {
        // Bước 1: Gọi Model tìm Tutor
        const tutor = await DiscoveryModel.findTutorById(tutorId);

        // Kiểm tra nếu không có tutor
        if (!tutor) {
            return res.status(404).json({ message: 'Không tìm thấy giảng viên này.' });
        }

        // Bước 2: Gọi Model lấy lịch dạy
        const sessions = await DiscoveryModel.getTutorSessions(tutorId);

        // Bước 3: Trả về kết quả gộp
        res.status(200).json({
            tutor: tutor,
            schedule: sessions 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};