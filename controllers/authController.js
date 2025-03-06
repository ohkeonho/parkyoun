const AuthService = require("../services/authServices");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

exports.login = async (req, res) => {
  const { id, password } = req.body;

  try {
    const userOrAdmin = await AuthService.login(id, password);
    if (userOrAdmin) {
      const payload = {
        id: userOrAdmin.id,
        role: userOrAdmin.role,
      };
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: "1h",
      });

      return res.status(200).json({
        message: "로그인 성공",
        token: token,
        role: userOrAdmin.role, // 역할 정보 추가
        [userOrAdmin.role === "admin" ? "admin" : "user"]: userOrAdmin,
      });
    }
    return res.status(401).json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." });
  } catch (error) {
    console.error("로그인 오류:", error);
    return res.status(500).json({ error: "로그인 처리 중 오류가 발생했습니다." });
  }
};

exports.logout = (req, res) => {
  if (req.session && req.session.token) {
    delete req.session.token; // 세션에서 토큰 제거
    req.session.save((err) => {
      if (err) {
        console.error("세션 저장 오류:", err);
        return res.status(500).json({ error: "로그아웃 실패" });
      }
      return res.status(200).json({ message: "로그아웃 되었습니다." });
    });
  } else {
    return res.status(200).json({ message: "로그아웃 되었습니다." });
  }
};

exports.checkSession = (req, res) => {
  if (req.session && req.session.username) {
    res.send(`세션이 존재합니다. 사용자: ${req.session.username}`);
  } else {
    res.send("세션이 존재하지 않습니다.");
  }
};

exports.requestVerification = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await AuthService.sendVerificationEmail(email);
    return res.status(200).json({ message: result });
  } catch (error) {
    console.error("이메일 인증 오류:", error);  // 오류 로그
    return res.status(400).json({ error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  console.log("이메일:", email);
  console.log("인증 코드:", code);

  if (!email || !code) {
    return res.status(400).json({ error: "이메일과 인증코드를 입력하세요." });
  }

  try {
    const result = await AuthService.verifyEmailCode(email, code);
    return res.status(200).json({ message: result });
  } catch (error) {
    console.error("인증 오류:", error);  // 오류 로그
    return res.status(400).json({ error: error.message });
  }
};


exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const result = await AuthService.verifyEmailCode(email, code);
    return res.status(200).json({ message: result });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
