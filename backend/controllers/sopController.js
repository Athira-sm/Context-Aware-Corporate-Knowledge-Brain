const SopChunk = require("../models/SopChunk");
const { extractTextFromPDF, chunkText } = require("../services/pdfService");
const { generateEmbedding } = require("../services/embeddingService");

const uploadSOP = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const text = await extractTextFromPDF(req.file.buffer);
    const chunks = chunkText(text);

    const embeddings = await Promise.all(chunks.map((chunk) => generateEmbedding(chunk)));
    console.log("Embedding length:", embeddings[0].length);

    
    for (let i = 0; i < chunks.length; i++) {
      await SopChunk.create({
        content: chunks[i],
        embedding: embeddings[i],
        metadata: {
          filename: req.file.originalname,
          chunkIndex: i,
        },
      });
    }

    res.json({
      message: "PDF processed and stored with embeddings ✅",
      totalChunks: chunks.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing PDF" });
  }
};

module.exports = { uploadSOP };