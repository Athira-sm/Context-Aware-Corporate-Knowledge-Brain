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

    const q = question.toLowerCase().trim();

    // ⚡ instant response for greetings (no AI call)
    if (["hi", "hello", "hey"].includes(q)) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      res.write(`data: Hello! Ask me a question about the SOP.\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
      return;
    }

    const start = Date.now();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await ChatMessage.create({
      role: "user",
      text: question
    });

    // ⚡ Generate embedding
    const queryVector = await generateEmbedding(question);
    const t1 = Date.now();

    // ⚡ Retrieve chunks
    const chunks = await retrieveRelevantChunks(queryVector, topK || 3);
    const t2 = Date.now();

    // ⚡ Build smaller context for faster LLM
    const context = chunks
      .map(
        (c) =>
          `From ${c.metadata?.filename || "document"} (Page ${
            c.metadata?.page || "?"
          }):\n${c.content.slice(0, 500)}`
      )
      .join("\n\n─────\n\n");

    const prompt = [
      {
        role: "user",
        parts: [
          {
            text: `You are a strict SOP assistant.

Rules:
1. Answer ONLY using the provided context.
2. If the answer is not in the context reply exactly:
"I don't know."
3. Keep answers concise.
4. Cite filename and page if possible.

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

    // ⚡ Stream answer from Gemini
    await streamAnswer(prompt, res, (token) => {
      fullAnswer += token;
    });

    const t3 = Date.now();

    const trimmedAnswer = fullAnswer.trim();

    const isDontKnow =
      trimmedAnswer.toLowerCase().includes("i don't know") ||
      trimmedAnswer.length < 5;

    // ⚡ Send sources
    if (!isDontKnow) {
      res.write(`event: sources\n`);
      res.write(`data: ${JSON.stringify(sources)}\n\n`);
    }

    // ⚡ Performance metrics
    const metrics = {
      embeddingMs: t1 - start,
      retrievalMs: t2 - t1,
      llmMs: t3 - t2,
      totalMs: t3 - start
    };

    res.write(`event: metrics\n`);
    res.write(`data: ${JSON.stringify(metrics)}\n\n`);

    res.write(`data: [DONE]\n\n`);
    res.end();

    // ⚡ Save AI message
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
      res.write(`data: [ERROR]\n\n`);
      res.end();
    }
  }
};

module.exports = { chatSOP };