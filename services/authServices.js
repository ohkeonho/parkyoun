const AuthModel = require("../models/authModel");
const { sendVerificationEmail } = require("../services/emailServices");  // 수정된 부분
const crypto = require('crypto');

class AuthService {
  static async login(id, password) {
    try {
      let user = await AuthModel.findUserById(id);
      if (user && (await AuthModel.comparePassword(password, user.password))) {
        return { ...user, role: "user" };
      }

      let admin = await AuthModel.findAdminById(id);
      if (admin && (await AuthModel.comparePassword(password, admin.password))) {
        return { ...admin, role: "admin" };
      }

      return null;
    } catch (error) {
      console.error("로그인 오류:", error);
      throw error;
    }
  }

  // ✅ 인증번호 이메일 발송
  static async sendVerificationEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error("유효한 이메일을 입력하세요.");

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(Date.now() + 10 * 60 * 1000);

    await AuthModel.saveVerificationCode(email, verificationCode, expiration);
    await sendVerificationEmail(email, verificationCode);  // 이메일 발송 함수

    return "인증번호가 이메일로 전송되었습니다.";
  }

  // ✅ 인증번호 검증
  static async verifyEmailCode(email, code) {
    const isValid = await AuthModel.verifyEmailCode(email, code);
    if (!isValid) throw new Error("인증번호가 일치하지 않거나 만료되었습니다.");
  
    // 임시 비밀번호 생성 후 DB에 저장
    const tempPassword = crypto.randomBytes(4).toString("hex");
    const updated = await AuthModel.updatePassword(email, tempPassword);
    if (!updated) throw new Error("비밀번호 변경 실패");
  
    return `이메일 인증 성공! 임시 비밀번호는 ${tempPassword} 입니다.`;
  }
}  

module.exports = AuthService;
