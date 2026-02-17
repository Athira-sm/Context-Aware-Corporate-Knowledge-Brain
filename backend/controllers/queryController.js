const { generateEmbedding } = require("../services/embeddingService");
const { retrieveRelevantChunks } = require("../services/retrievalService");
const { generateAnswer } = require("../services/llmService");

const querySOP = async (req, res) => {
  try {
    const { question, topK } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const queryVector = await generateEmbedding(question);


    const chunks = await retrieveRelevantChunks(queryVector, topK || 5);


    const context = chunks
      .map(chunk => `From ${chunk.metadata?.filename || "document"}:\n${chunk.content}`)
      .join("\n\n──────────────────────────────\n\n");


    const prompt = [
      {
        role: "user",
        parts: [{
          text: `You are an AI assistant that answers ONLY from provided SOP context.

Rules:
- Use ONLY the provided context.
- Do NOT use outside knowledge.
- If answer is not supported by context → reply exactly:
"I don't know based on the available SOP documents."
- Always cite filename when giving steps.

Context:
${context}

Question: ${question}

Answer:`
        }]
      }
    ];


    const answer = await generateAnswer(prompt);


    res.json({
      question,
      answer,
      sources: chunks.map(c => ({
        filename: c.metadata?.filename || "unknown",
        chunkIndex: c.metadata?.chunkIndex,
        score: c.score || null
      }))
    });

  } catch (error) {
    console.error("Query SOP error:", error);
    res.status(500).json({
      message: "Error processing question",
      error: error.message
    });
  }
};

module.exports = { querySOP };