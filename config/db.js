require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// 연결 테스트 (비동기 방식)
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("MySQL 연결 성공");
        connection.release();
    } catch (err) {
        console.error("MySQL 연결 실패:", err.message);
    }
}

testConnection();

module.exports = pool;