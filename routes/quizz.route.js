const express = require("express");
const router = express.Router();

const Quizz = require("../models/Quizz/quizModel");

const {
  addQuiz,
  deleteQuiz,
} = require("../controllers/quizz/quizz.controller");

const {
  checkUserJWT,
  createJWT,
  verifyToken,
} = require("../middleware/JWTAction");

router.post("/add", checkUserJWT, addQuiz);

router.get("/quizzes", async (req, res) => {
  try {
    // Lấy tất cả cácq bài quiz từ cơ sở dữ liệu
    const quizzes = await Quizz.find();

    // Trả về toàn bộ danh sách quizzes
    res.status(200).json({ quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/quizzes/:id/questions", async (req, res) => {
  try {
    // Lấy id từ params
    const quizzId = req.params.id;

    // Tìm bài Quizz dựa trên id
    const quizz = await Quizz.findById(quizzId);

    // Nếu không tìm thấy Quizz
    if (!quizz) {
      return res.status(404).json({ error: "Quizz not found" });
    }

    // Trả về danh sách câu hỏi
    res.status(200).json({ questions: quizz.questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/quizzes/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate dữ liệu đầu vào: chỉ cho phép các trường hợp lệ
    const allowedFields = ["title", "description", "duration", "questions"];
    const updateFields = Object.keys(updateData);

    // Kiểm tra các trường được gửi
    const isValidUpdate = updateFields.every((field) =>
      allowedFields.includes(field)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ error: "Invalid fields in request body" });
    }

    // Validate duration nếu có
    if (
      updateData.duration &&
      (typeof updateData.duration !== "number" || updateData.duration <= 0)
    ) {
      return res.status(400).json({ error: "Invalid duration value" });
    }

    // Validate questions nếu có
    if (updateData.questions) {
      for (let question of updateData.questions) {
        if (
          !question.question ||
          !Array.isArray(question.answers) ||
          typeof question.correctAnswer !== "number" ||
          question.correctAnswer < 0 ||
          question.correctAnswer >= question.answers.length
        ) {
          return res
            .status(400)
            .json({ error: "Invalid question format in questions array" });
        }
      }
    }

    // Thực hiện cập nhật
    const updatedQuiz = await Quizz.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // Trả về tài liệu đã cập nhật và kiểm tra hợp lệ
    );

    if (!updatedQuiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Trả về kết quả thành công
    res
      .status(200)
      .json({ message: "Quiz updated successfully!", quiz: updatedQuiz });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/quizzes/delete/:id", deleteQuiz);
module.exports = router;
