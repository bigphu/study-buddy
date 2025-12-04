const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middlewares/authMiddleware');

// TẤT CẢ các chức năng dưới đây đều YÊU CẦU ĐĂNG NHẬP
router.use(verifyToken);

// 1. Xem danh sách lịch đã đặt
// GET http://localhost:3001/api/bookings
router.get('/bookings', bookingController.getMyBookings);

// 2. Đăng ký lịch mới
// POST http://localhost:3001/api/bookings
// Body: { "sessionId": 10 }
router.post('/bookings', bookingController.bookSession);

// 3. Đổi lịch (Reschedule)
// PUT http://localhost:3001/api/bookings/:bookingId
// Body: { "newSessionId": 15 }
router.put('/bookings/:bookingId', bookingController.rescheduleBooking);

// 4. Hủy lịch
// DELETE http://localhost:3001/api/bookings/:bookingId
router.delete('/bookings/:bookingId', bookingController.cancelBooking);

module.exports = router;