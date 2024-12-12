// const Quizz = require("../../models/Quizz/quizModel");
// // Bộ nhớ tạm để lưu thông tin các phòng chơi
// const games = {};

// module.exports = (socket, io) => {
//   // Lắng nghe sự kiện gửi tin nhắn
//   socket.on("message", (msg) => {
//     console.log(`Message from ${socket.id}: ${msg} đây là sự kiện Mes`);
//     // Phát tin nhắn tới tất cả các client
//     io.emit("message", `Broadcast from:  ${msg}`);
//   });

//   socket.on("create-game", ({ gameId, duration, idgame }) => {
//     console.log(`Message from ${gameId}: ${duration} Tạo trò chơi ${idgame}`);
//     games[gameId] = {
//       gameId,
//       idgame: idgame,
//       players: [],
//       admin: socket.id,
//       duration,
//       status: "waiting", // Trạng thái mặc định là waiting
//     };

//     socket.join(gameId);
//     console.log("Thông tin phòng chơi: ", games);
//     console.log(`Socket ${socket.id} joined room ${gameId}`);
//     // Phát sự kiện game-updated tới tất cả client trong room
//     io.to(gameId).emit("game-updated", games[gameId]);
//   });

//   //   socket.emit("game-updated", games[gameId])
//   // Lắng nghe sự kiện tham gia phòng
//   socket.on("join-game", ({ gameId, username }) => {
//     if (games[gameId]) {
//       games[gameId].players.push({ id: socket.id, username });
//       socket.join(gameId);
//       // Cập nhật danh sách người chơi

//       console.log(`Socket ${socket.id} joined room ${gameId}`);

//       io.to(gameId).emit("game-updated", games[gameId]);
//     }
//     console.log("CÁC NGƯỜI CHƠI ĐÃ THAM GIA: ", games);
//   });

//   // Lắng nghe sự kiện gửi tin nhắn trong phòng

//   socket.on("start-game", (gameId) => {
//     if (games[gameId]) {
//       games[gameId].status = "playing";
//       console.log("TRÒ CHƠI ĐÃ BẮT ĐẦU BỞI: ", socket.id);

//       // Phát sự kiện start-game tới tất cả client trong phòng
//       io.to(gameId).emit("start-game", { gameId, url: `/game/${gameId}/play` });

//       // Cập nhật trạng thái game
//       io.to(gameId).emit("game-updated", games[gameId]);
//     }
//   });

//   socket.on("play-game", async (gameId) => {
//     socket.join(gameId);
//     console.log("Thông id khi chơi game cũ: ", socket.id);

//     const game = games[gameId]; // Lấy thông tin game từ bộ nhớ tạm
//     if (!game) {
//       socket.emit("error", "Game not found!"); // Trả về lỗi nếu không tìm thấy game
//       return;
//     }

//     try {
//       // Truy vấn danh sách câu hỏi từ MongoDB dựa vào idgame
//       const quizzData = await Quizz.findOne({ _id: game.idgame });
//       if (!quizzData) {
//         socket.emit("error", "Questions not found for this game!"); // Trả về lỗi nếu không tìm thấy câu hỏi
//         return;
//       }

//       // Phát câu hỏi và thời gian chơi về client
//       socket.emit("game-questions", {
//         questions: quizzData.questions, // Danh sách câu hỏi
//         duration: game.duration, // Thời gian chơi (từ games)
//       });
//       console.log("Thông tin ID: ", socket.id);
//     } catch (error) {
//       console.error("Error fetching questions:", error);
//       socket.emit("error", "An error occurred while fetching questions!"); // Xử lý lỗi nếu truy vấn thất bại
//     }
//   });

//   socket.on("submit-answers", async ({ gameId, answers, username }) => {
//     socket.join(gameId); // Đảm bảo người chơi tham gia lại phòng khi họ gửi câu trả lời

//     const game = games[gameId]; // Lấy thông tin game từ bộ nhớ tạm

//     if (!game) {
//       socket.emit("error", "Game not found!"); // Trả về lỗi nếu game không tồn tại
//       return;
//     }

//     const player = game.players.find((player) => player.username === username);
//     if (!player) {
//       socket.emit("error", "Player not found in the game!");
//       return;
//     }

//     // Kiểm tra xem người chơi đã nộp câu trả lời chưa
//     if (player.hasSubmitted) {
//       // Gửi một sự kiện "already-submitted" với thông báo và dữ liệu về người chơi
//       socket.emit("already-submitted", {
//         message: "You have already submitted your answers!",
//         username: player.username,
//       });
//       return;
//     }

//     if (game.status !== "playing") {
//       socket.emit("error", "Game is not currently active!");
//       return;
//     }

//     try {
//       // Truy vấn danh sách câu hỏi từ MongoDB
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

//       // Cập nhật điểm cho người chơi
//       const playerIndex = game.players.findIndex(
//         (player) => player.username === username
//       );
//       if (playerIndex !== -1) {
//         game.players[playerIndex].id = socket.id;
//         game.players[playerIndex].score = correctAnswersCount;
//         game.players[playerIndex].hasSubmitted = true; // Đánh dấu đã nộp câu trả lời
//       } else {
//         socket.emit("error", "Player not found in the game!");
//         return;
//       }

//       // Gửi kết quả cho người chơi
//       socket.emit("game-result", {
//         correctAnswersCount,
//         totalQuestions: quizzData.questions.length,
//         message: `You got ${correctAnswersCount} out of ${quizzData.questions.length} correct!`,
//         answers: answers,
//       });

//       // Cập nhật danh sách người chơi cho tất cả mọi người trong game
//       io.to(gameId).emit("game-updated", game);
//     } catch (error) {
//       console.error("Error fetching questions:", error);
//       socket.emit("error", "An error occurred while fetching questions!");
//     }
//   });

//   socket.on("game-summary", () => {
//     // Trả về thông tin tóm tắt của tất cả các phòng chơi
//     const summary = Object.values(games).map((game) => ({
//       gameId: game.gameId,
//       idgame: game.idgame,
//       player: game.players,
//       playersCount: game.players.length, // Số người chơi trong phòng
//       status: game.status, // Trạng thái phòng (waiting/playing)
//       duration: game.duration, // Thời gian chơi
//       admin: game.admin, // ID của người quản trị phòng
//     }));

//     // Gửi thông tin tóm tắt tới client yêu cầu
//     socket.emit("game-summary", summary);
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
      // Lấy thời gian làm bài từ collection dựa trên `idgame`
      const quizzData = await Quizz.findOne({ _id: idgame });
      if (!quizzData) {
        socket.emit("error", "Quiz not found!");
        return;
      }

      // const duration = quizzData.duration; // Thời gian làm bài từ DB

      const duration = 360000;
      games[gameId] = {
        gameId,
        idgame,
        players: [],
        admin: socket.id,
        duration, // Lưu thời gian làm bài
        startTime: null, // Thời gian bắt đầu
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
      game.startTime = Date.now(); // Lưu thời gian bắt đầu

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
      const elapsedTime = Math.floor((currentTime - game.startTime) / 1000); // Thời gian đã trôi qua (giây)
      const remainingTime = Math.max(0, game.duration - elapsedTime);

      socket.emit("game-questions", {
        questions: quizzData.questions,
        duration: remainingTime, // Gửi thời gian còn lại
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

      io.to(gameId).emit("game-updated", game);
    } catch (error) {
      console.error("Error submitting answers:", error);
      socket.emit("error", "An error occurred while submitting answers!");
    }
  });

  socket.on("send-game-summary", (gameId) => {
    const game = games[gameId]; // Lấy thông tin game

    if (!game) {
      socket.emit("error", "Game not found!");
      return;
    }

    // Chuẩn bị thông tin tóm tắt
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

    console.log("Tóm tắt đã được gửi bởi: ", socket.id);

    // Phát tóm tắt tới tất cả mọi người trong phòng, bao gồm admin
    io.emit("game-summary", summary);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};
