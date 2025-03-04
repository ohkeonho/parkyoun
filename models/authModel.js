const bcrypt = require("bcrypt");
const pool = require("../config/db");

class AuthModel {
  static async findUserById(id) {
    try {
      const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
      return rows[0] || null;
    } catch (error) {
      console.error("AuthModel.findUserById 오류:", error);
      throw error;
    }
  }

  static async findAdminById(id) {
    try {
      const [rows] = await pool.execute("SELECT * FROM admin WHERE id = ?", [id]);
      return rows[0] || null;
    } catch (error) {
      console.error("AuthModel.findAdminById 오류:", error);
      throw error;
    }
  }
  
  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = AuthModel;