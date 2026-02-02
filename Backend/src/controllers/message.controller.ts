import type { Request, Response } from "express";
import * as messageService from "../services/message.service.js";

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await messageService.getMessagesByConversationId(
      req.params.id as string
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { role, content } = req.body;
    const message = await messageService.createMessage(
      req.params.id as string,
      role,
      content
    );

    if (role === "user") {
      const aiResponse = await messageService.generateAIResponse(
        req.params.id as string,
        content
      );
      res.json({ userMessage: message, aiResponse });
    } else {
      res.json(message);
    }
  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Failed to send message" });
  }
};
