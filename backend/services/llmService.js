const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateAnswer = async (prompt) => {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",          
      contents: prompt,
      generationConfig: {
        temperature: 0.2,                 
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response text received from Gemini");
    }

    return text;
  } catch (error) {
    console.error("LLM error:", error);
    throw error;
  }
};

module.exports = { generateAnswer };