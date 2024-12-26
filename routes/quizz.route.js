const express = require("express");
const router = express.Router();

const Quizz = require("../models/Quizz/quizModel");

// router.post("/add");

// router.post("/add", async (req, res) => {
//   try {
//     // Lấy dữ liệu từ request body
//     const { title, description, questions } = req.body;

//     // Validate dữ liệu đầu vào
//     if (!title || !description || !Array.isArray(questions)) {
//       return res.status(400).json({ error: "Invalid input data" });
//     }

//     // Kiểm tra từng câu hỏi
//     for (let question of questions) {
//       if (
//         !question.question ||
//         !Array.isArray(question.answers) ||
//         typeof question.correctAnswer !== "number" ||
//         question.correctAnswer < 0 ||
//         question.correctAnswer >= question.answers.length
//       ) {
//         return res
//           .status(400)
//           .json({ error: "Invalid question format in questions array" });
//       }
//     }

//     // Tạo một instance của Quiz model
//     const newQuiz = new Quizz({
//       title,
//       description,
//       questions,
//     });

//     // Lưu quiz vào database
//     await newQuiz.save();

//     // Trả về kết quả thành công
//     res
//       .status(201)
//       .json({ message: "Quiz added successfully!", quiz: newQuiz });
//   } catch (error) {
//     console.error("Error adding quiz:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

router.post("/add", async (req, res) => {
  try {
    // Lấy dữ liệu từ request body
    const { title, description, duration, questions } = req.body;

    // Validate dữ liệu đầu vào
    if (
      !title ||
      !description ||
      typeof duration !== "number" || // Kiểm tra duration phải là một số
      duration <= 0 || // Duration phải lớn hơn 0
      !Array.isArray(questions)
    ) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Kiểm tra từng câu hỏi
    for (let question of questions) {
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

    // Tạo một instance của Quiz model
    const newQuiz = new Quizz({
      title,
      description,
      duration, // Thêm duration vào instance
      questions,
    });

    // Lưu quiz vào database
    await newQuiz.save();

    // Trả về kết quả thành công
    res
      .status(201)
      .json({ message: "Quiz added successfully!", quiz: newQuiz });
  } catch (error) {
    console.error("Error adding quiz:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/quizzes", async (req, res) => {
  try {
    // Lấy tất cả các bài quiz từ cơ sở dữ liệu
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
module.exports = router;
