import fs from "fs";
import pdf from "pdf-parse";
import { Document } from "../models/Document.model.ts";
import { Conversation } from "../models/Conversation.model.ts";
import { Message } from "../models/Message.model.ts";

export const createDocument = async (file: Express.Multer.File) => {
  const dataBuffer = fs.readFileSync(file.path);
  const pdfData = await pdf(dataBuffer);
  const base64Data = dataBuffer.toString('base64');

  const doc = new Document({
    title: file.originalname,
    filePath: file.path,
    fileSize: file.size,
    textContent: pdfData.text,
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
