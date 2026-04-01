import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
    index: true,
  },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  citations: [{ page: Number, text: String }],
  /** Server-stored filename under uploads/generated/ when the assistant created a downloadable PDF */
  generatedPdfFileName: { type: String },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model("Message", messageSchema);
