const express = require("express");
const router = express.Router();

const User = require("../../models/User/userModel");

const InvalidToken = require("../../models/invalidTokenModel");

const bcrypt = require("bcrypt");

const {
  Register,
  verifyAccount,

  //
  authenticateLocal,
} = require("../../controllers/user/user.controller");
////////////////////////

// const { sendEmail } = require("../../service/emailService");

const {
  checkUserJWT,
  createJWT,
  verifyToken,
} = require("../../middleware/JWTAction");
const { checkRoles } = require("../../middleware/auth.middleare");

router.post("/register", Register); // Đăng ký
router.post("/login", authenticateLocal); // Đăng nhập

router.get("/:id/verify/:token/", verifyAccount);

module.exports = router;
