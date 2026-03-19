const fs = require("fs");
const SopChunk = require("../models/SopChunk");
const { extractTextFromPDF, chunkTextWithPage } = require("../services/pdfService");
const { generateEmbedding } = require("../services/embeddingService");

const uploadSOP = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const filename = req.file.filename;

    console.log("Processing PDF:", filename);

    // read PDF
    const pdfData = await extractTextFromPDF(fs.readFileSync(filePath));

    // split into chunks
    const chunks = chunkTextWithPage(pdfData);

    console.log("Total chunks:", chunks.length);

    // generate embeddings
    const embeddings = await Promise.all(
      chunks.map((c) => generateEmbedding(c.content))
    );

    // prepare bulk documents
    const docs = chunks.map((chunk, i) => ({
      content: chunk.content,
      embedding: embeddings[i],
      metadata: {
        filename: filename,
        chunkIndex: i,
        page: chunk.page
      }
    }));

    // insert many (faster)
    await SopChunk.insertMany(docs);

    res.json({
      message: "PDF uploaded and processed successfully ✅",
      filename: filename,
      totalChunks: chunks.length
    });

  } catch (error) {
    console.error("Upload error:", error);

    res.status(500).json({
      message: "Error processing PDF",
      error: error.message
    });
  }
};
const deleteSOP = async (req, res) => {
  try {
    const { filename } = req.params;

    // remove PDF from uploads folder
    const filePath = path.join(__dirname, "../uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // remove from database chunks
    await SopChunk.deleteMany({ "metadata.filename": filename });

    res.json({ message: `${filename} deleted successfully ✅` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting PDF", error: error.message });
  }
};

module.exports = { uploadSOP,deleteSOP };