const pool = require("../config/db");
const Inquiry = require("../models/inquiryModel");
const { SECRET_KEY } = require("../config/jwtConfig"); // JWT 설정 파일 사용
const jwt = require("jsonwebtoken"); 
console.log("🔑 SECRET_KEY in InquiryService:", SECRET_KEY); // SECRET_KEY 값 확인

class InquiryService {
    // 문의글 등록 (JWT 인증 필요)
    static async createInquiry(title, contents, user) {  // user 객체 직접 사용
        try {
            if (!user) {
                return { success: false, message: "로그인이 필요합니다." };
            }

            console.log("✅ User from Middleware:", user); // user 객체 로그

            const id = user.id;  // user 객체에서 id 가져오기
            console.log("👤 User ID (DB 저장할 ID):", id);

            // 문의글 등록
            try {
                console.log("🔍 문의글 저장 요청:", { title, contents, id });
                const inquiryNum = await Inquiry.create(title, contents, id);
                console.log("✅ 저장된 문의글 번호:", inquiryNum);
                return { success: true, num: inquiryNum };
            } catch (error) {
                console.error("❌ 문의글 저장 실패 (DB 오류):", error);
                return { success: false, message: "문의글 등록 실패 (DB 오류)" };
            }
        } catch (error) {
            console.error("❌ 문의글 생성 오류 (기타 오류):", error);
            return { success: false, message: "문의글 등록 실패 (서버 오류)" };
        }
    }

    // 모든 문의글 조회
    static async getAllInquiries() {
        try {
            const inquiries = await Inquiry.getAll();
            return inquiries;
        } catch (error) {
            console.error("문의글 조회 오류:", error);
            return [];
        }
    }

    // 특정 문의글 조회 (번호 또는 제목 일부 검색)
    static async searchInquiry(num, title) {
        try {
            const inquiries = await Inquiry.getByNumOrTitle(num, title);
            return inquiries;
        } catch (error) {
            console.error("문의글 검색 오류:", error);
            return [];
        }
    }

    // 문의글 삭제 (JWT 인증 필요)
    static async deleteInquiry(num, token) {
        try {
            if (!token) {
                return { success: false, message: "로그인이 필요합니다." };
            }

            let decoded;
            try {
                decoded = jwt.verify(token, SECRET_KEY);
            } catch (err) {
                return { success: false, message: "유효하지 않은 토큰입니다." };
            }

            const userId = decoded.id;
            const userRole = decoded.role;

            const deleted = await Inquiry.delete(num, userId, userRole);
            return deleted
                ? { success: true, message: "문의글 삭제 완료" }
                : { success: false, message: "삭제 권한 없음" };

        } catch (error) {
            console.error("문의글 삭제 오류:", error);
            return { success: false, message: "문의글 삭제 실패" };
        }
    }

    // 문의글 수정 (JWT 인증 필요)
    static async updateInquiry(num, title, contents, token) {
        try {
            if (!token) {
                return { success: false, message: "로그인이 필요합니다." };
            }

            let decoded;
            try {
                decoded = jwt.verify(token, SECRET_KEY);
            } catch (err) {
                return { success: false, message: "유효하지 않은 토큰입니다." };
            }

            const userId = decoded.id;
            const userRole = decoded.role;

            // 현재 문의글의 작성자 확인
            const [inquiry] = await pool.promise().execute(
                "SELECT id FROM inquiry WHERE num = ?",
                [num]
            );

            if (!inquiry.length) {
                return { success: false, message: "문의글을 찾을 수 없음" };
            }

            const authorId = inquiry[0].id;

            // 작성자 또는 관리자인지 확인
            if (authorId !== userId && userRole !== "admin") {
                return { success: false, message: "수정 권한이 없음" };
            }

            // 문의글 업데이트 실행
            const [result] = await pool.promise().execute(
                "UPDATE inquiry SET title = ?, contents = ? WHERE num = ?",
                [title, contents, num]
            );

            return result.affectedRows
                ? { success: true, message: "수정 완료" }
                : { success: false, message: "수정 실패" };
        } catch (error) {
            console.error("문의글 수정 오류:", error);
            return { success: false, message: "문의글 수정 실패" };
        }
    }
}

module.exports = InquiryService;
