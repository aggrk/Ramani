import mongoose from "mongoose";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE;
const PORT = 8000;

const startServer = async () => {
  try {
    await mongoose.connect(DB);
    console.log("✅ DB connection successful!");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ DB connection failed:", error);
    process.exit(1);
  }
};

startServer();
