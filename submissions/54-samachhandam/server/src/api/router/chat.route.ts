import express from "express";
import { chatHandler, createChatSession } from "../controller/chat.controller";
import authCheck from "../middleware/authCheck";

const chatRouter = express.Router();

chatRouter.post("/:session_id", authCheck ,  chatHandler);
chatRouter.post("/", authCheck, createChatSession);

export default chatRouter;