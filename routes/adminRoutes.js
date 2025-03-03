const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// router.post("/checkId", adminController.checkAdminIdExists); // 아이디 중복 확인
router.post("/signup", adminController.registerAdmin); // 어드민 등록
router.post("/login", adminController.loginAdmin); // 어드민 로그인

module.exports = router;