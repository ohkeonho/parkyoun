const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "0309"; // .env 값이 없으면 "0309" 사용

// JWT 토큰 생성 함수
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    SECRET_KEY,
    { expiresIn: "1d" } // 1일 만료
  );
};

module.exports = { generateToken, SECRET_KEY };
