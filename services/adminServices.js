const Admin = require("../models/adminModel");
const { emailRegex, nameRegex, passwordRegex } = require("../models/regex"); // 정규식 가져오기
const bcrypt = require("bcrypt");
class AdminService {
  // 관리자 등록
  static async registerAdmin(id, email, name, password) {
    try {
      // 필드 유효성 검사
      AdminService.validateAdminFields(email, name, password);

      // 이메일 중복 확인
      const emailExists = await Admin.checkEmailExists(email);
      if (emailExists) {
        throw new Error("이미 존재하는 이메일입니다.");
      }

      // 아이디 중복 확인
      const idExists = await Admin.checkIdExists(id);
      if (idExists) {
        throw new Error("이미 존재하는 아이디입니다.");
      }

      // 어드민 생성 (비밀번호는 모델에서 해싱 처리됨)
      return await Admin.create(id, email, name, password); // 이미 해시된 비밀번호 사용
    } catch (error) {
      throw new Error("관리자 등록 중 오류 발생: " + error.message);
    }
  }

  static async loginAdmin(id, password) {
    if (!id || !password) {
      throw new Error("아이디와 비밀번호는 필수 항목입니다.");
    }

    try {
      // 아이디로 관리자 정보 가져오기
      const admin = await Admin.findById(id);
      if (!admin) {
        throw new Error("등록되지 않은 아이디입니다.");
      }

      // 입력된 비밀번호와 해시된 비밀번호 비교
      console.log("입력된 비밀번호:", password);
      console.log("저장된 비밀번호 (해시):", admin.password);  // 해시된 비밀번호 확인

      // bcrypt.compare()로 비교
      const isMatch = await bcrypt.compare(password, admin.password);
      console.log("비밀번호 일치 여부:", isMatch); // true이면 비밀번호 일치

      if (!isMatch) {
        throw new Error("비밀번호가 일치하지 않습니다.");
      }

      // 로그인 성공, 어드민 정보 반환
      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: "admin", // 역할 구분
      };
    } catch (error) {
      throw new Error("로그인 중 오류 발생: " + error.message);
    }
  }

  // 유효성 검사 메서드
  static validateAdminFields(email, name, password) {
    if (!emailRegex.test(email)) {
      throw new Error("유효한 이메일 주소를 입력하세요.");
    }
    if (!nameRegex.test(name)) {
      throw new Error("이름은 한글 또는 영문자 2자 이상이어야 합니다.");
    }
    if (!passwordRegex.test(password)) {
      throw new Error(
        "비밀번호는 최소 8자 이상, 대문자, 소문자, 숫자, 특수 문자를 포함해야 합니다."
      );
    }
  }
}

module.exports = AdminService;
