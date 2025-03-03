const express = require("express");
const router = express.Router();
const InquiryController = require("../controllers/inquiryController");
const authenticateJWT = require("../middlewares/authenticateJWT"); // JWT 인증 미들웨어 적용

console.log("🔍 InquiryController 내용:", InquiryController);
console.log("🔍 InquiryController.createInquiry:", InquiryController.createInquiry);

//  문의글 작성 (로그인한 유저만 가능)
router.post("/inquiry", authenticateJWT, InquiryController.createInquiry);

// // 모든 문의글 조회 (로그인 없이 누구나 가능)
router.get("/inquiry", InquiryController.searchInquiry);

// //  특정 문의글 검색 (번호 또는 제목 일부 검색, 로그인 불필요)
router.get("/inquiry/search", InquiryController.searchInquiry);

// //  문의글 삭제 (작성자 본인만 가능, 관리자는 모든 글 삭제 가능)
router.delete("/inquiry/:num", authenticateJWT, InquiryController.deleteInquiry);

// //  문의글 수정 (작성자 본인 또는 관리자만 가능)
router.put("/inquiry/:num/edit", authenticateJWT, InquiryController.updateInquiry);

// //  답변 등록 (관리자만 가능)
router.post("/admin/inquiry/:num/comment", authenticateJWT, InquiryController.addComment);

// //  답변 수정 (관리자만 가능)
// router.put("/admin/inquiry/:num/comment/edit", authenticateJWT, InquiryController.updateComment);

module.exports = router;
