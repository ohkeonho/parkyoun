require('dotenv').config();
const mysql = require('mysql2/promise');  // ✅ `promise` 버전 사용

// MySQL 연결 풀 생성 (Promise 기반)
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
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL 연결 성공");
    connection.release(); // 풀에 반환
  } catch (err) {
    console.error("MySQL 연결 실패:", err.message);
  }
})();

module.exports = pool;
