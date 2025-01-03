const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
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

router.get("/quizzes/user", checkUserJWT, async (req, res) => {
  try {
    // Lấy quizzes của creator dựa vào id người dùng (req.user.id)
    const quizzes = await Quizz.find({ creator: req.user.id });

    // Nếu không có quiz nào, trả về thông báo
    if (quizzes.length === 0) {
      return res
        .status(404)
        .json({ message: "No quizzes found for this creator" });
    }

    // Trả về danh sách quizzes của creator
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

router.patch("/quizzes/:quizId/questions/:questionId", async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const { question, answers, correctAnswer } = req.body;

    // Tìm quiz
    const quiz = await Quizz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Tìm câu hỏi
    const questionToUpdate = quiz.questions.id(questionId);

    if (!questionToUpdate) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Cập nhật các trường
    if (question) questionToUpdate.question = question;
    if (Array.isArray(answers)) questionToUpdate.answers = answers;
    if (typeof correctAnswer === "number") {
      if (correctAnswer < 0 || correctAnswer >= answers.length) {
        return res.status(400).json({ error: "Invalid correctAnswer index" });
      }
      questionToUpdate.correctAnswer = correctAnswer;
    }

    // Lưu quiz
    await quiz.save();

    res.status(200).json({ message: "Question updated successfully", quiz });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/quizzes/:quizId/questions", async (req, res) => {
  const { quizId } = req.params;
  const { question, answers, correctAnswer } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!question || !answers || correctAnswer === undefined) {
    return res.status(400).json({ message: "Thiếu thông tin câu hỏi." });
  }

  try {
    // Tìm bài kiểm tra bằng quizId
    const quiz = await Quizz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra." });
    }

    // Tạo câu hỏi mới
    const newQuestion = {
      question,
      answers,
      correctAnswer,
      _id: new mongoose.Types.ObjectId(), // Tự tạo ObjectId mới cho câu hỏi
    };

    // Thêm câu hỏi vào mảng questions
    quiz.questions.push(newQuestion);

    // Lưu thay đổi
    await quiz.save();

    // Trả về kết quả thành công
    res.status(200).json({
      message: "Question added successfully",
      quiz,
    });
  } catch (error) {
    console.error("Lỗi khi thêm câu hỏi:", error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại sau." });
  }
});

module.exports = router;
