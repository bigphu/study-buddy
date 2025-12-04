const express = require('express');
const router = express.Router();
const mylinksController = require('../controllers/mylinksController');

// Import bộ lọc bảo vệ (Middleware)
const { verifyToken } = require('../middlewares/authMiddleware');

// ==============================================================================
// 1. XEM KHÓA HỌC CỦA TÔI (MY LINKS)
// ==============================================================================
/**
 * @route   POST /api/mylinks/my-courses
 * @desc    Lấy danh sách khóa học liên quan đến người dùng hiện tại.
 * - Tutor: Xem các khóa do mình tạo (Open).
 * - Student: Xem các khóa mình đã đăng ký.
 * - Admin: Có thể xem của bất kỳ ai (nếu gửi userId).
 * @access  Private (Phải đăng nhập)
 * * * --- HƯỚNG DẪN TEST (Thunder Client / Postman) ---
 * 1. Method: POST
 * 2. URL:    http://localhost:3001/api/my-courses
 * 3. Headers:
 * - Key:   Authorization
 * - Value: Bearer <Dán_Token_Vào_Đây>
 * * 4. Body (JSON):
 * - Trường hợp A (Student/Tutor xem chính mình):
 * (Để trống, không cần nhập gì cả)
 * {}
 * * - Trường hợp B (Admin muốn soi dữ liệu người khác):
 * {
 * "userId": 5  // ID của người muốn xem
 * }
 */
router.post('/my-courses', verifyToken, mylinksController.getMyCourses); 


module.exports = router;