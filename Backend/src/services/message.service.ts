import { Message } from "../models/Message.model.ts";
import { Conversation } from "../models/Conversation.model.ts";
import { Document } from "../models/Document.model.ts";

export const getMessagesByConversationId = async (conversationId: string) => {
  return await Message.find({ conversationId }).sort({ createdAt: 1 });
};

export const createMessage = async (
  conversationId: string,
  role: string,
  content: string
) => {
  const message = new Message({ conversationId, role, content });
  return await message.save();
};

export const generateAIResponse = async (
  conversationId: string,
  userContent: string
) => {
  const conversation = await Conversation.findById(conversationId);
  const document = await Document.findById(conversation?.documentId);

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that answers questions about the following document:\n\n${document?.textContent?.substring(
              0,
              8000
            )}`,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
      }),
    }
  );

  const data = await response.json();
  
  if (data.error) {
    console.error("OpenRouter API Error:", data.error);
    throw new Error(data.error.message || "AI service error");
  }

  const aiContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't process your request.";

  const aiResponse = new Message({
    conversationId,
    role: "assistant",
    content: aiContent,
    citations: [{ page: 1, text: "From document" }],
  });
  return await aiResponse.save();
};
