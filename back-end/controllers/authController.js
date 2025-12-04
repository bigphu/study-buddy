const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, password, role, fullName, academicStatus, bio } = req.body;

  try {
    // CALL sp_register_user(username, password, role, full_name, academic_status, bio)
    const [result] = await db.query(
      'CALL sp_register_user(?, ?, ?, ?, ?, ?)', 
      [username, password, role, fullName, academicStatus, bio]
    );
    
    // Result of SP is an array of arrays. The ID is in the first row set.
    const newUserId = result[0][0].new_id;
    
    res.status(201).json({ message: 'User registered', userId: newUserId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // CALL sp_login_user(username, password)
    const [rows] = await db.query('CALL sp_login_user(?, ?)', [username, password]);
    const user = rows[0][0];

    if (!user) {
      return res.status(404).json({ message: 'User not found or invalid password' });
    }

    // Generate Token containing ID and Role for RBAC
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name,
        academicStatus: user.academic_status,
        bio: user.bio
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};