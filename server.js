// index.js
const express = require("express");
const path = require("path");
const crypto = require('crypto');
const static = require("serve-static");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("./middlewares/session.js"); // 세션 설정 파일 경로
const pool = require("./config/db.js"); // pool.js에서 pool을 불러옴
const authRoutes = require("./routes/authRoutes.js");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes.js"); // 문의글 라우트 추가
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.use(session);

const corsOptions = {
  origin: '*',
  methods: ["GET", "POST", "DELETE", "OPTIONS", "PUT"],
  credentials: true,
};
app.use(cors(corsOptions));

// 라우트 설정
app.use("/api/admin", adminRoutes); // 관리자 관련 라우트
app.use("/api/info", authRoutes); // 인증 관련 라우트/
app.use("/api/users", userRoutes); // 사용자 관련 라우트

app.use("/api/boards", inquiryRoutes);
app.get("/", (req, res) => {
  req.session.views = (req.session.views || 0) + 1;
  console.log("세션:", req.session); // 서버 측 세션 확인
  res.send(`Views: ${req.session.views}`);
});
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
