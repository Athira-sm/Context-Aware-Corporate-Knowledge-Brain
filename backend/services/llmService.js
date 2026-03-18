const { GoogleGenAI } = require("@google/genai");
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, });
const generateAnswerStream = async (prompt, res) => {
  const stream = await genAI.models.generateContentStream({
    model:  "gemini-1.5-flash",
    contents: prompt,
  });
  for await (const chunk of stream) {
    const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      res.write(`data: ${text}\n\n`);
    }
  }
  res.write("data: [DONE]\n\n");
  res.end();
};
module.exports = { generateAnswerStream };