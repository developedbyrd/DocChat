import { Conversation } from "../models/Conversation.model.js";

export const findConversationByDocumentId = async (documentId: string) => {
  return await Conversation.findOne({ documentId });
};

export const createConversation = async (documentId: string) => {
  const existing = await Conversation.findOne({ documentId });
  if (existing) return existing;
  const conv = new Conversation({ documentId });
  return await conv.save();
};
