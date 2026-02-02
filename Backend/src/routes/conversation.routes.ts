import { Router } from "express";
import {
  getConversation,
  createConversation,
} from "../controllers/conversation.controller.ts";
import { getMessages, sendMessage } from "../controllers/message.controller.ts";

const router = Router();

router.get("/", getConversation);
router.post("/", createConversation);
router.get("/:id/messages", getMessages);
router.post("/:id/messages", sendMessage);

export default router;
