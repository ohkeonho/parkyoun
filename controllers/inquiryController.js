const InquiryService = require("../services/inquiryServices");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/jwtConfig");
const AnswerService = require("../services/answerServices");


// 문의글 작성 API (JWT 인증 필요)
const createInquiry = async (req, res) => {
    try {
        const { title, contents } = req.body;
        const token = req.headers.authorization?.split(" ")[1];

        console.log("Received Token:", token);

        if (!token) {
            return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
            console.log("Token Verified:", decoded);
        } catch (error) {
            return res.status(401).json({ success: false, message: "유효하지 않은 토큰입니다." });
        }

        // `{ id, role }` 객체 전달 (관리자 권한을 위해 role도 포함)
        const user = { id: decoded.id, role: decoded.role };
        console.log("User from Token:", user);

        const result = await InquiryService.createInquiry(title, contents, user);

        res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
        console.error("문의글 등록 오류:", error);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};

// 기존 함수들도 동일하게 선언 방식 변경
const deleteInquiry = async (req, res) => {
    try {
        let { num } = req.params;
        const token = req.headers.authorization?.split(" ")[1];

        console.log("🔍 Received Token:", token);

        if (!token) {
            console.log("No token provided");
            return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
            console.log("Token Verified:", decoded);
        } catch (error) {
            console.log("Invalid Token:", error.message);
            return res.status(401).json({ success: false, message: "유효하지 않은 토큰입니다." });
        }

        const userId = decoded.id;
        const userRole = decoded.role;
        console.log("🆔 User ID from Token:", userId);
        console.log("🛡️ User Role:", userRole);

        num = parseInt(num);
        if (isNaN(num)) {
            return res.status(400).json({ success: false, message: "잘못된 요청: num은 숫자여야 합니다." });
        }

        const result = await InquiryService.deleteInquiry(num, userId, userRole);

        if (result.success) {
            res.status(200).json({ success: true, message: "문의글 삭제 완료" });
        } else {
            res.status(403).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error("문의글 삭제 오류:", error);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};

// 문의글 수정 API
const updateInquiry = async (req, res) => {
    try {
        const { num } = req.params;
        const { title, contents } = req.body;
        const token = req.headers.authorization?.split(" ")[1];

        console.log("🔍 Received Token:", token);

        if (!token) {
            console.log("No token provided");
            return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
            console.log("Token Verified:", decoded);
        } catch (error) {
            console.log("Invalid Token:", error.message);
            return res.status(401).json({ success: false, message: "유효하지 않은 토큰입니다." });
        }

        const userId = decoded.id;
        const userRole = decoded.role;
        console.log("🆔 User ID from Token:", userId);
        console.log("🛡️ User Role:", userRole);

        const result = await InquiryService.updateInquiry(num, title, contents, userId, userRole);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(403).json(result);
        }
    } catch (error) {
        console.error("문의글 수정 오류:", error);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};

// 문의글 검색 API
const searchInquiry = async (req, res) => {
    try {
        let { num, title } = req.query;

        if (num) {
            num = parseInt(num);
            if (isNaN(num)) {
                return res.status(400).json({ success: false, message: "잘못된 요청: num은 숫자여야 합니다." });
            }
        }

        const inquiries = await InquiryService.searchInquiry(num, title);

        if (inquiries.length > 0) {
            res.status(200).json({ success: true, inquiries });
        } else {
            res.status(404).json({ success: false, message: "해당 문의글을 찾을 수 없음" });
        }
    } catch (error) {
        console.error("문의글 검색 오류:", error);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};
//관리자 답변
const addComment = async (req, res) => {
    try {
        const { comment } = req.body;
        let { num } = req.params;
        const token = req.headers.authorization?.split(" ")[1];

        // num 디버깅 로그 추가
        console.log("관리자 답변 요청:", { num, comment });
        console.log("num의 원본 값:", num, "타입:", typeof num);

        // 숫자로 변환
        if (!isNaN(num) && num.match(/^\d+$/)) {
            num = parseInt(num, 10);
        } else {
            return res.status(400).json({ success: false, message: "잘못된 문의글 번호입니다." });
        }

        console.log("변환된 num 값:", num);

        const result = await AnswerService.addComment(num, token, comment);
        res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
        console.error("관리자 답변 등록 오류:", error);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};


// 관리자 답변 수정
const updateComment = async (req, res) => {
    try {
        const { comment } = req.body;
        const { num } = req.params;
        const token = req.headers.authorization?.split(" ")[1];

        console.log("답변 수정 요청:", { num, comment });

        const result = await AnswerService.updateComment(num, token, comment);

        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error("답변 수정 오류:", error);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};
const getAnswersByInquiry = async (req, res) => {
    try {
        const { num } = req.params;
        console.log(`문의 번호 ${num}에 대한 답변 요청`);

        const answers = await AnswerService.getAnswersByInquiry(num);

        if (!answers || answers.length === 0) {
            return res.status(404).json({ success: false, message: "답변이 없습니다." });
        }

        res.json({ success: true, answers });
    } catch (error) {
        console.error("답변 조회 오류:", error);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};
// 모든 문의글 조회 API
const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await InquiryService.getAllInquiries();
        res.status(200).json({ success: true, inquiries });
    } catch (error) {
        console.error("🔴 모든 문의글 조회 오류:", error);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};

const getInquiryDetail = async (req, res) => {
    try {
        const { num } = req.params;
        const result = await InquiryService.getInquiryDetail(num);

        console.log("🔍 백엔드 응답 데이터:", result);  // ✅ 프론트로 보내는 데이터 확인

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error("문의글 상세 조회 오류:", error);
        res.status(500).json({ success: false, message: "문의글 상세 조회 중 서버 오류가 발생했습니다." });
    }
};


// `module.exports`에 추가
module.exports = {
    getInquiryDetail,
    createInquiry,
    deleteInquiry,
    updateInquiry,
    searchInquiry,
    addComment,
    updateComment,
    getAnswersByInquiry,
    getAllInquiries  // <-- 추가됨
};
