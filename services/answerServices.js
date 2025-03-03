const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/jwtConfig");

class AnswerService {
    // 답변 등록 (관리자만 가능)
    static async addComment(num, token, comment) {
        try {
            console.log("📌 addComment 함수 호출됨! num 값 확인:", num);  // ✅ num 값 출력
            
            if (!token) {
                return { success: false, message: "로그인이 필요합니다." };
            }
    
            let decoded;
            try {
                decoded = jwt.verify(token, SECRET_KEY);
            } catch (error) {
                return { success: false, message: "유효하지 않은 토큰입니다." };
            }
    
            const userRole = decoded.role;
    
            if (userRole !== "admin") {
                return { success: false, message: "답변 작성 권한이 없습니다." };
            }
    
            num = parseInt(num, 10);
            console.log("🔍 변환된 num 값:", num);  // ✅ 변환된 num 값 확인
            
            if (isNaN(num)) {
                return { success: false, message: "잘못된 문의글 번호입니다." };
            }
    
            // ✅ 새로운 답변 저장
            const [result] = await pool.execute(
                "INSERT INTO answer (id, comment, comment_time) VALUES (?, ?, NOW())",
                [num, comment]
            );
    
            return {
                success: true,
                message: "답변이 등록되었습니다.",
                num: num,
                author: "관리자"
            };
        } catch (error) {
            console.error("답변 등록 오류:", error);
            return { success: false, message: "답변 등록 실패" };
        }
    }
        

    // 특정 문의글의 답변 조회
    static async getAnswersByInquiry(num) {
        try {
            const [answers] = await pool.promise().execute(
                "SELECT * FROM answer WHERE id = ?",
                [num]
            );
            return answers;
        } catch (error) {
            console.error("답변 조회 오류:", error);
            return [];
        }
    }

    // 답변 수정 (관리자만 가능)
    static async updateComment(num, token, comment) {
        try {
            if (!token) {
                console.log("No token provided");
                return { success: false, message: "로그인이 필요합니다." };
            }

            let decoded;
            try {
                decoded = jwt.verify(token, SECRET_KEY);
                console.log("Token Verified:", decoded);
            } catch (error) {
                console.log("Invalid Token:", error.message);
                return { success: false, message: "유효하지 않은 토큰입니다." };
            }

            const userRole = decoded.role;
            console.log("User Role:", userRole);

            if (userRole !== "admin") {
                console.log("Unauthorized: User is not an admin");
                return { success: false, message: "관리자만 수정 가능" };
            }

            // 답변 업데이트 실행
            const [result] = await pool.promise().execute(
                "UPDATE answer SET comment = ? WHERE num = ?",
                [comment, num]
            );

            return result.affectedRows
                ? { success: true, message: "수정 완료" }
                : { success: false, message: "수정 실패" };
        } catch (error) {
            console.error("답변 수정 오류:", error);
            return { success: false, message: "답변 수정 실패" };
        }
    }
}

module.exports = AnswerService;
