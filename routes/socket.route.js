const express = require("express");
const router = express.Router();

// Import instance của io
const { io } = require("../config/socket");

// Định nghĩa route để gửi tin nhắn
router.post("/send-message", (req, res) => {
  const { roomId, message } = req.body;
  if (!roomId || !message) {
    return res.status(400).send({ success: false, message: "Invalid data" });
  }
  // Gửi tin nhắn tới tất cả trong phòng
  io.to(roomId).emit("new-message", message);
  res.send({ success: true, message: "Message sent" });
});

module.exports = router;
