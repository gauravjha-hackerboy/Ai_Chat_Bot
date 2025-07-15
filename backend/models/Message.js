import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  chatTitle: { type: String }, // First message text or custom label
  prompt: String,
  response: String,
  timestamp: { type: Date, default: Date.now }
});
export default mongoose.model('Message', messageSchema);