import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://ai-chat-bot-m1jb.onrender.com', // or your frontend URL
  credentials: true
}));
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'welcome to backend' });
});
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB Error:", err));
