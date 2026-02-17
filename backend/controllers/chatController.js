const { generateEmbedding } = require("../services/embeddingService");
const { retrieveRelevantChunks } = require("../services/retrievalService");
const { streamAnswer } = require("../services/llmStreamService");

const chatSOP = async (req, res) => {
  try {
    const { question, topK } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question required" });
    }

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // 1️⃣ embedding
    const queryVector = await generateEmbedding(question);

    // 2️⃣ retrieve
    const chunks = await retrieveRelevantChunks(queryVector, topK || 5);

    // 3️⃣ context
    const context = chunks
      .map(c => `From ${c.metadata?.filename}:\n${c.content}`)
      .join("\n\n-----\n\n");

    // 4️⃣ prompt
    const prompt = [
      {
        role: "user",
        parts: [{
          text: `You are an SOP assistant.
Answer ONLY from context.
If missing say: "I don't know."

Context:
${context}

Question: ${question}

Answer:`
        }]
      }
    ];

    // 5️⃣ stream to client
    await streamAnswer(prompt, res);

  } catch (err) {
    console.error(err);
    res.end();
  }
};

module.exports = { chatSOP };
