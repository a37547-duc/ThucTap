const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../models/User/userModel");
const loginRegisterService = require("../service/loginRegisterService");
module.exports = new GoogleStrategy(
  {
    clientID:
      "1099081057273-2gl1202kcuhjogkrakh16ci5nk7hgvog.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "https://laptech4k.onrender.com/google/redirect", // Đảm bảo URL này khớp với Google API Console
    passReqToCallback: true,
    scope: ["profile", "email"],
  },
  async function (request, accessToken, refreshToken, profile, done) {
    try {
      // Kiểm tra email từ profile
      const email =
        profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : null;
      if (!email) {
        return done(
          new Error("Email không tồn tại trong thông tin Google"),
          null
        );
      }

      // Kiểm tra xem người dùng với email này đã tồn tại chưa
      let existingUser = await User.findOne({
        email: email,
        authType: "google",
      });

      if (existingUser) {
        let user = await loginRegisterService.upsertUserSoicalMedia({
          email: email,
          username: profile.displayName,
          _id: existingUser._id,
        });
        return done(null, user); // Trả về người dùng đã tồn tại
      } else {
        // Nếu không tồn tại, tạo tài khoản mới với thông tin từ Google
        const newUser = new User({
          googleId: profile.id,
          username: profile.displayName,
          email: email,
          authType: "google",
        });
        await newUser.save();

        let user = await loginRegisterService.upsertUserSoicalMedia({
          email: email,
          username: profile.displayName,
          _id: newUser._id,
        });

        return done(null, user);
      }
    } catch (error) {
      console.error("Lỗi xác thực Google: ", error);
      return done(error, null);
    }
  }
);
