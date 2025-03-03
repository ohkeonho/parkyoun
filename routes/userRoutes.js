const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

router.post("/signup", UserController.registerUser);  // 회원가입
router.post("/check-id", UserController.checkIdExists);  // 아이디 중복 체크
router.post("/send-verification-email", UserController.sendVerificationEmail);
router.post("/verify-email-code", UserController.verifyEmailCode);
router.post("/login", UserController.loginUser);  // 로그인

module.exports = router;
