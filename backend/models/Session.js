import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true, unique: true },
  chatTitle: { type: String, default: 'New Chat' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Session', sessionSchema);