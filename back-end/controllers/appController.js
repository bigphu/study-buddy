const db = require('../config/db');

// 1. Get Profile
exports.getProfile = async (req, res) => {
  try {
    // Target user ID can be passed in query, or default to current user
    const targetId = req.query.targetId || req.user.id;
    
    const [rows] = await db.query(
      'CALL sp_get_user_profile(?, ?, ?)', 
      [req.user.id, req.user.role, targetId]
    );
    
    res.json(rows[0][0]); // Return the single profile object
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Get Courses (My Courses)
exports.getCourses = async (req, res) => {
  try {
    const [rows] = await db.query(
      'CALL sp_get_courses(?, ?)', 
      [req.user.id, req.user.role]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Enroll Student
exports.enroll = async (req, res) => {
  const { courseCode } = req.body;
  try {
    await db.query(
      'CALL sp_enroll_student(?, ?, ?)', 
      [req.user.id, req.user.role, courseCode]
    );
    res.json({ message: 'Enrollment successful' });
  } catch (error) {
    // MySQL SIGNAL errors come here
    res.status(400).json({ error: error.message });
  }
};

// 4. Get Sessions (Dashboard)
exports.getSessions = async (req, res) => {
  const { courseCode } = req.params; // /api/sessions/:courseCode
  try {
    const [rows] = await db.query(
      'CALL sp_get_sessions_by_course(?, ?, ?)', 
      [req.user.id, req.user.role, courseCode]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Create Session (Tutor Only)
exports.createSession = async (req, res) => {
  const { courseCode, startTime, endTime, title, link, type, assignMode } = req.body;
  try {
    await db.query(
      'CALL sp_create_session(?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [req.user.id, req.user.role, courseCode, startTime, endTime, title, link, type, assignMode]
    );
    res.json({ message: 'Session created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 6. Book Session (Student Only)
exports.bookSession = async (req, res) => {
  const { sessionId } = req.body;
  try {
    await db.query(
      'CALL sp_book_session(?, ?, ?)', 
      [req.user.id, req.user.role, sessionId]
    );
    res.json({ message: 'Booking successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    const [rows] = await db.query(
      'CALL sp_get_all_user_sessions(?, ?)', 
      [req.user.id, req.user.role]
    );

    res.json(rows[0]); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. Get Available Courses (Not Enrolled)
exports.getAvailableCourses = async (req, res) => {
  try {
    const [rows] = await db.query(
      'CALL sp_get_available_courses(?, ?)', 
      [req.user.id, req.user.role]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 8. Get All Tutors
exports.getAllTutors = async (req, res) => {
  try {
    const [rows] = await db.query('CALL sp_get_all_tutors()');
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};