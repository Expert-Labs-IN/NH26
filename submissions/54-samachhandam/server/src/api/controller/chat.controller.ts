import { ChatService } from "@/service/chat.service";
import { Request, Response } from "express";

export const createChatSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const session_id = await ChatService.createChatSession(userId);
    res.status(201).json({
      success: true,
      message: "Chat session created successfully",
      data: { session_id: session_id.sessionId },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create chat session" });
  }
};

export const chatHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const chatSessionId = req.params.session_id;
    const { message } = req.body;

    const result = await ChatService.processMessage(
      userId,
      message,
      chatSessionId as string,
    );

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chat failed" });
  }
};
