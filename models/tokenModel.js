const mongoose = require("mongoose");

// Tạo Schema cho Token
const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Tham chiếu tới collection 'User'
      unique: true,
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // Token sẽ tự động xóa sau 3600 giây (1 giờ)
    },
  },
  {
    timestamps: true, // Thêm createdAt và updatedAt tự động
  }
);

// Xuất mô hình Token
const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;
