const SopChunk = require("../models/SopChunk");

const retrieveRelevantChunks = async (queryVector, topK = 3) => {
  try {
    const results = await SopChunk.aggregate([
      {
        $vectorSearch: {
          index: "opsmind-ai",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 30,   // reduced from 100 → faster search
          limit: topK
        }
      },
      {
        $project: {
          content: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    return results;
  } catch (error) {
    console.error("Vector search failed:", error.message);
    throw error;
  }
};

module.exports = { retrieveRelevantChunks };