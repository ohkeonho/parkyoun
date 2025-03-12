const UserService = require("../services/userServices");
const jwt = require("jsonwebtoken");
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
exports.logout = async (req, res) => {
  // 클라이언트 요청 헤더에서 authorization 토큰 추출
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // 'Bearer token'에서 토큰만 추출

  // 토큰이 없으면 401 상태 코드와 에러 메시지 응답
  if (!token) {
    return res.status(401).json({ error: "토큰이 필요합니다." });
  }

  try {
    // 로그아웃 시도 중 콘솔에 토큰 출력
    console.log("로그아웃 시도 중, 토큰:", token);
    // 로그아웃 성공 시 200 상태 코드와 성공 메시지 응답
    res.status(200).json({ message: "로그아웃 성공" });
  } catch (error) {
    // 로그아웃 중 에러 발생 시 전체 오류 콘솔 출력하고 500 상태 코드 응답
    console.error("로그아웃 오류:", error);
    res.status(500).json({ error: "로그아웃 중 오류가 발생했습니다." });
  }
};

exports.getUserInfo = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];  // 'Bearer <token>'에서 토큰 추출
  if (!token) {
    return res.status(401).json({ error: "토큰이 필요합니다." });
  }

  try {
    // 토큰 디코딩하여 사용자 정보 추출
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decoded;

    const user = await UserService.getUserInfo(id);

    if (user) {
      return res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name
      });
    } else {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error);
    return res.status(500).json({ error: "사용자 정보를 가져오는 중 오류가 발생했습니다." });
  }
};


// 이메일 수정
exports.updateEmail = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];  // 'Bearer <token>'에서 토큰 추출
  if (!token) {
    return res.status(401).json({ error: "토큰이 필요합니다." });
  }

  const { newEmail } = req.body;

  try {
    // 토큰을 통해 사용자 정보 추출
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decoded;

    if (!newEmail) {
      return res.status(400).json({ error: "이메일을 입력하세요." });
    }

    // 이메일 수정 요청 처리
    const result = await UserService.updateEmail(id, newEmail);

    if (result) {
      return res.status(200).json({ message: "이메일이 성공적으로 수정되었습니다." });
    } else {
      return res.status(400).json({ error: "이메일 수정 실패" });
    }
  } catch (error) {
    console.error("이메일 수정 오류:", error);
    return res.status(500).json({ error: "이메일을 수정하는 중 오류가 발생했습니다." });
  }
};

// 비밀번호 수정 API 엔드포인트
exports.updateUserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // 현재 비밀번호와 새 비밀번호가 모두 있는지 확인
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요." });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "토큰이 필요합니다." });
    }

    // 토큰 검증 및 사용자 ID 추출
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decoded;

    // 비밀번호 업데이트
    const result = await UserService.updateUserPassword(id, currentPassword, newPassword);

    if (result) {
      return res.status(200).json({ message: "비밀번호가 성공적으로 수정되었습니다." });
    } else {
      return res.status(400).json({ error: "비밀번호 수정 실패" });
    }
  } catch (error) {
    console.error("비밀번호 수정 오류:", error);
    return res.status(500).json({ error: "비밀번호를 수정하는 중 오류가 발생했습니다." });
  }
};
