import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
    unique: true,
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

export const Conversation = mongoose.model("Conversation", conversationSchema);
