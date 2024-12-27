const Quizz = require("../../models/Quizz/quizModel");

const addQuiz = async (req, res) => {
  try {
    const { title, description, duration, questions } = req.body;

    if (
      !title ||
      !description ||
      typeof duration !== "number" ||
      duration <= 0 ||
      !Array.isArray(questions)
    ) {
      return res.status(400).json({ error: "Invalid input data" });
    }

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

    const newQuiz = new Quizz({
      title,
      description,
      duration,
      questions,
      creator: req.user.id,
    });

    await newQuiz.save();

    res
      .status(201)
      .json({ message: "Quiz added successfully!", quiz: newQuiz });
  } catch (error) {
    console.error("Error adding quiz:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem quiz có tồn tại không
    const quiz = await Quizz.findById(id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Xóa quiz
    await quiz.remove();

    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { addQuiz, deleteQuiz };
