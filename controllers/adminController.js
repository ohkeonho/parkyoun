const AdminService = require("../services/adminServices");

// 관리자 등록 함수
exports.registerAdmin = async (req, res) => {
  const { id, email, name, password } = req.body;

  try {
    // 어드민 등록 서비스 호출
    const result = await AdminService.registerAdmin(id, email, name, password);
    res.json({ message: "관리자 등록 성공", admin: result });
  } catch (error) {
    res.json({ error: error.message });
  }
};

// 관리자 로그인 함수
exports.loginAdmin = async (req, res) => {
  const { id, password } = req.body;

  try {
    // 아이디로 로그인 서비스 호출
    const admin = await AdminService.loginAdmin(id, password);

    // 로그인 성공, 로그인한 admin 정보만 반환
    res.json({
      message: "로그인 성공",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role, // 역할도 포함
      },
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};
