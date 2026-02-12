const mongoose=require("mongoose")
const SopDocumentSchema= new mongoose.Schema({
      fileName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})
module.exports = mongoose.model("SopDocument", SopDocumentSchema);