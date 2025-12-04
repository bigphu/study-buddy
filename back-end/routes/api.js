const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const authController = require('../controllers/authController');
const appController = require('../controllers/appController');

// --- Auth Routes (Public) ---
router.post('/register', authController.register);
router.post('/login', authController.login);

// --- Protected Routes (Require Token) ---
router.get('/profile', verifyToken, appController.getProfile);

router.get('/courses', verifyToken, appController.getCourses);
router.get('/courses/available', verifyToken, appController.getAvailableCourses);
router.post('/enroll', verifyToken, appController.enroll);

router.get('/sessions/all', verifyToken, appController.getAllSessions);
router.get('/sessions/:courseCode', verifyToken, appController.getSessions);
router.post('/sessions/create', verifyToken, appController.createSession);
router.post('/sessions/book', verifyToken, appController.bookSession);

router.get('/tutors', verifyToken, appController.getAllTutors); // Ensure this matches Discovery fetch

module.exports = router;