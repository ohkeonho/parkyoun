const bcrypt = require("bcrypt");
const pool = require("../config/db");

class User {
  static async checkIdExists(id) {
    const [rows] = await pool.execute("SELECT COUNT(*) AS count FROM users WHERE id = ?", [id]);
    return rows[0].count > 0;
  }

  static async checkEmailExists(email) {
    const [rows] = await pool.execute("SELECT COUNT(*) AS count FROM users WHERE email = ?", [email]);
    return rows[0].count > 0;
  }

  static async create(id, email, name, password) {
    const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해싱
    const [result] = await pool.execute(
      "INSERT INTO users (id, email, name, password, role, created_date, is_verified) VALUES (?, ?, ?, ?, 'user', NOW(), 1)",
      [id, email, name, hashedPassword]
    );
    return result;
  }
  
  static async saveVerificationCode(email, code, expiration) {
    await pool.execute(
        "REPLACE INTO verification_codes (email, code, expiration) VALUES (?, ?, ?)",
        [email, code, expiration]
    );
}

static async verifyEmailCode(email, code) {
    const [rows] = await pool.execute(
        "SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expiration > NOW()",
        [email, code]
    );
    if (rows.length > 0) {
        await pool.execute("DELETE FROM verification_codes WHERE email = ?", [email]); // 인증 성공 후 삭제
        await pool.execute("UPDATE users SET is_verified = 1 WHERE email = ?", [email]);
        return true;
    }
    return false;
}

  static async findByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0]; // 이메일이 일치하는 첫 번째 사용자 반환
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0]; // 아이디가 일치하는 첫 번째 사용자 반환
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword); // 비밀번호 비교
  }
}

module.exports = User;