const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateJWT = require("../middlewares/authenticateJWT");
router.post("/login", authController.login);
router.get("/protected", authenticateJWT, (req, res) => {
  res.json({ message: "인증된 사용자만 접근 가능합니다.", user: req.user });
});
router.post("/logout", authController.logout);
router.get("/check-session", authController.checkSession);
router.post("/request-verification", authController.requestVerification);
router.post("/verify-email", authController.verifyEmail);
router.post("/verify-code", authController.verifyCode);
module.exports = router;