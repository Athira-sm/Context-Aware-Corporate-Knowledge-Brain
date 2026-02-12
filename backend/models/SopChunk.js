const mongoose = require("mongoose");

const sopChunkSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  metadata: {
    type: Object,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for vector search (if using MongoDB Atlas Vector Search, create atlasSearch index separately)
// For basic cosine similarity queries, this helps
sopChunkSchema.index({ embedding: 1 });

module.exports = mongoose.model("SopChunk", sopChunkSchema);