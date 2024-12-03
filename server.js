// Import thư viện cần thiết
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

const { connectToDatabase } = require("./config/mongo");

const QuizzRoutes = require("./routes/quizz.route");

// Khởi tạo ứng dụng express
const app = express();

// Sử dụng dotenv để load các biến môi trường từ tệp .env
dotenv.config();

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(
  cors({
    // origin: process.env.URL_CLIENT, //
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.set("trust proxy", 1);

// ROUTES
app.use("/api/v1/quizz", QuizzRoutes);

// Lắng nghe trên cổng 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + 5000);
  try {
    connectToDatabase();
  } catch (error) {
    console.error("Không thể kết nối tới Ngrok:", error);
  }
});
