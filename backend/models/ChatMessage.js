const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  role: String,
  text: String,
  sources: [
    {
      filename: String,
      page: Number,
      chunkIndex: Number
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ChatMessage", chatSchema);