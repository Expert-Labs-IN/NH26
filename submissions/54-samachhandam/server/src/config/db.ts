import mongoose from "mongoose";
import config from "./config";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI!);
    console.log("[MongoDB] MongoDB Connected successfully ✅");
  } catch (error) {
    console.error("[MongoDB] DB connection failed:", error);
  }
};