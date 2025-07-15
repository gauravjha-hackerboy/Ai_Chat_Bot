import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Session from '../models/Session.js'; // Import the new Session model
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export const createNewChatSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = uuidv4();

    const placeholderMessage = new Message({
      user: userId,
      sessionId,
      chatTitle: 'New Chat',
      prompt: 'Session started',
      response: 'Welcome to a new chat session!',
      timestamp: new Date(),
    });
    await placeholderMessage.save();

    res.status(201).json({ sessionId });
  } catch (err) {
    console.error('Error creating new session:', err);
    res.status(500).json({ error: 'Failed to create new session' });
  }
};

export const getChatSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Message.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$sessionId",
          chatTitle: { $first: "$chatTitle" },
          lastMessageAt: { $first: "$timestamp" },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: 'Could not load chat history' });
  }
};

export const getSessionMessages = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const userId = req.user.id;
    const messages = await Message.find({ user: new mongoose.Types.ObjectId(userId), sessionId }).sort({ timestamp: 1 });
    res.json({ history: messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get chat messages' });
  }
};

export const chatWithGemini = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, sessionId } = req.body;

    const existingMessages = await Message.find({
      user: new mongoose.Types.ObjectId(userId),
      sessionId,
      prompt: { $ne: 'Session started' },
    });
    const chatTitle = existingMessages.length === 0 ? message.slice(0, 30) : undefined;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent',
      {
        contents: [{ role: 'user', parts: [{ text: message }] }],
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    const reply = response.data.candidates[0]?.content?.parts[0]?.text || 'No response';

    const msg = new Message({
      user: userId,
      sessionId,
      chatTitle,
      prompt: message,
      response: reply,
    });
    await msg.save();

    if (chatTitle) {
      await Message.updateOne(
        { user: new mongoose.Types.ObjectId(userId), sessionId, prompt: 'Session started' },
        { $set: { chatTitle } }
      );
    }

    res.json({ reply });
  } catch (err) {
    console.error('Gemini Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Gemini API error' });
  }
};

export const deleteChatSession = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const userId = req.user.id;
    const result = await Message.deleteMany({
      user: new mongoose.Types.ObjectId(userId),
      sessionId,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Session not found or already deleted' });
    }
    res.status(200).json({ message: 'Session deleted successfully', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

export const renameChatSession = async (req, res) => {
  const { sessionId } = req.params;
  const { newTitle } = req.body;
  try {
    const userId = req.user.id;
    if (!newTitle || newTitle.trim() === '') {
      return res.status(400).json({ error: 'New title cannot be empty' });
    }
    const result = await Message.updateMany(
      { user: new mongoose.Types.ObjectId(userId), sessionId },
      { $set: { chatTitle: newTitle.trim() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(200).json({ message: 'Session renamed successfully', updatedCount: result.modifiedCount });
  } catch (err) {
    console.error('Error renaming session:', err);
    res.status(500).json({ error: 'Failed to rename session' });
  }
};