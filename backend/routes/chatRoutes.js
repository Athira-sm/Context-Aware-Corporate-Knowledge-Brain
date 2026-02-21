const express = require("express");
const { chatSOP } = require("../controllers/chatController");
const ChatMessage = require("../models/ChatMessage");

const router = express.Router();

router.post("/", chatSOP);

router.get("/history", async (req, res) => {
  const msgs = await ChatMessage.find().sort({ createdAt: 1 });
  res.json(msgs);
});

module.exports = router;