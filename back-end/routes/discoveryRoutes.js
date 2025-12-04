const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discoveryController');

// Import Middleware bảo vệ
const { verifyToken } = require('../middlewares/authMiddleware');

// ==============================================================================
// 1. XEM DANH SÁCH KHÓA HỌC (DISCOVERY)
// ==============================================================================
/**
 * @route   GET /api/discovery
 * @access  Private (Phải đăng nhập mới được xem)
 * * --- HƯỚNG DẪN TEST (Thunder Client / Postman) ---
 * 1. Method: GET
 * 2. URL:    http://localhost:3001/api/discovery
 * 3. Headers:
 * - Key:   Authorization
 * - Value: Bearer <Dán_Token_Bất_Kỳ_Vào_Đây>
 * 4. Body:   (Trống)
 */
router.get('/discovery', verifyToken, discoveryController.getDiscovery);       


// ==============================================================================
// 2. XEM CHI TIẾT GIẢNG VIÊN & LỊCH DẠY (EXPAND)
// ==============================================================================
/**
 * @route   GET /api/discovery/:tutorId
 * @desc    Xem thông tin chi tiết của một Giảng viên (Bio) và Thời khóa biểu của họ
 * @url_param :tutorId -> ID của Giảng viên muốn xem (Ví dụ: 1)
 * @access  Private (Phải đăng nhập)
 * * --- HƯỚNG DẪN TEST (Thunder Client / Postman) ---
 * 1. Method: GET
 * 2. URL:    http://localhost:3001/api/discovery/1
 * (Số 1 là ID của Tutor muốn soi)
 * 3. Headers:
 * - Key:   Authorization
 * - Value: Bearer <Dán_Token_Bất_Kỳ_Vào_Đây>
 * 4. Body:   (Trống)
 */
router.get('/discovery/:tutorId', verifyToken, discoveryController.getTutorDetails); 

module.exports = router;