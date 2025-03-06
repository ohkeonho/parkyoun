const bcrypt = require("bcrypt");
const pool = require("../config/db");

class AuthModel {
  static async findUserById(id) {
    try {
      const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
      return rows[0] || null;
    } catch (error) {
      console.error("AuthModel.findUserById 오류:", error);
      throw error;
    }
  }

  static async findAdminById(id) {
    try {
      const [rows] = await pool.execute("SELECT * FROM admin WHERE id = ?", [id]);
      return rows[0] || null;
    } catch (error) {
      console.error("AuthModel.findAdminById 오류:", error);
      throw error;
    }
  }
  
  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // ✅ 인증번호 저장
static async saveVerificationCode(email, code, expiration) {
  try {
    const [existing] = await pool.execute(
      "SELECT * FROM verification_codes WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      await pool.execute(
        "UPDATE verification_codes SET code = ?, expiration = ? WHERE email = ?",
        [code, expiration, email]
      );
    } else {
      await pool.execute(
        "INSERT INTO verification_codes (email, code, expiration) VALUES (?, ?, ?)",
        [email, code, expiration]
      );
    }

    return true;
  } catch (error) {
    console.error("인증번호 저장 오류:", error);  // 오류 로그
    throw error;
  }
}

// ✅ 인증번호 확인 
static async verifyEmailCode(email, code) {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expiration > NOW()",
      [email, code]
    );

    // 인증 코드가 맞으면 해당 인증 코드 삭제
    if (rows.length > 0) {
      await pool.execute(
        "DELETE FROM verification_codes WHERE email = ? AND code = ?",
        [email, code]
      );
      return true;  // 인증 성공
    } else {
      return false;  // 인증 실패 (유효하지 않거나 만료된 코드)
    }
  } catch (error) {
    console.error("인증번호 확인 오류:", error);  // 오류 로그
    throw error;
  }
}
static async updatePassword(email, newPassword) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );

    return true;
  } catch (error) {
    console.error("비밀번호 업데이트 오류:", error);
    throw error;
  }
}
  
}

module.exports = AuthModel;