const User = require("../models/User/userModel");
const bcrypt = require("bcrypt");
const { createJWT } = require("../middleware/JWTAction");

const { v4: uuidv4 } = require("uuid");
uuidv4();

const checkPassword = (inputPassword, hashPassword) => {
  return bcrypt.compareSync(inputPassword, hashPassword); // Trả về True / False
};

const handleUserLogin = async (rawData) => {
  try {
    console.log("XIN CHAO EMAIL:", rawData.email);
    const user = await User.findOne({
      email: rawData.email,
      authType: rawData.authType,
    });

    console.log("XIN CHAO USER", user);
    if (!user) {
      return { message: "Tài khoản không tồn tại" };
    }

    // Kiểm tra xem tài khoản đã được xác minh chưa
    if (!user.verified) {
      return {
        message:
          "Tài khoản chưa được xác minh. Vui lòng kiểm tra email để xác minh tài khoản.",
        err: "not_verified",
      };
    }
    const isCorrectPassword = checkPassword(rawData.password, user.password);

    if (!isCorrectPassword) {
      return { message: "Mật khẩu không chính xác", err: "password" };
    }

    const token = createJWT({ id: user._id });
    console.log(user._id);
    return {
      data: {
        token: token,
        email: user.email,
        username: user.username,
        role: user.role,
        verified: user.verified,
      },
    };
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return { message: "Có lỗi xảy ra trong quá trình đăng nhập" };
  }
};

const updateUserRefreshToken = async (email, token) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: email },
      { refreshToken: token },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error("Error updating refresh token:", error);
  }
};

const upsertUserSoicalMedia = async (dataRaw) => {
  try {
    const token = createJWT({ id: dataRaw._id });

    return {
      data: {
        token: token,
        email: dataRaw.email,
        username: dataRaw.username,
      },
      message: "Đăng nhập google thành công",
    };
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return { message: "Có lỗi xảy ra trong quá trình đăng nhập bằng google" };
  }
};

module.exports = {
  handleUserLogin,
  updateUserRefreshToken,
  upsertUserSoicalMedia,
};
