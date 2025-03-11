const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'trainer' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isTrainer: { type: Boolean, required: true },
});

module.exports = mongoose.model('Message', messageSchema);
