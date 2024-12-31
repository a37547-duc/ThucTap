// const Quizz = require("../../models/Quizz/quizModel");
// // Bộ nhớ tạm để lưu thông tin các phòng chơi
// const games = {};

// module.exports = (socket, io) => {
//   // Tạo game
//   socket.on("create-game", async ({ gameId, idgame }) => {
//     try {
//       // Lấy thời gian làm bài từ collection dựa trên `idgame`
//       const quizzData = await Quizz.findOne({ _id: idgame });
//       if (!quizzData) {
//         socket.emit("error", "Quiz not found!");
//         return;
//       }

//       const duration = quizzData.duration; // Thời gian làm bài từ DB
//       console.log("THONG TIN SERVER: ", duration);
//       games[gameId] = {
//         gameId,
//         idgame,
//         players: [],
//         admin: socket.id,
//         duration, // Lưu thời gian làm bài
//         startTime: null, // Thời gian bắt đầu
//         status: "waiting",
//       };

//       socket.join(gameId);
//       io.to(gameId).emit("game-updated", games[gameId]);
//     } catch (error) {
//       console.error("Error creating game:", error);
//       socket.emit("error", "An error occurred while creating the game!");
//     }
//   });

//   // Tham gia game
//   socket.on("join-game", ({ gameId, username }) => {
//     const game = games[gameId];
//     if (game) {
//       game.players.push({ id: socket.id, username });
//       socket.join(gameId);
//       io.to(gameId).emit("game-updated", game);
//     } else {
//       socket.emit("error", "Game not found!");
//     }
//   });

//   // Bắt đầu game
//   socket.on("start-game", (gameId) => {
//     const game = games[gameId];
//     if (game) {
//       game.status = "playing";
//       game.startTime = Date.now(); // Lưu thời gian bắt đầu

//       io.to(gameId).emit("start-game", {
//         gameId,
//         url: `/game/${gameId}/play`,
//       });

//       io.to(gameId).emit("game-updated", game);
//     } else {
//       socket.emit("error", "Game not found!");
//     }
//   });

//   // Phát câu hỏi khi người chơi yêu cầu
//   socket.on("play-game", async (gameId) => {
//     const game = games[gameId];
//     if (!game) {
//       socket.emit("error", "Game not found!");
//       return;
//     }

//     try {
//       const quizzData = await Quizz.findOne({ _id: game.idgame });
//       if (!quizzData) {
//         socket.emit("error", "Questions not found for this game!");
//         return;
//       }

//       const currentTime = Date.now();
//       const elapsedTime = Math.floor((currentTime - game.startTime) / 1000); // Thời gian đã trôi qua (giây)
//       const remainingTime = Math.max(0, game.duration - elapsedTime);

//       socket.emit("game-questions", {
//         questions: quizzData.questions,
//         duration: remainingTime, // Gửi thời gian còn lại
//       });
//     } catch (error) {
//       console.error("Error fetching questions:", error);
//       socket.emit("error", "An error occurred while fetching questions!");
//     }
//   });

//   // Nộp bài
//   socket.on("submit-answers", async ({ gameId, answers, username }) => {
//     const game = games[gameId];
//     if (!game) {
//       socket.emit("error", "Game not found!");
//       return;
//     }

//     const player = game.players.find((p) => p.username === username);
//     if (!player) {
//       socket.emit("error", "Player not found!");
//       return;
//     }

//     if (player.hasSubmitted) {
//       socket.emit("already-submitted", {
//         message: "You have already submitted your answers!",
//       });
//       return;
//     }

//     try {
//       const quizzData = await Quizz.findOne({ _id: game.idgame });
//       if (!quizzData) {
//         socket.emit("error", "Questions not found for this game!");
//         return;
//       }

//       let correctAnswersCount = 0;
//       quizzData.questions.forEach((question, index) => {
//         if (answers[index] === question.correctAnswer) {
//           correctAnswersCount += 1;
//         }
//       });

//       player.score = correctAnswersCount;
//       player.hasSubmitted = true;

//       socket.emit("game-result", {
//         your_answers: answers,
//         correctAnswersCount,
//         totalQuestions: quizzData.questions.length,
//         message: `You got ${correctAnswersCount} out of ${quizzData.questions.length} correct!`,
//       });

//       io.to(gameId).emit("game-updated", game);
//     } catch (error) {
//       console.error("Error submitting answers:", error);
//       socket.emit("error", "An error occurred while submitting answers!");
//     }
//   });

//   socket.on("send-game-summary", (gameId) => {
//     const game = games[gameId]; // Lấy thông tin game

//     if (!game) {
//       socket.emit("error", "Game not found!");
//       return;
//     }

//     // Chuẩn bị thông tin tóm tắt
//     const summary = {
//       gameId: game.gameId,
//       idgame: game.idgame,
//       players: game.players.map((player) => ({
//         username: player.username,
//         score: player.score || 0,
//         hasSubmitted: player.hasSubmitted || false,
//       })),
//       playersCount: game.players.length,
//       status: game.status,
//       duration: game.duration,
//       admin: game.admin,
//     };

//     console.log("Tóm tắt đã được gửi bởi: ", socket.id);

//     // Phát tóm tắt tới tất cả mọi người trong phòng, bao gồm admin
//     io.emit("game-summary", summary);
//   });

//   socket.on("disconnect", () => {
//     console.log(`User disconnected: ${socket.id}`);
//   });
// };

const Quizz = require("../../models/Quizz/quizModel");
// Bộ nhớ tạm để lưu thông tin các phòng chơi
const games = {};

module.exports = (socket, io) => {
  // Tạo game
  socket.on("create-game", async ({ gameId, idgame }) => {
    try {
      const quizzData = await Quizz.findOne({ _id: idgame });
      if (!quizzData) {
        socket.emit("error", "Quiz not found!");
        return;
      }

      const duration = quizzData.duration;
      games[gameId] = {
        gameId,
        idgame,
        players: [],
        admin: socket.id,
        duration,
        startTime: null,
        status: "waiting",
      };

      socket.join(gameId);
      io.to(gameId).emit("game-updated", games[gameId]);
    } catch (error) {
      console.error("Error creating game:", error);
      socket.emit("error", "An error occurred while creating the game!");
    }
  });

  // Tham gia game
  socket.on("join-game", ({ gameId, username }) => {
    const game = games[gameId];
    if (game) {
      game.players.push({ id: socket.id, username });
      socket.join(gameId);
      io.to(gameId).emit("game-updated", game);
    } else {
      socket.emit("error", "Game not found!");
    }
  });

  // Bắt đầu game
  socket.on("start-game", (gameId) => {
    const game = games[gameId];
    if (game) {
      game.status = "playing";
      game.startTime = Date.now();

      io.to(gameId).emit("start-game", {
        gameId,
        url: `/game/${gameId}/play`,
      });

      io.to(gameId).emit("game-updated", game);
    } else {
      socket.emit("error", "Game not found!");
    }
  });

  // Phát câu hỏi khi người chơi yêu cầu
  socket.on("play-game", async (gameId) => {
    const game = games[gameId];
    if (!game) {
      socket.emit("error", "Game not found!");
      return;
    }

    try {
      const quizzData = await Quizz.findOne({ _id: game.idgame });
      if (!quizzData) {
        socket.emit("error", "Questions not found for this game!");
        return;
      }

      const currentTime = Date.now();
      const elapsedTime = Math.floor((currentTime - game.startTime) / 1000);
      const remainingTime = Math.max(0, game.duration - elapsedTime);

      socket.emit("game-questions", {
        questions: quizzData.questions,
        duration: remainingTime,
      });
    } catch (error) {
      console.error("Error fetching questions:", error);
      socket.emit("error", "An error occurred while fetching questions!");
    }
  });

  // Nộp bài
  socket.on("submit-answers", async ({ gameId, answers, username }) => {
    const game = games[gameId];
    if (!game) {
      socket.emit("error", "Game not found!");
      return;
    }

    const player = game.players.find((p) => p.username === username);
    if (!player) {
      socket.emit("error", "Player not found!");
      return;
    }

    if (player.hasSubmitted) {
      socket.emit("already-submitted", {
        message: "You have already submitted your answers!",
      });
      return;
    }

    try {
      const quizzData = await Quizz.findOne({ _id: game.idgame });
      if (!quizzData) {
        socket.emit("error", "Questions not found for this game!");
        return;
      }

      let correctAnswersCount = 0;
      quizzData.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswersCount += 1;
        }
      });

      player.score = correctAnswersCount;
      player.hasSubmitted = true;

      socket.emit("game-result", {
        your_answers: answers,
        correctAnswersCount,
        totalQuestions: quizzData.questions.length,
        message: `You got ${correctAnswersCount} out of ${quizzData.questions.length} correct!`,
      });

      // io.to(gameId).emit("game-updated", game);
    } catch (error) {
      console.error("Error submitting answers:", error);
      socket.emit("error", "An error occurred while submitting answers!");
    }
  });

  // Yêu cầu tự động nộp bài và gửi tóm tắt
  socket.on("send-game-summary", (gameId) => {
    console.log("ĐÂY LÀ SỰ KIỆN KẾT THÚC BÀI THI");
    const game = games[gameId];
    if (!game) {
      socket.emit("error", "Game not found!");
      return;
    }

    console.log("Phát sự kiện auto-submit tới tất cả client");
    io.emit("auto-submit"); // Gửi sự kiện cho toàn bộ client

    // Đợi 5 giây để người chơi gửi bài
    setTimeout(() => {
      const summary = {
        gameId: game.gameId,
        idgame: game.idgame,
        players: game.players.map((player) => ({
          username: player.username,
          score: player.score || 0,
          hasSubmitted: player.hasSubmitted || false,
        })),
        playersCount: game.players.length,
        status: game.status,
        duration: game.duration,
        admin: game.admin,
      };

      console.log("Summary sent by admin:", socket.id);
      io.to(gameId).emit("game-summary", summary);
    }, 1000);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};
