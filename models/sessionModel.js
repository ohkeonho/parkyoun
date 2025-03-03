const db = require("../config/db");

class Session {
    static async createSession(sessionId, userId, userRole) {
        try {
            const query = "INSERT INTO sessions (session_id, user_id, role, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())";
            const result = await db.promise().query(query, [sessionId, userId, userRole]);
            return result;
        } catch (error) {
            throw new Error("세션 생성 실패: " + error.message);
        }
    }

    static async getSessionById(sessionId) {
        try {
            const query = "SELECT * FROM sessions WHERE session_id = ?";
            const [rows] = await db.promise().query(query, [sessionId]);
            return rows[0];
        } catch (error) {
            throw new Error("세션 조회 실패: " + error.message);
        }
    }

    static async deleteSessionById(sessionId) {
        try {
            const query = "DELETE FROM sessions WHERE session_id = ?";
            const result = await db.promise().query(query, [sessionId]);
            return result;
        } catch (error) {
            throw new Error("세션 삭제 실패: " + error.message);
        }
    }
}

module.exports = Session;
