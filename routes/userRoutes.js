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

// 사용자 정보 수정하기 (아이디와 비밀번호만)
router.post("/update", UserController.updateUserInfo);
module.exports = router;
