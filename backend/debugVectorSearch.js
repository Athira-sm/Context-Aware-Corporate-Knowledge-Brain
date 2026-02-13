// debugVectorSearch.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const SopChunk = require("./models/SopChunk");
const { generateEmbedding } = require("./services/embeddingService");
const { retrieveRelevantChunks } = require("./services/retrievalService");


dotenv.config();
(async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 2️⃣ Check stored SOP chunks
    const chunks = await SopChunk.find({});
    if (chunks.length === 0) {
      console.log("❌ No SOP chunks found in DB. Upload PDFs first!");
      process.exit();
    }

    console.log(`🗂 Total chunks in DB: ${chunks.length}`);
    console.log("Embedding length of first chunk:", chunks[0].embedding.length);

    // 3️⃣ Generate embedding for test query
    const question = "How do I process a refund?";
    const queryVector = await generateEmbedding(question);
    console.log("Query embedding length:", queryVector.length);

    // 4️⃣ Retrieve top chunks
    const topChunks = await retrieveRelevantChunks(queryVector, 5);
    console.log(`Retrieved chunks: ${topChunks.length}`);

    if (topChunks.length === 0) {
      console.log("⚠️ No chunks retrieved! Likely a vector index / dimension mismatch.");
    } else {
      console.log("Top retrieved chunks (preview):");
      topChunks.forEach((c, i) => {
        console.log(`\n[Chunk ${i + 1}]`);
        console.log("Content:", c.content.slice(0, 200) + "...");
        console.log("Score:", c.score);
        console.log("Metadata:", c.metadata);
      });
    }

    process.exit();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
