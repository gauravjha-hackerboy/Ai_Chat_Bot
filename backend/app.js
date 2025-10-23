import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.get('/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint is working. Use POST to login.' });
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
