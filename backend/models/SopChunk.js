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


sopChunkSchema.index({ embedding: 1 });

module.exports = mongoose.model("SopChunk", sopChunkSchema);