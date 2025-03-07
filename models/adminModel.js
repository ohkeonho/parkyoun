const { emailRegex, nameRegex, passwordRegex } = require("../models/regex"); // 정규식 가져오기
const pool = require("../config/db");
const bcrypt = require("bcrypt");

class Admin {
  // 이메일로 관리자 존재 여부 확인
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


  // 아이디로 관리자 존재 여부 확인
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM admin WHERE id = ?",
        [id]
      );
      return rows[0] || null; // 관리자 정보가 없으면 null 반환
    } catch (error) {
      throw new Error("아이디로 로그인 중 오류가 발생했습니다: " + error.message);
    }
  }

  // 아이디 중복 여부 확인
  static async checkIdExists(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT COUNT(*) AS count FROM admin WHERE id = ?",
        [id]
      );
      return rows[0].count > 0;
    } catch (error) {
      throw new Error("아이디 확인 중 오류가 발생했습니다: " + error.message);
    }
  }

  // 관리자 등록 (사용자가 입력한 ID로 저장)
  static async create(id, email, name, password) {
    try {
      // 이메일 형식 검사
      if (!emailRegex.test(email)) {
        throw new Error("유효한 이메일 주소를 입력하세요.");
      }

      // 비밀번호 해싱 처리 (여기서만 해싱)
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("해싱된 비밀번호:", hashedPassword);  // 해싱된 비밀번호 출력

      // 관리자 생성 (role은 'admin'으로 설정)
      const [result] = await pool.execute(
        "INSERT INTO admin (id, email, name, password, role, created_date) VALUES (?, ?, ?, ?, 'admin', NOW())",
        [id, email, name, hashedPassword]
      );

      return result;
    } catch (error) {
      throw new Error("어드민 등록 중 오류가 발생했습니다: " + error.message);
    }
  }

  // 이메일로 관리자 정보 가져오기 (로그인용)
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM admin WHERE email = ?", // 이메일로 관리자 정보 찾기
        [email]
      );
      return rows[0] || null; // 관리자 정보가 없으면 null 반환
    } catch (error) {
      throw new Error("이메일로 로그인 중 오류가 발생했습니다: " + error.message);
    }
  }
}

module.exports = Admin;
