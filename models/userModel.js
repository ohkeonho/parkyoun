const bcrypt = require("bcrypt");
const pool = require("../config/db");

class User {
  static async checkIdExists(id) {
    const [rows] = await pool.execute("SELECT COUNT(*) AS count FROM users WHERE id = ?", [id]);
    return rows[0].count > 0;
  }

  static async checkEmailExists(email) {
    try {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) AS count FROM (
          SELECT email FROM admin WHERE email = ?
          UNION 
          SELECT email FROM users WHERE email = ?
        ) AS combined`,
        [email, email]
      );
      return rows[0].count > 0;
    } catch (error) {
      throw new Error("이메일 확인 중 오류가 발생했습니다: " + error.message);
    }
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
  // 사용자 정보 가져오기 (id로)
  static async getUserById(id) {
    try {
      const query = "SELECT id, name, email, password FROM users WHERE id = ?";
      const params = [id];
      const [rows] = await pool.execute(query, params);
  
      if (rows.length === 0) {
        return null;  // 사용자 없음
      }
  
      return rows[0];  // 사용자 정보 반환
    } catch (error) {
      console.error("사용자 정보 조회 오류:", error);
      throw error;
    }
  }


  // 사용자 이메일 수정
  static async updateUserEmail(id, newEmail) {
    try {
      const query = "UPDATE users SET email = ? WHERE id = ?";
      const params = [newEmail, id];
      const [result] = await pool.execute(query, params);
      return result.affectedRows > 0; // 수정된 행이 있으면 true 반환
    } catch (error) {
      console.error("사용자 이메일 수정 오류:", error);
      throw error;
    }
  }

  // 사용자 비밀번호 수정
  static async updateUserPassword(id, newPassword) {
    try {
      const query = "UPDATE users SET password = ? WHERE id = ?";
      const params = [newPassword, id]; // 이미 해시화된 newPassword 전달
      const [result] = await pool.execute(query, params);
      return result.affectedRows > 0; // 수정된 행이 있으면 true 반환
    } catch (error) {
      console.error("사용자 비밀번호 수정 오류:", error);
      throw error;
    }
  }
  
  
  
}

module.exports = User;