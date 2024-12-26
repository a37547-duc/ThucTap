const mongoose = require("mongoose");

const quizzSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  questions: [
    {
      question: { type: String, required: true },
      answers: { type: [String], required: true },
      correctAnswer: { type: Number, required: true },
    },
  ],
});

// Tạo model từ schema
const Quizz = mongoose.model("Quizz", quizzSchema);

// Export model để sử dụng ở nơi khác
module.exports = Quizz;
