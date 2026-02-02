import express, { type Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/database.config.js";
import documentRoutes from "./routes/document.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/documents", documentRoutes);
app.use("/api/conversations", conversationRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
