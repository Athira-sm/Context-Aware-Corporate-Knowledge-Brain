const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateEmbedding = async (text) => {
  try {
    const response = await genAI.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      // Optional improvements: taskType for RAG, smaller dims for storage
      // taskType: "RETRIEVAL_DOCUMENT",
      // outputDimensionality: 768,
    });

    return response.embeddings[0].values;
  } catch (error) {
    console.error("Embedding error:", error.message);
    throw error;
  }
};

module.exports = { generateEmbedding };