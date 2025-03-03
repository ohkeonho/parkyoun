const db = require("../config/db");
const pool = require("../config/db");


class inquiry {
    static async create(title, contents, id) {
        try {
            console.log("DB 저장 시작:", { title, contents, id });

            // `pool.execute()`로 변경 (promise 자동 지원됨)
            const [result] = await pool.execute(
                "INSERT INTO inquiry (title, contents, id, time) VALUES (?, ?, ?, NOW())",
                [title, contents, id]
            );

            console.log("DB 저장 완료:", result.insertId);
            return result.insertId;
        } catch (error) {
            console.error("DB 저장 오류:", error);
            throw error;
        }
    }
    // 모든 문의글 조회
    static async getAll() {
      const [rows] = await pool.promise().execute("SELECT * FROM inquiry");
      return rows;
    }
    // 특정 ID 또는 제목 일부로 검색
    static async getByIdOrTitle(id, title) {
      let query = "SELECT * FROM inquiry WHERE 1=1"; // 기본 쿼리
      let params = [];

      if (id) {
          query += " AND id = ?";
          params.push(id);
      }

      if (title) {
          query += " AND title LIKE ?";
          params.push(`%${title}%`);
      }

      const [rows] = await pool.promise().execute(query, params);
      return rows;
    }
    static async delete(num, id, role) {
      if (role === "admin") {
          // 관리자는 모든 글 삭제 가능
          await pool.promise().execute("DELETE FROM inquiry WHERE id = ?", [num]);
          return true;
      } else {
          // 작성자 본인만 삭제 가능
          const [result] = await pool.promise().execute(
              "DELETE FROM inquiry WHERE id = ? AND id = ?",
              [num, id]
          );
          return result.affectedRows > 0; // 삭제 성공 여부 반환
      }
    }
    static async addComment(num, id, contents) {
        try {
            console.log("🛠️ 답변 등록 요청:", { num, id, contents });

            const [result] = await pool.execute(
                "INSERT INTO comments (num, admin_id, contents) VALUES (?, ?, ?)",
                [num, id, contents]
            );

            console.log("✅ 답변 등록 완료 (ID):", result.insertId);
            return { success: true, commentId: result.insertId };
        } catch (error) {
            console.error("❌ 답변 등록 실패 (DB 오류):", error);
            return { success: false, message: "답변 등록 실패 (DB 오류)" };
        }
    }


    
}
module.exports = inquiry;