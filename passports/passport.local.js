const LocalStrategy = require("passport-local").Strategy;

const bcrypt = require("bcrypt");
const User = require("../models/User/userModel");
const loginRegisterService = require("../service/loginRegisterService");

const { v4: uuidv4 } = require("uuid");
uuidv4();

module.exports = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    session: false,
  },
  async (email, password, done) => {
    try {
      const user = await loginRegisterService.handleUserLogin({
        email,
        password,
        authType: "local",
      });

      console.log(user);
      return done(null, user);
    } catch (err) {
      console.error("Đã xảy ra lỗi khi đăng nhập:", err);
      return done(err);
    }
  }
);
