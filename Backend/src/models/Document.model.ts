import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  textContent: { type: String },
  fileData: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now, index: true },
}, {
  timestamps: true,
});

documentSchema.index({ uploadedAt: -1 });

export const Document = mongoose.model("Document", documentSchema);
