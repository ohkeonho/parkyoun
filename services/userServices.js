const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const { sendVerificationEmail } = require("./emailServices");  // 이메일 서비스 호출
const { emailRegex, nameRegex, passwordRegex, idRegex } = require("../models/regex");

class UserService {
  static async checkIdExists(id) {
    return await User.checkIdExists(id);
  }

  static async sendVerificationEmail(email) {
    if (!emailRegex.test(email)) throw new Error("유효한 이메일을 입력하세요.");
  
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(Date.now() + 10 * 60 * 1000);  // 10분 후 만료
  
    await User.saveVerificationCode(email, verificationCode, expiration);
  
    await sendVerificationEmail(email, verificationCode);
  
    return "인증번호가 이메일로 전송되었습니다.";
  }

  static async verifyEmailCode(email, code) {
    const isValid = await User.verifyEmailCode(email, code);
    if (!isValid) throw new Error("인증번호가 일치하지 않거나 만료되었습니다.");
    return { success: true, message: "이메일 인증 성공!" };
  }


  static async registerUser(id, email, name, password) {
    try {
      if (!idRegex.test(id)) throw new Error("아이디는 영문자로 시작하며 4~12자여야 합니다.");
      if (!emailRegex.test(email)) throw new Error("유효한 이메일을 입력하세요.");
      if (!nameRegex.test(name)) throw new Error("이름은 2자 이상이어야 합니다.");
      if (!passwordRegex.test(password)) throw new Error("비밀번호는 최소 8자 이상이어야 합니다.");

      if (await User.checkIdExists(id)) throw new Error("이미 존재하는 아이디입니다.");
      if (await User.checkEmailExists(email)) throw new Error("이미 존재하는 이메일입니다.");

      return await User.create(id, email, name, password);  // 비밀번호 해싱은 User 모델에서 처리
    } catch (error) {
      throw new Error("회원가입 중 오류 발생: " + error.message);
    }
  }

  static async loginUser(id, password) {
    try {
      const user = await User.findById(id);  // 아이디로 사용자 정보 조회
  
      if (!user) throw new Error("아이디가 존재하지 않습니다.");
  
      const isPasswordCorrect = await User.comparePassword(password, user.password);
  
      if (!isPasswordCorrect) throw new Error("비밀번호가 일치하지 않습니다.");
  
      return user;
    } catch (error) {
      throw new Error("로그인 실패: " + error.message);
    }
  }
  static async invalidateRefreshToken(token) {
    try {
      await pool.execute("DELETE FROM sessions WHERE token = ?", [token]);
    } catch (error) {
      console.error("리프레시 토큰 무효화 오류:", error.message);
      throw new Error("리프레시 토큰 무효화 중 오류가 발생했습니다.");
    }
  }
  // 사용자 정보 가져오기
  static async getUserInfo(id) {
    try {
      const user = await User.getUserById(id);
      return user;
    } catch (error) {
      console.error("사용자 정보 가져오기 오류:", error);
      throw error;
    }
  }

  
  static async updateEmail(id, newEmail) {
    try {
      // 사용자 정보 가져오기
      const user = await User.getUserById(id);
  
      // 새 이메일이 비어 있으면 기존 이메일 사용
      const emailToUpdate = newEmail || user.email;
  
      // 새 이메일이 이미 존재하는지 확인
      const emailExists = await User.checkEmailExists(emailToUpdate);
      if (emailExists) {
        throw new Error("이미 등록된 이메일입니다.");
      }

      // 이메일 수정
      const result = await User.updateUserEmail(id, emailToUpdate);
      return result;
    } catch (error) {
      console.error("이메일 수정 오류:", error);
      throw error;
    }
  }

  /// 비밀번호 수정 서비스 함수 (스태틱 메서드)
  static async updateUserPassword(id, currentPassword, newPassword) {
    try {
      // 사용자 정보 가져오기
      const user = await User.getUserById(id);
      if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      // 저장된 비밀번호가 있는지 확인
      if (!user.password) {
        throw new Error("저장된 비밀번호가 없습니다.");
      }

      // 현재 비밀번호가 일치하는지 확인
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error("현재 비밀번호가 일치하지 않습니다.");  // 비밀번호 불일치 시 오류 발생
      }

      // 새 비밀번호가 정규 표현식을 만족하는지 확인
      if (!passwordRegex.test(newPassword)) {
        throw new Error("새 비밀번호는 최소 8자 이상, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.");
      }

      // 새 비밀번호를 해시화하여 업데이트
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const result = await User.updateUserPassword(id, hashedNewPassword);
      if (!result) {
        throw new Error("비밀번호 수정 실패");
      }

      return { message: "비밀번호가 성공적으로 수정되었습니다." };

    } catch (error) {
      console.error("비밀번호 수정 오류:", error);
      throw error; // 오류가 발생하면 다시 던져서 컨트롤러에서 처리
    }
}

  

}
  

module.exports = UserService;
