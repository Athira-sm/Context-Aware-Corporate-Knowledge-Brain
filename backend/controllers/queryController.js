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
          text: `You are a precise SOP (Standard Operating Procedure) assistant for a company.
You must answer ONLY using the provided context excerpts.
Do NOT use external knowledge.
If the information is not clearly present in the context → answer exactly: "Information not found in SOP documents."

Always include the source filename (and section/page if available) when you refer to information.

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