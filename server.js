// Import thư viện cần thiết
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const { connectToDatabase } = require("./config/mongo");
const QuizzRoutes = require("./routes/quizz.route");

// Khởi tạo ứng dụng express
const app = express();

// Sử dụng dotenv để load các biến môi trường từ tệp .env
dotenv.config();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5050", // URL của frontend
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // Cho phép gửi cookie và thông tin xác thực
  })
);
app.options("*", cors()); // Xử lý preflight request

app.use(express.json()); // Thay thế body-parser

app.set("trust proxy", 1); // Nếu dùng proxy/ngrok, bật tính năng này

// ROUTES
app.use("/api/v1/quizz", QuizzRoutes);

// Kết nối MongoDB và khởi động server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Không thể kết nối tới MongoDB:", error);
  }
};

startServer();
