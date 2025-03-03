const AuthModel = require("../models/authModel");

class AuthService {
  static async login(id, password) {
    try {
      let user = await AuthModel.findUserById(id);
      if (user && (await AuthModel.comparePassword(password, user.password))) {
        return { ...user, role: "user" };
      }

      let admin = await AuthModel.findAdminById(id);
      if (admin && (await AuthModel.comparePassword(password, admin.password))) {
        return { ...admin, role: "admin" };
      }

      return null;
    } catch (error) {
      console.error("로그인 오류:", error);
      throw error;
    }
  }
}

module.exports = AuthService;