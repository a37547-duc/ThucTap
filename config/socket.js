const { Server } = require("socket.io");
const socketEvents = require("./event/socketEvents"); // Import các sự kiện

let io;

const initializeSocket = (httpServer) => {
  // Tạo Socket.IO server gắn vào HTTP server
  io = new Server(httpServer, {
    cors: {
      // origin: "http://localhost:5050",
      origin: "https://quizzlet-19y7.onrender.com",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  // Lắng nghe sự kiện kết nối
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Đăng ký các sự kiện cho socket
    socketEvents(socket, io); // Gắn tất cả sự kiện từ file `socketEvents.js`
  });

  return io;
};

// const initializeSocket = (httpServer) => {
//   // Tạo Socket.IO server gắn vào HTTP server
//   io = new Server(httpServer, {
//     cors: {
//       origin: [
//         "http://localhost:5050", // Cho phép frontend chạy trên localhost
//         "https://quiz-9161f.web.app", // Cho phép frontend đã deploy
//       ],
//       methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//       credentials: true, // Cho phép gửi thông tin xác thực (cookie)
//     },
//   });
// };

module.exports = { initializeSocket, io };
