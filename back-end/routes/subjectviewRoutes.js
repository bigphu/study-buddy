const express = require('express');
const router = express.Router();
const subjectviewController = require('../controllers/subjectviewController');

// Import bộ lọc bảo vệ (Middleware)
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// ==============================================================================
// 1. XEM CHI TIẾT KHÓA HỌC & LỊCH HỌC (SUBJECT VIEW)
// ==============================================================================
/**
 * @route   GET /api/subjectview/courses-details/:id
 * @desc    Xem thông tin chi tiết của một khóa học và danh sách các buổi học (Sessions) bên trong nó.
 * Dùng cho cả Tutor (xem lớp mình dạy) và Student (xem lớp mình học).
 * @url_param :id -> Là ID của khóa học muốn xem (Ví dụ: 1)
 * @access  Private (Phải đăng nhập mới xem được)
 * * * --- HƯỚNG DẪN TEST (Thunder Client) ---
 * 1. Method: GET
 * 2. URL:    http://localhost:3001/api/courses-details/1
 * (Số 1 là ID khóa học muốn xem)
 * 3. Header: 
 * - Key: Authorization
 * - Value: Bearer <Token_Bất_Kỳ_Của_Student_Hoặc_Tutor>
 * 4. Body:   (Trống)
 */
router.get('/courses-details/:id', verifyToken, subjectviewController.getCourseDetail);


// ==============================================================================
// 2. CẬP NHẬT THÔNG TIN KHÓA HỌC (CHỈ TUTOR/ADMIN)
// ==============================================================================
/**
 * @route   PUT /api/subjectview/courses-details/:id
 * @desc    Sửa tên, mô tả hoặc đóng/mở khóa học.
 * - Tutor: Chỉ sửa được khóa học chính chủ (do mình tạo).
 * - Admin: Sửa được tất cả khóa học.
 * - Student: Bị chặn (Lỗi 403).
 * @url_param :id -> Là ID của khóa học muốn sửa (Ví dụ: 1)
 * @access  Private (Chỉ Tutor hoặc Admin)
 * * * --- HƯỚNG DẪN TEST (Thunder Client) ---
 * 1. Method: PUT
 * 2. URL:    http://localhost:3001/api/courses-details/1
 * (Số 1 là ID khóa học muốn sửa)
 * 3. Header: 
 * - Key: Authorization
 * - Value: Bearer <Token_Tutor_Chính_Chủ_Hoặc_Admin>
 * 4. Body (JSON):
 * {
 * "title": "Tên Khóa Học Mới 2025",
 * "description": "Cập nhật mô tả mới nhất...",
 * "status": "Closed"  // Hoặc "Open"
 * }
 */
router.put('/courses-details/:id', 
    verifyToken, 
    authorizeRoles('tutor', 'admin'), // Chặn Student ngay từ cửa
    subjectviewController.updateCourse
);

module.exports = router;