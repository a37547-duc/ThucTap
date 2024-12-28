const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createServer } = require("http");

const { initializeSocket } = require("./config/socket"); // Socket logic
const { connectToDatabase } = require("./config/mongo");

//////////
const messageRouter = require("./routes/socket.route"); // Import message routes
const quizzRouter = require("./routes/quizz.route");
const authRoutes = require("./routes/Auth/auth.route");

//////////////
const passport = require("passport");
const passportGoogle = require("./passports/passport.google");

// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng dotenv để load các biến môi trường từ tệp .env
dotenv.config();

// Cấu hình middleware CORS
app.use(
  cors({
    origin: "http://localhost:5050", // URL của frontend
    // origin: "https://quiz-9161f.web.app", // URL của frontend
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // Cho phép gửi cookie
  })
);

// app.use(
//   cors({
//     origin: [
//       "http://localhost:5050", // URL của frontend trên local
//       "https://quiz-9161f.web.app", // URL của frontend trên production
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Các phương thức HTTP được phép
//     credentials: true, // Cho phép gửi cookie hoặc thông tin xác thực
//   })
// );

// Middleware
app.use(bodyParser.json());

// TEST
app.set("trust proxy", 1);

passport.use("google", passportGoogle);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/v1/quizz", quizzRouter);

// Tích hợp Router
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/user", authRoutes);
// Tạo HTTP server từ Express
const httpServer = createServer(app);

// Khởi tạo Socket.IO
initializeSocket(httpServer);

// Lắng nghe trên cổng 5000
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  try {
    await connectToDatabase();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Không thể kết nối tới MongoDB:", error);
  }
});
