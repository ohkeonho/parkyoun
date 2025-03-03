const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "0309";

const authenticateJWT = (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    console.log("🛑 Received Authorization Header:", authHeader);
    console.log("🔑 Extracted Token:", token);

    if (!token) {
        return res.status(403).json({ error: "토큰이 필요합니다." });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error("⛔ JWT 검증 오류:", err.message);
            return res.status(403).json({ error: `유효하지 않은 토큰: ${err.message}` });
        }

        console.log("✅ Token Verified (Middleware):", user);
        req.user = user;  // 검증된 사용자 정보를 req.user에 저장
        next();
    });
};

module.exports = authenticateJWT;
