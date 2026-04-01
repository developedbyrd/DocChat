import fs from "fs";
import type { Request, Response } from "express";
import { Message } from "../models/Message.model.js";
import * as messageService from "../services/message.service.js";
import { getGeneratedPdfPath } from "../services/pdfGeneration.service.js";

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

export const downloadGeneratedPdf = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.id as string;
    const messageId = req.params.messageId as string;
    const msg = await Message.findOne({
      _id: messageId,
      conversationId,
      generatedPdfFileName: { $exists: true, $ne: null },
    });
    if (!msg?.generatedPdfFileName) {
      return res.status(404).json({ error: "PDF not found" });
    }
    const filePath = getGeneratedPdfPath(msg.generatedPdfFileName);
    if (!filePath) {
      return res.status(404).json({ error: "PDF file missing" });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="generated-${messageId}.pdf"`,
    );
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("downloadGeneratedPdf:", error);
    res.status(500).json({ error: "Failed to download PDF" });
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
