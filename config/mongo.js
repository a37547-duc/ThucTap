const mongoose = require("mongoose");
const uri =
  "mongodb+srv://anhtupeo1234:bacdaibang1897@cluster0.erd7j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectToDatabase() {
  try {
    // Kết nối tới MongoDB bằng Mongoose
    await mongoose.connect(uri, {});
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (err) {
    console.error("Error connecting to MongoDB Atlas:", err);
  }
}

module.exports = { connectToDatabase };
