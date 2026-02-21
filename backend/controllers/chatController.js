const { generateEmbedding } = require("../services/embeddingService");
const { retrieveRelevantChunks } = require("../services/retrievalService");
const { streamAnswer } = require("../services/llmStreamService");
const ChatMessage = require("../models/ChatMessage");

const chatSOP = async (req, res) => {
  try {
    const { question, topK } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ message: "Question required" });
    }

    const start = Date.now();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Save user message
    await ChatMessage.create({ role: "user", text: question });

    // 1. Generate embedding
    const queryVector = await generateEmbedding(question);
    const t1 = Date.now();

    // 2. Retrieve relevant chunks
    const chunks = await retrieveRelevantChunks(queryVector, topK || 5);
    const t2 = Date.now();

    const context = chunks
      .map(
        (c) =>
          `From ${c.metadata?.filename || "document"} (Page ${c.metadata?.page || "?"}):\n${c.content}`
      )
      .join("\n\n─────\n\n");

    // Stronger prompt — very strict instructions
    const prompt = [
      {
        role: "user",
        parts: [
          {
            text: `You are a strict SOP assistant with these mandatory rules:

1. Answer using ONLY the provided context. Never use external knowledge.
2. If the question cannot be answered completely and accurately from the context, you MUST reply with **exactly** this sentence and nothing else — no explanation, no apology, no extra words:
"I don't know based on the available SOP documents."
3. When you can answer: 
   - Be clear, concise, and professional
   - Use bullet points or numbered steps when explaining procedures
   - Cite the document name and page number where relevant
4. Never say "I am an AI", "sorry", "unfortunately", "based on my knowledge", etc.
5. Output only the final answer — no thinking aloud, no markdown code blocks unless needed for formatting.

Context:
${context}

Question: ${question}

Answer:`
          }
        ]
      }
    ];

    const sources = chunks.map((c) => ({
      filename: c.metadata?.filename || "unknown",
      page: c.metadata?.page || "?",
      chunkIndex: c.metadata?.chunkIndex
    }));

    let fullAnswer = "";

    // Stream answer
    await streamAnswer(prompt, res, (token) => {
      fullAnswer += token;
    });

    const t3 = Date.now();

    const trimmedAnswer = fullAnswer.trim();
    const isDontKnow =
      trimmedAnswer.toLowerCase().includes("i don't know") ||
      trimmedAnswer === "" ||
      trimmedAnswer.length < 8;

    // Only send sources if it's a real answer
    if (!isDontKnow) {
      res.write(`event: sources\n`);
      res.write(`data: ${JSON.stringify(sources)}\n\n`);
    }

    // Send metrics
    const metrics = {
      embeddingMs: t1 - start,
      retrievalMs: t2 - t1,
      llmMs: t3 - t2,
      totalMs: t3 - start
    };

    res.write(`event: metrics\n`);
    res.write(`data: ${JSON.stringify(metrics)}\n\n`);

    // Final done signal
    res.write(`data: [DONE]\n\n`);

    // Save bot message — include sources only if meaningful answer
    await ChatMessage.create({
      role: "bot",
      text: trimmedAnswer,
      sources: isDontKnow ? [] : sources
    });
  } catch (err) {
    console.error("chatSOP error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    } else {
      res.write(`data: [ERROR] Something went wrong\n\n`);
      res.end();
    }
  }
};

module.exports = { chatSOP };