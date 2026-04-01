// import { Message } from "../models/Message.model.js";
// import { Conversation } from "../models/Conversation.model.js";
// import { Document } from "../models/Document.model.js";
// import axios from "axios";

// export const getMessagesByConversationId = async (conversationId: string) => {
//   return await Message.find({ conversationId }).sort({ createdAt: 1 });
// };

// export const createMessage = async (
//   conversationId: string,
//   role: string,
//   content: string
// ) => {
//   const message = new Message({ conversationId, role, content });
//   return await message.save();
// };

// export const generateAIResponse = async (
//   conversationId: string,
//   userContent: string
// ) => {
//   const conversation = await Conversation.findById(conversationId);
//   const document = await Document.findById(conversation?.documentId);

//   if (!process.env.OPENROUTER_API_KEY) {
//     throw new Error("OPENROUTER_API_KEY not configured");
//   }

//   console.log("API Key exists:", !!process.env.OPENROUTER_API_KEY);
//   console.log("API Key starts with:", process.env.OPENROUTER_API_KEY?.substring(0, 10));

//   const { data } = await axios.post(
//     "https://openrouter.ai/api/v1/chat/completions",
//     {
//       model: "meta-llama/llama-3.2-3b-instruct:free",
//       messages: [
//         {
//           role: "system",
//           content: `You are a helpful assistant that answers questions about the following document:\n\n${document?.textContent?.substring(
//             0,
//             8000
//           )}`,
//         },
//         {
//           role: "user",
//           content: userContent,
//         },
//       ],
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//         "HTTP-Referer": "https://docchat-neon.vercel.app",
//         "X-Title": "DocChat",
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   console.error("OpenRouter Response:", JSON.stringify(data, null, 2));
  
//   if (data.error) {
//     console.error("OpenRouter API Error:", data.error);
//     throw new Error(data.error.message || "AI service error");
//   }

//   const aiContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't process your request.";

//   const aiResponse = new Message({
//     conversationId,
//     role: "assistant",
//     content: aiContent,
//     citations: [{ page: 1, text: "From document" }],
//   });
//   return await aiResponse.save();
// };






import axios from "axios";
import { Message } from "../models/Message.model.js";
import { Conversation } from "../models/Conversation.model.js";
import { Document } from "../models/Document.model.js";
import {
  wantsPdfGeneration,
  fetchPdfPlanFromAI,
  buildPdfBuffer,
  saveGeneratedPdf,
} from "./pdfGeneration.service.js";

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
  const docText = document?.textContent ?? "";

  if (wantsPdfGeneration(userContent)) {
    try {
      const plan = await fetchPdfPlanFromAI(docText, userContent);
      const buffer = await buildPdfBuffer(plan);
      const fileName = await saveGeneratedPdf(buffer);
      const summary = `I've generated a new PDF titled "${plan.title}" with ${plan.sections.length} section(s) based on your request and the current document. Use the Download PDF button below to save it.`;
      const aiResponse = new Message({
        conversationId,
        role: "assistant",
        content: summary,
        citations: [],
        generatedPdfFileName: fileName,
      });
      return await aiResponse.save();
    } catch (pdfErr) {
      console.error("PDF generation failed, falling back to chat:", pdfErr);
    }
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that answers questions about the following document:\n\n${docText.substring(
              0,
              8000
            )}`,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiContent = response.data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't process your request.";

    const aiResponse = new Message({
      conversationId,
      role: "assistant",
      content: aiContent,
      citations: [{ page: 1, text: "From document" }],
    });
    return await aiResponse.save();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("OpenRouter API Error:", error.response?.data?.error || error.message);
      throw new Error(error.response?.data?.error?.message || "AI service error");
    }
    console.error("Unexpected error:", error);
    throw error;
  }
};