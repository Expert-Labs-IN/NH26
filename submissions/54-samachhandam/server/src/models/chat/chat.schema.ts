import { IChat } from "@/types/interface/chat.interface";
import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema<IChat>({
  userId: String,
  sessionId: String,
  messages: [
    {
      role: String, // "user" | "assistant"
      content: String,
    }
  ]
}, { timestamps: true });

export default ChatSchema;