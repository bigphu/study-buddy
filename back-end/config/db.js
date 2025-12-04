// db.config.js
require('dotenv').config(); // Đảm bảo biến môi trường đã được đọc
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // Thêm dòng này phòng khi DB không chạy ở cổng mặc định
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// (Tùy chọn) Kiểm tra kết nối ngay khi khởi động
pool.getConnection()
    .then(conn => {
        console.log("Database connected successfully!");
        conn.release(); // Trả lại kết nối cho pool
    })
    .catch(err => {
        console.error("Database connection failed: ", err.message);
    });

module.exports = pool;