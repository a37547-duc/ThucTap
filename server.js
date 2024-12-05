const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createServer } = require("http");

const { initializeSocket } = require("./config/socket"); // Socket logic
const { connectToDatabase } = require("./config/mongo");
const messageRouter = require("./routes/socket.route"); // Import message routes
const quizzRouter = require("./routes/quizz.route");

// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng dotenv để load các biến môi trường từ tệp .env
dotenv.config();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:5050", // URL của frontend
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // Cho phép gửi cookie
  })
);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/v1/quizz", quizzRouter);

// Tích hợp Router
app.use("/api/v1/messages", messageRouter);

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
