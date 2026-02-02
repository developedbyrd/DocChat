import type { Request, Response } from "express";
import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  removeDocument,
} from "../services/document.service.js";

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const doc = await createDocument(req.file);
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: "Failed to save document" });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const docs = await getAllDocuments();
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

export const getDocument = async (req: Request, res: Response) => {
  try {
    const doc = await getDocumentById(req.params.id as string);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch document" });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    await removeDocument(req.params.id as string);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete document" });
  }
};
