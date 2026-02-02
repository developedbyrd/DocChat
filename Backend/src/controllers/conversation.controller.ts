import type { Request, Response } from "express";
import * as conversationService from "../services/conversation.service.ts";

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.query;
    const conv = await conversationService.findConversationByDocumentId(
      documentId as string
    );
    res.json(conv);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.body;
    const conv = await conversationService.createConversation(documentId);
    res.json(conv);
  } catch (error) {
    res.status(500).json({ error: "Failed to create conversation" });
  }
};
