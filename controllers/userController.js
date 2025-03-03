const UserService = require("../services/userServices");

exports.checkIdExists = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "아이디를 입력하세요." });

  try {
    const exists = await UserService.checkIdExists(id);
    return res.status(exists ? 400 : 200).json({ message: exists ? "이미 존재하는 아이디입니다." : "사용 가능한 아이디입니다." });
  } catch (error) {
    console.error("아이디 확인 오류:", error.message);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

exports.sendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const message = await UserService.sendVerificationEmail(email);
    res.status(200).json({ message });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyEmailCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const message = await UserService.verifyEmailCode(email, code);
    res.status(200).json({ message });
  } catch (error) {
    res.status(400).json({ error: "인증코드가 일치하지 않습니다" });
  }
};

exports.registerUser = async (req, res) => {
  const { id, email, name, password } = req.body;
  
  try {
    const user = await UserService.registerUser(id, email, name, password);
    res.status(201).json("회원가입 성공");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { id, password } = req.body;

  // 요청이 정상적으로 들어왔는지 확인
  console.log("아이디:", id);
  console.log("비밀번호:", password);

  try {
    const user = await UserService.loginUser(id, password);
    res.status(200).json({
      message: "로그인 성공",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("로그인 실패:", error.message);  // 에러 메시지 로깅
    res.status(400).json({ error: error.message });
  }
};


