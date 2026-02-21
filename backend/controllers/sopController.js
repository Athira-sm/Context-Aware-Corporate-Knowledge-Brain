const fs = require("fs");
const SopChunk = require("../models/SopChunk");
const { extractTextFromPDF, chunkTextWithPage } = require("../services/pdfService");
const { generateEmbedding } = require("../services/embeddingService");

const uploadSOP = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const pdfData = await extractTextFromPDF(
      fs.readFileSync(req.file.path)
    );

    const chunks = chunkTextWithPage(pdfData);

    const embeddings = await Promise.all(
      chunks.map(c => generateEmbedding(c.content))
    );

    for (let i = 0; i < chunks.length; i++) {
      await SopChunk.create({
        content: chunks[i].content,
        embedding: embeddings[i],
        metadata: {
          filename: req.file.originalname,
          chunkIndex: i,
          page: chunks[i].page
        }
      });
    }

    res.json({
      message: "PDF stored + embedded ✅",
      filename: req.file.originalname,
      totalChunks: chunks.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing PDF" });
  }
};

module.exports = { uploadSOP };