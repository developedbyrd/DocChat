import { Router } from "express";
import {
  getConversation,
  createConversation,
} from "../controllers/conversation.controller.js";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router = Router();

router.get("/", getConversation);
router.post("/", createConversation);
router.get("/:id/messages", getMessages);
router.post("/:id/messages", sendMessage);

export default router;
