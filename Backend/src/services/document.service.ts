import fs from "fs";
import { PDFParse } from "pdf-parse";
import { Document } from "../models/Document.model.js";
import { Conversation } from "../models/Conversation.model.js";
import { Message } from "../models/Message.model.js";

export const createDocument = async (file: Express.Multer.File) => {
  const dataBuffer = fs.readFileSync(file.path);
  const base64Data = dataBuffer.toString("base64");

  const parser = new PDFParse({ data: dataBuffer });
  let textContent = "";
  try {
    const pdfText = await parser.getText();
    textContent = pdfText.text;
  } finally {
    await parser.destroy();
  }

  const doc = new Document({
    title: file.originalname,
    filePath: file.path,
    fileSize: file.size,
    textContent,
    fileData: base64Data,
  });

  const saved = await doc.save();

  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  return saved;
};

export const getAllDocuments = async () => {
  return await Document.find().sort({ uploadedAt: -1 });
};

export const getDocumentById = async (id: string) => {
  return await Document.findById(id);
};

export const removeDocument = async (id: string) => {
  const doc = await Document.findById(id);
  if (!doc) return null;

  const conversations = await Conversation.find({ documentId: id });
  for (const conv of conversations) {
    await Message.deleteMany({ conversationId: conv._id });
  }
  await Conversation.deleteMany({ documentId: id });

  return await Document.findByIdAndDelete(id);
};
