import { Router } from "express";
import { upload } from "../config/multer.config.js";
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} from "../controllers/document.controller.js";
import { Document } from "../models/Document.model.js";

const router = Router();

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", getDocuments);
router.get("/:id", getDocument);
router.get("/:id/download", async (req, res) => {
  const doc = await Document.findById(req.params.id as string);
  if (!doc) return res.status(404).json({ error: "Document not found" });
  
  const buffer = Buffer.from(doc.fileData, 'base64');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${doc.title}"`);
  res.send(buffer);
});
router.delete("/:id", deleteDocument);

export default router;
