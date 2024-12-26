const User = require("../models/User/userModel");

const checkRoles = (allowedRoles) => async (req, res, next) => {
  try {
    // Lấy userId từ `req.user` (được gắn bởi middleware JWT)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Truy vấn cơ sở dữ liệu để lấy vai trò của người dùng
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra vai trò của người dùng
    console.log("Vai trò của người dùng:", user.role);
    if (!allowedRoles.includes(user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not have access" });
    }

    // Vai trò hợp lệ, tiếp tục xử lý
    next();
  } catch (error) {
    console.error("Error in checkRoles middleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { checkRoles };
