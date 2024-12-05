const Quizz = require("../../models/Quizz/quizModel");
// Bộ nhớ tạm để lưu thông tin các phòng chơi
const games = {};

module.exports = (socket, io) => {
  // Lắng nghe sự kiện gửi tin nhắn
  socket.on("message", (msg) => {
    console.log(`Message from ${socket.id}: ${msg} đây là sự kiện Mes`);
    // Phát tin nhắn tới tất cả các client
    io.emit("message", `Broadcast from:  ${msg}`);
  });

  socket.on("create-game", ({ gameId, duration, idgame }) => {
    console.log(`Message from ${gameId}: ${duration} Tạo trò chơi ${idgame}`);
    games[gameId] = {
      gameId,
      idgame: idgame,
      players: [],
      admin: socket.id,
      duration,
      status: "waiting", // Trạng thái mặc định là waiting
    };

    socket.join(gameId);
    console.log("Thông tin phòng chơi: ", games);
    console.log(`Socket ${socket.id} joined room ${gameId}`);
    // Phát sự kiện game-updated tới tất cả client trong room
    io.to(gameId).emit("game-updated", games[gameId]);
  });

  //   socket.emit("game-updated", games[gameId])
  // Lắng nghe sự kiện tham gia phòng
  socket.on("join-game", ({ gameId, username }) => {
    if (games[gameId]) {
      games[gameId].players.push({ id: socket.id, username });
      socket.join(gameId);
      // Cập nhật danh sách người chơi

      console.log(`Socket ${socket.id} joined room ${gameId}`);

      io.to(gameId).emit("game-updated", games[gameId]);
    }
    console.log("CÁC NGƯỜI CHƠI ĐÃ THAM GIA: ", games);
  });

  // Lắng nghe sự kiện gửi tin nhắn trong phòng

  socket.on("start-game", (gameId) => {
    if (games[gameId]) {
      games[gameId].status = "playing";
      console.log("TRÒ CHƠI ĐÃ BẮT ĐẦU");

      // Phát sự kiện start-game tới tất cả client trong phòng
      io.to(gameId).emit("start-game", { gameId, url: `/game/${gameId}/play` });

      // Cập nhật trạng thái game
      io.to(gameId).emit("game-updated", games[gameId]);
    }
  });

  // socket.on("play-game", async (gameId) => {
  //   const game = games[gameId];
  //   if (!game) {
  //     socket.emit("error", "Game not found!");
  //     return;
  //   }

  //   try {
  //     // Truy vấn danh sách câu hỏi từ collection Quizz dựa vào idgame
  //     const quizzData = await Quizz.findOne({ _id: game.idgame });
  //     if (!quizzData) {
  //       socket.emit("error", "Questions not found for this game!");
  //       return;
  //     }

  //     // Phát câu hỏi về client
  //     socket.emit("game-questions", quizzData.questions);
  //     console.log("THÔNG TIN GAMEPLAY: ", quizzData.questions);
  //   } catch (error) {
  //     console.error("Error fetching questions:", error);
  //     socket.emit("error", "An error occurred while fetching questions!");
  //   }
  // });
  socket.on("play-game", async (gameId) => {
    const game = games[gameId]; // Lấy thông tin game từ bộ nhớ tạm
    if (!game) {
      socket.emit("error", "Game not found!"); // Trả về lỗi nếu không tìm thấy game
      return;
    }

    try {
      // Truy vấn danh sách câu hỏi từ MongoDB dựa vào idgame
      const quizzData = await Quizz.findOne({ _id: game.idgame });
      if (!quizzData) {
        socket.emit("error", "Questions not found for this game!"); // Trả về lỗi nếu không tìm thấy câu hỏi
        return;
      }

      // Phát câu hỏi và thời gian chơi về client
      socket.emit("game-questions", {
        questions: quizzData.questions, // Danh sách câu hỏi
        duration: game.duration, // Thời gian chơi (từ games)
      });

      console.log("THÔNG TIN GAMEPLAY: ", {
        questions: quizzData.questions,
        duration: game.duration,
      });
    } catch (error) {
      console.error("Error fetching questions:", error);
      socket.emit("error", "An error occurred while fetching questions!"); // Xử lý lỗi nếu truy vấn thất bại
    }
  });
  socket.on("get-game-status", (gameId) => {
    if (games[gameId]) {
      socket.emit("game-updated", games[gameId]); // Gửi thông tin trò chơi về client
    }
  });
  // Lắng nghe sự kiện ngắt kết nối
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};
