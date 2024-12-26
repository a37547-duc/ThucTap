const User = require("../../models/User/userModel");

const Token = require("../../models/tokenModel");
const mongoose = require("mongoose");
const { createJWT } = require("../../middleware/JWTAction");
const { sendEmail } = require("../../service/emailService");

const axios = require("axios");

//
const bcrypt = require("bcrypt");
const passportLocal = require("../../passports/passport.local");
const passport = require("passport");
passport.use("local", passportLocal);

const authenticateLocal = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    console.log("ĐÂY LÀ THÔNG TIN BÊN USER: ", user);

    if (user.err) {
      return res.status(400).json({
        status: "Thất bại khi xác thực",
        message: user.message,
      });
    }

    if (err) {
      return res.status(500).json({
        status: "Thất bại khi xác thực",
        message: "Có lỗi xảy ra trong quá trình xác thực",
        error: err,
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "Thất bại đăng nhập",
        message: info ? info.message : "Đăng nhập không thành công",
      });
    }

    console.log("TEST USER:", user);

    return res.json({
      message: user.message,
      user: user.data,
    });
  })(req, res, next);
};

const Register = async (req, res) => {
  try {
    const { username, email, authType, password, recaptchaToken } = req.body;

    // // 1. Xác minh reCAPTCHA token với Google
    // const secretKey = "6Lda6J0qAAAAACmkCzHy6MU7_XAkhJZp0szspvTs"; // Key bí mật từ Google reCAPTCHA
    // const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";

    // const googleResponse = await axios.post(verifyUrl, null, {
    //   params: {
    //     secret: secretKey,
    //     response: recaptchaToken,
    //   },
    // });
    // console.log("THÔNG TIN TỪ GOOGLE: ", googleResponse);
    // if (!googleResponse.data.success) {
    //   return res.status(400).json({ message: "Xác minh reCAPTCHA thất bại" });
    // }

    // 2. Kiểm tra người dùng đã tồn tại
    const existingUser = await User.findOne({
      email: email,
      authType: authType,
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng." });
    }

    // 3. Hash mật khẩu và tạo người dùng mới
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username,
      email: email,
      authType: authType,
      password: hashedPassword,
    });

    // 4. Tạo token để xác minh tài khoản
    const payload = { userId: newUser._id };
    const jwtToken = createJWT(payload);

    const token = new Token({
      userId: newUser._id,
      token: jwtToken,
    });

    // 5. Lưu token và người dùng vào database
    await token.save();
    await newUser.save();

    // 6. Gửi email xác minh tài khoản
    const url = `http://localhost:5050/users/${newUser._id}/verify/${jwtToken}`;
    const data = {
      email: newUser.email,
      url: url,
    };

    await sendEmail(data, "verify");

    res.json({
      message: "Vui lòng kiểm tra email để xác minh tài khoản",
      token: jwtToken,
    });
  } catch (error) {
    console.error("Đăng ký thất bại:", error);
    res.status(500).json({ message: "Có lỗi xảy ra", error: error.message });
  }
};

const verifyAccount = async (req, res) => {
  try {
    console.log("ID từ params:", req.params.id);
    console.log("Token từ params:", req.params.token);

    // Kiểm tra định dạng ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Tìm người dùng
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).json({ message: "Invalid link" });

    // Kiểm tra nếu người dùng đã xác minh
    if (user.verified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    // Tìm token xác minh
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).json({ message: "Invalid link" });

    // Cập nhật trạng thái xác minh
    await User.updateOne({ _id: user._id }, { $set: { verified: true } });

    // Xóa token sau khi sử dụng
    await Token.deleteOne({ _id: token._id });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  Register,
  verifyAccount,

  authenticateLocal,
};
