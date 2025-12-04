const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Import bộ lọc bảo vệ (Middleware)
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// ==============================================================================
// 1. LẤY DANH SÁCH MÔN HỌC (Cho Dropdown Menu)
// ==============================================================================
/**
 * @route   GET /api/courses
 * @access  Private (Cần đăng nhập)
 * * --- HƯỚNG DẪN TEST ---
 * 1. Method: GET
 * 2. URL:    http://localhost:3001/api/courses
 * 3. Header: Authorization: Bearer <Token_Bất_Kỳ>
 */
router.get('/courses', verifyToken, sessionController.getCourses);


// ==============================================================================
// 2. LẤY DANH SÁCH BUỔI HỌC (SESSION)
// ==============================================================================
/**
 * @route   GET /api/sessions
 * @desc    Lấy danh sách các buổi học. 
 * - Admin: Thấy hết tất cả.
 * - Tutor: Chỉ thấy buổi mình dạy.
 * @access  Private (Cần đăng nhập)
 * * --- HƯỚNG DẪN TEST ---
 * 1. Method: GET
 * 2. URL:    http://localhost:3001/api/sessions
 * 3. Header: Authorization: Bearer <Token_Tutor_Hoặc_Admin>
 */
router.get('/sessions', verifyToken, 
    authorizeRoles('tutor', 'admin'), 
    sessionController.getSessions);


// ==============================================================================
// 3. TẠO BUỔI HỌC MỚI
// ==============================================================================
/**
 * @route   POST /api/sessions
 * @desc    Tạo lịch học mới
 * @access  Private (Chỉ Tutor hoặc Admin)
 * * --- HƯỚNG DẪN TEST ---
 * 1. Method: POST
 * 2. URL:    http://localhost:3001/api/sessions
 * 3. Header: Authorization: Bearer <Token_Tutor_Hoặc_Admin>
 * 4. Body (JSON):
 * {
 * "course_id": 1, 
 * "start_time": "2025-12-25 08:00:00",
 * "end_time": "2025-12-25 10:00:00",
 * "link": "https://zoom.us/lop-moi"
 * }
 * Nếu như là admin thì ở json thêm dòng 
 * "tutorId": 3   (Để tạo lịch cho tutor có ID = 3)
 */
router.post('/sessions', 
    verifyToken, 
    authorizeRoles('tutor', 'admin'), // Chặn Student
    sessionController.createSession
); 


// ==============================================================================
// 4. SỬA BUỔI HỌC
// ==============================================================================
/**
 * @route   PUT /api/sessions/:id
 * @desc    Cập nhật thông tin buổi học
 * - Admin: Sửa được của bất kỳ ai.
 * - Tutor: Chỉ sửa được buổi của mình.
 * @url_param :id -> Là ID của buổi học muốn sửa (Ví dụ: 10)
 * @access  Private (Chỉ Tutor chính chủ hoặc Admin)
 * * --- HƯỚNG DẪN TEST ---
 * 1. Method: PUT
 * 2. URL:    http://localhost:3001/api/sessions/10
 * 3. Header: Authorization: Bearer <Token_Tutor_Hoặc_Admin>
 * 4. Body (JSON):
 * {
 * "course_id": 1,
 * "start_time": "2025-12-30 14:00:00",
 * "end_time": "2025-12-30 16:00:00",
 * "link": "https://meet.google.com/link-sua-doi"
 * }
 */
router.put('/sessions/:id', 
    verifyToken, 
    authorizeRoles('tutor', 'admin'), 
    sessionController.updateSession
); 


// ==============================================================================
// 5. XÓA BUỔI HỌC
// ==============================================================================
/**
 * @route   DELETE /api/sessions/:id
 * @desc    Xóa một buổi học
 * - Admin: Xóa được hết.
 * - Tutor: Chỉ xóa được buổi của mình.
 * @url_param :id -> Là ID của buổi học muốn xóa (Ví dụ: 10)
 * @access  Private (Chỉ Tutor chính chủ hoặc Admin)
 * * --- HƯỚNG DẪN TEST ---
 * 1. Method: DELETE
 * 2. URL:    http://localhost:3001/api/sessions/10
 * 3. Header: Authorization: Bearer <Token_Tutor_Hoặc_Admin>
 * 4. Body:   (Trống)
 */
router.delete('/sessions/:id', 
    verifyToken, 
    authorizeRoles('tutor', 'admin'), 
    sessionController.deleteSession
); 

module.exports = router;