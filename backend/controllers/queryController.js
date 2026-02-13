const { generateEmbedding } = require("../services/embeddingService");
const { retrieveRelevantChunks } = require("../services/retrievalService");

const querySOP = async (req, res) => {
  try {
    const { question, topK } = req.body;
    if (!question) return res.status(400).json({ message: "Question is required" });

    // Step 1: Generate embedding for user query
    const queryVector = await generateEmbedding(question);

    // Step 2: Retrieve relevant SOP chunks
    const chunks = await retrieveRelevantChunks(queryVector, topK || 5);

    res.json({ question, topChunks: chunks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error querying SOP" });
  }
};

module.exports = { querySOP };
