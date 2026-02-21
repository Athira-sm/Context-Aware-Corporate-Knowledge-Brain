const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const streamAnswer = async (prompt, res, onToken) => {
  try {
    const stream = await genAI.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let accumulated = "";

    for await (const chunk of stream) {
      const text =
        chunk?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!text) continue;

      // Gemini sends growing text → extract only new delta
      let delta = text;

      if (text.startsWith(accumulated)) {
        delta = text.slice(accumulated.length);
      }

      accumulated = text;

      if (!delta) continue;

      if (onToken) onToken(delta);

      res.write(`data: ${delta}\n\n`);
    }

  } catch (err) {
    console.error("LLM stream error:", err);
  }
};

module.exports = { streamAnswer };