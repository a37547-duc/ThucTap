const mongoose = require("mongoose");

const invalidTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const InvalidToken = mongoose.model("InvalidToken", invalidTokenSchema);
module.exports = InvalidToken;
