const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

router.post("/signup", UserController.registerUser);  // 회원가입
router.post("/check-id", UserController.checkIdExists);  // 아이디 중복 체크
router.post("/send-verification-email", UserController.sendVerificationEmail);
router.post("/verify-email-code", UserController.verifyEmailCode);
router.post("/login", UserController.loginUser);  // 로그인
// 사용자 정보 가져오기 (마이페이지)
router.get("/mypage", UserController.getUserInfo);

// 이메일 수정
router.post('/update-email', UserController.updateEmail);

// 비밀번호 수정
router.post('/update-password', UserController.updateUserPassword);
module.exports = router;
