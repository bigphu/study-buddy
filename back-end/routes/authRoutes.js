const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Import bộ lọc bảo vệ (Middleware)
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// ==============================================================================
// 1. CHỨC NĂNG ĐĂNG NHẬP (LOGIN)
// ==============================================================================
/**
 * @route   POST /api/login
 * @desc    Đăng nhập để lấy Token
 * @access  Public (Ai cũng dùng được)
 * * --- HƯỚNG DẪN TEST (Thunder Client / Postman) ---
 * 1. Method: POST
 * 2. URL:    http://localhost:3001/api/login
 * 3. Body (JSON):
{
 "username": "tutor_khoa",
 "password": "1"
}
 */
router.post('/login', authController.login);


// ==============================================================================
// 2. CHỨC NĂNG LẤY DANH SÁCH USER (ADMIN ONLY)
// ==============================================================================
/**
 * @route   GET /api/user
 * @desc    Xem danh sách tất cả người dùng (Chỉ Admin mới xem được)
 * @access  Private (Admin)
 * * --- HƯỚNG DẪN TEST (Thunder Client / Postman) ---
 * 1. Method: GET
 * 2. URL:    http://localhost:3001/api/user
 * 3. Headers:
 * - Key:   Authorization
 * - Value: Bearer <Dán_Token_Của_Admin_Vào_Đây>
 * 4. Body:   (Để trống)
 */
router.get('/user', 
    verifyToken,              // Bước 1: Kiểm tra đăng nhập
    authorizeRoles('admin'),  // Bước 2: Kiểm tra phải là Admin không
    authController.getAllUsers
);

module.exports = router;